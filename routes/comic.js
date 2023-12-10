var express = require('express');
var router = express.Router();

/* GET comic */
router.get('/comic/:comicId', function(req, res, next) {
  res.render('comic', { title: 'Express' });
});

module.exports = router;
