(function () {
  'use strict';

  // Package includes
  const mongo = require('mongodb').MongoClient;
  const fs = require('mz/fs');

  // Variable constants
  const dbpath = __dirname + '\\dbpath.secret';

  const Collection = require('./collections/collection').default;
  const Collections = {};

  // Read database location and authentication from path
  // This path is stored in file ./dbpath and should be excluded from VC
  fs.readFile(dbpath, {'encoding': 'utf-8'})
  .then(function (path) {
    mongo.connect(path.trim(), function (err, db) {
      console.log('Connected to Database');

      // Create collections
      Collections.Games = Collection.createCollectionIfNotExists(db, 'games');
    });
  })
  .catch(function (err) {
    console.error('ERROR: Path to dbpath file is incorrect');
    console.error(err);
  });

  module.exports = Collections;
})();
