const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log('ERROR', err);
    } else {
      items[id] = text;
      fs.appendFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
        if (err) {
          console.log('ERROR', err);
          callback(err, null);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

var getText = function(fileName) {
  return fs.readFileAsync(path.join(exports.dataDir, fileName));
};

var getAllText = function(callback) {
  var promises = [];
  fs.readdirAsync(exports.dataDir).then((files) => {
    for (var i = 0; i < files.length; i++) {
      promises.push(getText(files[i]));
    }
    callback(Promise.all(promises));
  });
};

exports.readAll = (callback) => {
//Use the file where id's are stored to loop through each id
//[{id: 001.txt, text: 001.txt}];
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      var data = _.map(files, (file) => {
        return {id: file.slice(0, file.length - 4), text: undefined};
      });
      getAllText((promises) => promises.then((textArr) => {
        for (var i = 0; i < textArr.length; i++) {
          data[i].text = textArr[i].toString();
        }
        callback(null, data);
      }));
      //callback(null, Promise.all(data.text));
    }
  });
};


//  function getAllImages() {
//     var promises = [];
//     // load all images in parallel
//     for (var i = 0; i <= 2; i++) {
//         promises.push(getImage(i));
//     }
//     // return promise that is resolved when all images are done loading
//     return Promise.all(promises);
//  }

//  getAllImages().then(function(imageArray) {
//     // you have an array of image data in imageArray
//  }, function(err) {
//     // an error occurred
//  });

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), (err, text) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, {id, text: text.toString()});
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log(err);
      callback(err, null);
    } else if (!files.includes(id + '.txt')) {
      callback(new Error(`No item with id: ${id}`), null);
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
        if (err) {
          console.log('ERROR', err);
          callback(err, null);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  // fs.readFile(path.join(exports.dataDir, id + '.txt'), (err, text) => {
  //   if (err) {
  //     callback(new Error(`No item with id: ${id}`));
  //   } else {
  fs.unlink(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      var item = items[id];
      delete items[id];
      callback(null, 'Item Removed');
    }
  });
};


// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
