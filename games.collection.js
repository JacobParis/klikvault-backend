(function() {
  'use strict';

  class GamesCollection {
    constructor(db, name) {
      this.DB = db;
      this.name = name
    }

    static createCollectionIfNotExists(db, name) {
      db.collection(name, {"strict": true})
      .then(() => console.log('The ' + name + ' collection exists.'))
      .catch(() => console.log('The ' + name + ' collection did not exist and has been created.');
    }
    /**
     * Submit a game to the database
     * @param {object} game - The game document to submit
     */
    add(game) {
      console.log('_addGame');

      return this.DB.collection(this.name)
      .insert(game)
      .then((docs) => {
        // Only send new document
        return docs.ops[0];
      });
    }

    /**
     * Get a list of games that match the query
     * @param {object} options - Query filters
     */
    findAll(options) {
      console.log('_findGames');

      options.sort = {};
      options.sort[options.sortString] = 1;

      return this.DB.collection(this.name)
      .find()
      .limit(options.limit)
      .skip(options.skip)
      .sort(options.sort)
      .toArray()
      .then( function (results) {
        return results;
      });
    }
  }

  exports.default = GamesCollection;
})();
