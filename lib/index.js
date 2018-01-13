import CryptoJS from 'crypto-js';

const blockchain = [];
const genesisHash = 'd00efbf11ff7a0fecd3bf05c105d51da1a4f3bd75410b5202977d94000423f6b';
const signature = genesisHash.slice(0, 2);

// DOM nodes
const $blockchain = document.querySelector('#blockchain');
const $blockTemplate = document.querySelector('#block-template');
const $newBlock = document.querySelector('#button-new-block');

// Custom hash change event
const hashChangeEvent = new Event('hashChange');

// Determine if a hash is "signed"
const validateHash = hash => hash.indexOf(signature) === 0;

// Get the previous hash, or, if one doesn't exist, use the genesis hash
function getPreviousHash() {
  const previousBlock = blockchain[blockchain.length - 1];
  const previousHash = previousBlock ? previousBlock.hash : genesisHash;

  return previousHash;
}

// Render the entire chain
function render(blockchain) {
  const fragment = document.createDocumentFragment();

  blockchain.forEach(block => fragment.appendChild(block.render()));

  $blockchain.innerHTML = '';
  $blockchain.appendChild(fragment);

  document.body.style.width = `${blockchain.length * 630}px`;
}

class Block {
  constructor(index, previousHash) {
    this.index = index;
    this.nonce = '0';
    this.data = '';
    this.previousHash = previousHash;
    this.hash = this.generateHash();

    this.$el = $blockTemplate.cloneNode(true);
    this.$el.id = `block-${index}`;

    const $ = selector => this.$el.querySelector(selector);
    this.$index = $('.input-index');
    this.$nonce = $('.input-nonce');
    this.$data = $('.input-data');
    this.$previousHash = $('.input-previous-hash');
    this.$hash = $('.input-hash');
    this.$mine = $('.button-mine');

    this.getHashContent = this.getHashContent.bind(this);
    this.onPreviousHashChange = this.onPreviousHashChange.bind(this);
    this.onDataChange = this.onDataChange.bind(this);
    this.onMineClick = this.onMineClick.bind(this);
    this.render = this.render.bind(this);

    this.$data.addEventListener('input', this.onDataChange);
    this.$mine.addEventListener('click', this.onMineClick);

    if (this.index > 0) {
      const $previousBlock = document.querySelector(`#block-${this.index - 1}`);
      const $previousBlockHash = $previousBlock.querySelector('.input-hash');
      $previousBlockHash.addEventListener('hashChange', this.onPreviousHashChange);
    }
  }

  getHashContent() {
    return this.index + this.nonce + this.data + this.previousHash;
  }

  generateHash() {
    return CryptoJS.SHA256(this.getHashContent()).toString();
  }

  generateValidHash() {
    const hash = CryptoJS.SHA256(this.getHashContent()).toString();
    const hashValid = validateHash(hash);

    if (!hashValid) {
      setTimeout(() => {
        this.nonce++;
        this.generateValidHash();
      });
    } else {
      this.hash = hash;

      this.$mine.classList.remove('loading');

      this.render();
    }
  }

  validate() {
    const previousHashValid = validateHash(this.previousHash);
    const hashValid = validateHash(this.hash);
    const blockValid = previousHashValid && hashValid && this.nonce;

    if (blockValid) {
      this.$el.classList.remove('invalid');
    } else {
      this.$el.classList.add('invalid');
    }
  }

  onPreviousHashChange(e) {
    this.previousHash = e.target.value;
    this.hash = this.generateHash();

    this.render();
  }

  onDataChange(e) {
    this.data = e.target.value;
    this.hash = this.generateHash();

    this.render();
  }

  onMineClick() {
    this.$mine.classList.add('loading');

    this.generateValidHash();
  }

  render() {
    this.validate();

    this.$index.value = this.index;
    this.$nonce.value = this.nonce;
    this.$previousHash.value = this.previousHash;
    this.$hash.value = this.hash;

    // Next block will be listening for this event
    setTimeout(() => { this.$hash.dispatchEvent(hashChangeEvent); });

    return this.$el;
  }
}

// Create a new block
$newBlock.addEventListener('click', (e) => {
  const block = new Block(blockchain.length, getPreviousHash());
  blockchain.push(block);

  render(blockchain);
});
