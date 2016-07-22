var express = require('express');
var router = express.Router();
var spawn = require("child_process").spawn;
var process = null;

/* GET home page. */
router.post('/api/pokemon', function(req, res) {
  if (process) {
    console.log("processing");
  }
  else {
require("child_process").exec('python ../PokeQuery/example.py -u ' + req.body.username
                              + ' -p ' + req.body.password + ' --lat ' + req.body.lat
                              + ' --lon ' + req.body.lon + ' -st 10',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});



/*
    process = spawn('python', ["../PokeQuery/example.py", 
                              req.body.username, req.body.password,
                              req.body.lat, req.body.lon]);
    process.stdout.on('data', function (data){
      console.log(data);
    // Do something with the data returned from python script
    });
    process.on('close', function(closed) {
      console.log("It's closed");
      console.log(closed);
    });
    */
  }

});

module.exports = router;
