var express = require('express');
var router = express.Router();

/* GET character-info */
router.get('/character-info/:characterId', function(req, res, next) {
  res.render('character-info', { title: 'Express' });
});

module.exports = router;
