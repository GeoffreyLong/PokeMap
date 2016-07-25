var express = require('express');
var router = express.Router();
var spawn = require("child_process").spawn;
var process = null;

/* GET home page. */
router.post('/api/pokemon', function(req, res) {
  console.log(req.session);
  if (!req.session.user){
    req.session.user = req.body;
  }

  var name = req.body.username;
  var password = req.body.password;
  var lat = req.body.lat;
  var lon = req.body.lon;

  if (!name || !password || !lat || !lon){
    // TODO error handling here
    console.log("something not defined"); 
    res.status(400).send("Error: Check your username, password, and coordinates");
  }
  else{

    require("child_process").exec('cd PokeQuery; python example.py -u ' + req.body.username
                                  + ' -p ' + req.body.password + ' --lat ' + req.body.lat
                                  + ' --lon ' + req.body.lon + ' -st 1',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
      
        if (stdout !== ""){
          res.status(200).send(JSON.parse(stdout));
        }
        else if (stderr) {
          res.status(400).send("Error: Check your username, password, and coordinates");
        }
        else {
          res.status(400).send("Error: unknown");
        }
    });
  }



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

});

module.exports = router;
