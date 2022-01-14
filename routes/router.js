const express = require('express');
const router = express.Router();
const statTracker = require('../models/statTracker');

router.get('/play', function(req, res, next) {
  res.render('game.ejs');
});

router.get('/', function(req, res, next) {
  res.render('index.ejs', statTracker);
});

router.get('/*', function(req, res, next) {
  res.status(404)
  res.render('error.ejs');
})

module.exports = router;
