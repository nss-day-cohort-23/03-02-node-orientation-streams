const { Transform } = require('stream');
let count = 0;

module.exports = () => Transform({
  transform(word, _, next) {
    count++
    count <= 10 ? next(null, word) : next(null, "limit reached");
  }
})

