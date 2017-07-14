(function() {
  'use strict';

  // Require only the lodash functions we are using
  const _ = {
    "each": require('lodash/each'),
    "has": require('lodash/has')
  };

  // More dedicated classes can extend this base class
  class Collection {
    constructor(db, name) {
      this.DB = db;
      this.name = name;
    }

    /**
     * Create a collection if it does not exists
     * @param {object} db - The database to use
     * @param {string} name - The name of the collection to create
     */
    static createCollectionIfNotExists(db, name) {
      db.createCollection(name)
      .then(() => console.log('The ' + name + ' collection exists.'))
      .catch(() => console.log('The ' + name + ' collection did not exist and has been created.'));

      return new Collection(db, name);
    }

    /**
     * Submit a document to the database
     * @param {object} doc - The document to submit
     */
    add(doc) {
      console.log('Collection.add');

      return this.DB.collection(this.name)
      .insert(doc)
      .then((docs) => {
        // Only send new document
        return docs.ops[0];
      });
    }

    /**
     * Get a list of documents that match the query
     * @param {object} options - Query filters
     */
    findAll(options) {
      console.log('Collection.findAll');

      options.sort = {};
      options.sort[options.sortString] = 1;

      return this.DB.collection(this.name)
      .find()
      .limit(options.limit)
      .skip(options.skip)
      .sort(options.sort)
      .toArray();
    }

    /**
     * Get a single document with a given title
     * @param {string} title - Document title
     */
    findByTitle(title) {
      console.log('Collection.findByTitle');

      const options = {
        title_lowercase: title.toLowerCase()
      };

      return this.DB.collection(this.name)
      .findOne(options)
      .then( function (results) {
        console.log(results);
        return results;
      });
    }

    /**
     * Set the rating of a single document with a given title
     * @param {object} options - Object containing {title:String, user:String, rating:Integer}
     */
    setRating(options) {
      console.log('Collection.setRating');

      const findQuery = {
        "title_lowercase": options.title.toLowerCase()
      };

      const pullQuery = {
        "$pull": {
          "ratings": {
            "user": options.user
          }
        }
      };

      return this.DB.collection(this.name)
      .findOneAndUpdate(findQuery, pullQuery, {"returnNewDocument": true})
      .then((pullResults) => {
        // Set a value to the new rating we're inserting, then add all the existing ratings
        // Then we can divide by total + 1 and get our new average
        let points = options.rating;
        _.each(pullResults.value.ratings, (rating) => {
          points += rating.score;
        });
        points /= pullResults.value.ratings.length + 1;

        const updateQuery = {
          "$set": {
            "rating": points
          },
          "$push": {
            "ratings": {
              "user": options.user,
              "score": options.rating
            }
          }
        };

        return this.DB.collection(this.name)
        .findOneAndUpdate(findQuery, updateQuery, { "returnNewDocument": true });
      });
    }

    /**
     * Set the genre and engine tags of a single document with a given title
     * @param {object} options - Object containing {title:String, and (genre:Array and/or engine:Array)}
     */
    setTags(options) {
      console.log('Collection.setTags');

      const findQuery = {
        "title_lowercase": options.title.toLowerCase()
      };

      const updateQuery = {
        "$set": {}
      };

      if(_.has(options, 'genre')) {
        updateQuery.$set.genre = options.genre;
      }

      if(_.has(options, 'engine')) {
        updateQuery.$set.engine = options.engine;
      }

      return this.DB.collection(this.name)
      .findOneAndUpdate(findQuery, updateQuery, { "returnNewDocument": true });
    }
  }

  exports.default = Collection;
})();
