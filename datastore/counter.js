const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(exports.counterFile, (err, fileData) => {
      if (err) {
        reject(err);
      } else {
        resolve(Number(fileData));
      }
    });
  });
};

const writeCounter = (count) => {
  return new Promise((resolve, reject) => {
    var counterString = zeroPaddedNumber(count);
    fs.writeFile(exports.counterFile, counterString, (err) => {
      if (err) {
        reject(new Error('error writing counter'));
      } else {
        resolve(counterString);
      }
    });
  });
};

// Public API - Fix this function //////////////////////////////////////////////

exports.promiseGetNextUniqueId = () => {
  return new Promise((resolve, reject) => {
    readCounter().then((count) => {
      writeCounter(count + 1).then((id) => resolve(id)).catch((err) => reject(err));
    }).catch((err) => reject(err));
  });
};

exports.getNextUniqueId = (callback) => {
  exports.promiseGetNextUniqueId().then((id) => callback(null, id)).catch((err) => callback(err, null));
};



// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');
