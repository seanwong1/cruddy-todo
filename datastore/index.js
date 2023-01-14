const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

var promiseCreate = (text) => {
  return new Promise((resolve, reject) => {
    counter.promiseGetNextUniqueId()
      .then((id) => {
        items[id] = text;
        fs.appendFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ id, text });
          }
        });
      })
      .catch((err) => reject(err));
  });
};

exports.create = (text, callback) => {
  promiseCreate(text).then((text) => callback(null, text)).catch((err) => callback(err, null));
};


var getText = function(fileName) {
  return fs.readFileAsync(path.join(exports.dataDir, fileName));
};

var getAllText = function(callback) {
  var promises = [];
  var id = [];
  return fs.readdirAsync(exports.dataDir).then((files) => {
    for (var i = 0; i < files.length; i++) {
      promises.push(getText(files[i]));
      id.push(files[i].slice(0, files[i].length - 4));
    }
    callback(Promise.all(promises), id);
  });
};

var promiseReadAll = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(exports.dataDir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        getAllText((promises, id) => promises.then((allTextInfo) => {
          var data = [];
          for (var i = 0; i < allTextInfo.length; i++) {
            data.push({text: allTextInfo[i].toString(), id: id[i]});
          }
          resolve(data);
        }));
      }
    });
  });
};

exports.readAll = (callback) => {
  promiseReadAll().then((data) => callback(null, data)).catch((err) => callback(err, null));
};


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