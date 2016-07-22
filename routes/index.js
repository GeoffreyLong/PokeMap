var express = require('express');
var router = express.Router();
var spawn = require("child_process").spawn;

/* GET home page. */
router.post('/api/pokemon', function(req, res) {
  console.log(req.body);

});

module.exports = router;
