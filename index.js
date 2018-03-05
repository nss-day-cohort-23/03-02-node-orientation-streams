#!/usr/bin/env node

// Basic file streaming with synchronous module
const { readFileSync } = require("fs");

// const fileArg = process.argv[2];
const [,,fileArg] = process.argv;

if (fileArg) {
  try {
    const data = readFileSync(fileArg);
    process.stdout.write(data.toString());
  } catch (err) {
    console.log("Error", err)
  }
} else {
  console.log("Please pass in a file to read");
  process.exit();
}
console.log("This is the sychronous version");


// Creating custom write and transform streams, and using asynch read and write streams.
// Note that they come from different Node core modules
const {
  createReadStream,
  createWriteStream,
  // use append file if you don't want to override what's already in there
  appendFile,
  // use write file to create a new doc or overwrite an existing one
  writeFile
} = require("fs")
const { Transform, Writable } = require("stream");
// Create instances of our Transform and Write objects
const upperCaseify = Transform();
const writeStream = Writable();

console.log('uppercaseify', upperCaseify._transform)

// We have to define how the private tramsform method will behave for our Transform instance
upperCaseify._transform = (buffer, _, callback) => {
  callback(null, buffer.toString().toUpperCase());
}

// Ditto our Writable instance
writeStream._write = (buffer, _, next) => {
  writeFile( "messageUppercase.txt", buffer, (err) => {
    if(err) throw err;
    console.log('The data to write was added to the file!');
  });
  next();
};

// Connect the streams to channel the data from read to transform to write
createReadStream(fileArg)
.pipe(upperCaseify)
.pipe(writeStream);



// Now let's search for words in our machine's dictionary

// Check for user input and assign a variable accordingly
const userInput = process.argv[2] ? process.argv[2].toLowerCase() : null;
const { createReadStream } = require('fs');
const { Writable } = require('stream');
// Third-party Transform methods that will help us out
const { map, split } = require('event-stream');
// Our hand-rolled Transform module
const limitToTen = require('./transforms/limit_to_ten');

const writeStream = Writable();
const wordListStream = createReadStream("/usr/share/dict/words");

writeStream._write = (word, _, next) => {
  if (word.toString() === "limit reached") {
    console.log('limit reached');
    process.exit();
  }
  process.stdout.write(word);
  next();
};

if (!userInput) {
  console.log("Usage: readfile [search term]");
  process.exit();
}

wordListStream
.pipe(split())
.pipe(map( (word, next) => {
  word.toString().toLowerCase().includes(userInput) ? next(null, word + "\n") : next();
}))
.pipe(limitToTen())
.pipe(writeStream);

// The `end` event will only be fired if we get no matches, because `writeStream` will exit the process once the list reaches ten words, keeping the `end` event from firing
wordListStream.on('end', () => {
  console.log("No matches found, dude");
});







