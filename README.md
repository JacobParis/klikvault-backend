# klikvault-backend
Server backend for the Klikvault Game Repository

The server code depends on a `dbpath.secret` file in the root directory, which is just a plain text file that shows the address. Mine is `mongodb://localhost:27017/klikvault` but do not check this file into the database for security reasons. All `*.secret` files are on the `.gitignore` list already.

Do not expose the database to the internet without first securing with a proper auth system. There are ransomware search spiders that check for unsecured databases and will delete all your data. Make backups regularly and never pay any ransom if one occurs. I've been hit by multiple ransomwares and backups always saved the day.

## Return list of all games

`GET domain.com/api/games?limit=4&skip=3&sort=creator`

Limit and skip are used for pagination and the sort field accepts `creator` or `title`. Returns an array of JSON objects

## Return specific game

`GET domain.com/api/games/knytt`

Returns a JSON object

## Submit new game

`POST domain.com/api/games`

All properties are optional with 'untitled'-type placeholders if the fields aren't filled. Submit a JSON object with any of the following

```
{
  "creator": "Derek Yu",
  "title": "Eternal Daughter",
  "description": "Side scrolling metroidvania",
  "releaseDate": 2002-June-21
}
```

If releaseDate is not specified, it will default to the submittedDate, which is set by the server

## Rate game

`PUT domain.com/api/games/heartforthalicia`

Either adds a new rating for your user or modifies the existing one. Submit a JSON object with `user` and `rating` fields.

```
{
  "user": "Jacob",
  "rating": 5
}
```

Once the accounts system is active the user will be an account ID. At the moment it just checks for an existing matching string. Improper requests, like submitting the rating as a string number `"rating: "4"` will cause the server to politely yet firmly tell you to do it properly.

## Change genres / engines

`PUT domain.com/api/games/iwannabetheguy`

Supply an array of all the relevant tags you want to set and it will replace the current list with yours

```
{
  "genre": [
    "platformer",
    "side-scroller",
    "hardcore"
  ],
  "engine": [
    "multimedia-fusion-2",
    "multimedia-fusion-2-free",
    "multimedia-fusion-2-dev"
  ]
}
```

I'll probably add the lesser engines as dependencies on the superior engines so a search for dev will also pull up standard and free results, but that's logistics

# Style Guide

Use `const` and `let` as necessary, avoiding `var` in all situations.

Each file should be wrapped in an immediately invoked function declaration and set to strict mode.

```
(function() {
  'use strict';

  //File content here
})();
```

Third party libaries should be used as minimally as possible and only include the necessary functions when possible.
I use Lodash extensively but only the relevant functions

```
const _ = {
  "each": require('lodash/each'),
  "map": require('lodash/map')
};
```

Objects should use proper JSON format, which means double quotes around all keys.
I currently do this on mongo `$keys` as well but I could be convinced to drop those specific cases

```
const query = {
  $set: {
    "blag": "blog"
  }

  versus

  "$set": {
    "blag": "blog"
  }
}

```

Do not hardcode string identifiers within the code
Rather set a constant at the top of the file and reference it from there.

Every HTTP request must have a response. If the code is invalid, respond with the relevant code.
If there are common user errors look for those and then get the server to explain what's going on.
Even if it's just us who should see them, it helps to have the server provide relevant advice.
