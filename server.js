(function () {
  'use strict';

  // Package includes
  const Express = require('express');
  const bodyParser = require('body-parser');
  const DB = require('./mongo');

  const _ = {
    "has": require('lodash/has'),
    "isArray": require('lodash/isArray'),
    "isInteger": require('lodash/isInteger'),
    "isString": require('lodash/isString')
  };

  // Init Express
  const app = Express();

  // Variable constants
  const PORT = process.env.port || 8080;
  const SINGLEPAGE = __dirname + '/index.html';

  /* For production, use this format to deliver bundles
  app.get('/dist/main.bundle.js', function(req, res){
    res.sendFile(__dirname + '/dist/main.bundle.js');
  });

  */
  // However for development purposes, static public dir is fine
  app.use(Express.static('public'));

  // Allow the body of post requests to be read
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(bodyParser.json());

  // API Requests


  function getGames(req, res) {
    const options = {
      "skip": parseInt(req.query.skip) || 0,
      "limit": parseInt(req.query.limit) || 0,
      "sortString": req.query.sort || "submittedDate"
    };

    DB.Games.findAll(options)
    .then((results) => res.status(200).json(results)) //200 OK
    .catch(console.log);
  }

  function getGame(req, res) {
    const title = req.params.title;

    DB.Games.findByTitle(title)
    .then((results) => res.status(200).json(results)) //200 OK
    .catch(console.log);
  }

  function postGame(req, res) {
    const options = {
      "creator": req.body.creator || 'Unknown',
      "title": req.body.title || 'Untitled',
      "description": req.body.description || 'This game has no description',
      "rating": 0,
      "ratings": [],
      "genre": [],
      "engine": [],
      "releaseDate": req.body.date || new Date(),
      "submittedDate": new Date()
    };

    // Store case insensitive versions
    options.creator_lowercase = options.creator.toLowerCase();
    options.title_lowercase = options.title.toLowerCase();


    DB.Games.add(options)
    .then((results) => res.status(201).json(results)) //201 Created
    .catch(console.log);
  }

  function updateGame(req, res) {
    // AFAIK we are guaranteed a title parameter on this route
    // If that's not true, we need to check for that here

    // Is this update a rating change?
    if(_.has(req.body, 'user') && _.has(req.body, 'rating') ) {
      // Verify types
      if(!_.isString(req.body.user)) {
        return res.status(400).send('User property must be a string.');
      }

      if(!_.isInteger(req.body.rating)) {
        return res.status(400).send('Rating property must be an integer. Are you sending it as a string?');
      }

      const options = {
        "title": req.params.title,
        "user": req.body.user,
        "rating": req.body.rating
      };

      return DB.Games.setRating(options)
      .then((results) => res.status(200).json(results)) //201 Created
      .catch((error) => res.status(400).send(error));
    }

    // Is this update a tag change?
    if(_.has(req.body, 'genre') || _.has(req.body, 'engine')) {
      // Verify types
      const options = {
        "title": req.params.title,
      };

      if(_.has(req.body, 'genre')) {
        if(!_.isArray(req.body.genre)) {
          return res.status(400).send('Genre property must be an array, even if it\'s only one element long.');
        }
        options.genre = req.body.genre;
      }

      if(_.has(req.body, 'engine')) {
        if(!_.isArray(req.body.engine)) {
          return res.status(400).send('Engine property must be an array, even if it\'s only one element long.');
        }
        options.engine = req.body.engine;
      }

      return DB.Games.setTags(options)
      .then((results) => res.status(200).json(results))
      .catch((error) => res.status(400).send(error));
    }

    return res.status(400).send();
  }

  app.route('/api/games')
  .get(getGames)
  .post(postGame);

  app.route('/api/games/:title')
  .get(getGame)
  .put(updateGame);

  app.get('/', (req, res) => res.sendFile(SINGLEPAGE));
  app.listen(PORT, () => console.log("Server firing up on port " + PORT));
})();
