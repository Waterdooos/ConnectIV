var express = require('express');
var router = express.Router();

router.get('/play', function(req, res, next) {
  res.render('game.ejs');
});

router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

router.get('/*', function(req, res, next) {
  res.status(404)
  res.render('error.ejs');
})

module.exports = router;
