const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._accum = [];
    this._lastAccumIndex = 0;
  }

  _transform(chunk, encoding, callback) {
    this._accum.push(chunk);

    const tempTexts = Buffer.concat(this._accum).toString().split(os.EOL);

    while (this._lastAccumIndex < (tempTexts.length - 1)) {
      this.push(tempTexts[this._lastAccumIndex]);
      this._lastAccumIndex++;
    }
    callback();
  }

  _flush(callback) {
    const tempTexts = Buffer.concat(this._accum).toString().split(os.EOL);

    while (this._lastAccumIndex < tempTexts.length) {
      this.push(tempTexts[this._lastAccumIndex]);
      this._lastAccumIndex++;
    }
    callback();
  }
}

module.exports = LineSplitStream;
