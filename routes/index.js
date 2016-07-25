var express = require('express');
var router = express.Router();
var spawn = require("child_process").spawn;
var process = null;

router.get('/api/user', function(req, res) {
  if (req.session && req.session.user) {
    res.status(200).send(req.session.user);
  }
  else {
    res.status(400).send("");
  }
});

/* GET home page. */
router.post('/api/pokemon', function(req, res) {
  if (req.session && !req.session.user){
    req.session.user = req.body;
  }

  var name = req.body.name;
  var password = req.body.password;
  var lat = req.body.lat;
  var lon = req.body.lon;

  if (!name || !password || !lat || !lon){
    // TODO error handling here
    console.log("something not defined"); 
    res.status(400).send("Error: Check your username, password, and coordinates");
  }
  else{
    require("child_process").exec('cd PokeQuery; python example.py -u ' + req.body.name
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

    // TODO socket this back or something
    /*
    process = spawn('python', ["./example.py", 
                              '-u', req.body.name, '-p', req.body.password,
                              '--lat', req.body.lat, '--lon', req.body.lon], {cwd: "./PokeQuery"});
    process.stdout.on('data', function (data){
      console.log('data: ' + data);
      res.write(data);
      res.flush();
    });
    process.stderr.on('data', function(data){
      console.log('stderr: ' + data);
    });
    process.on('close', function(closed) {
      console.log("It's closed");
      console.log(closed);
      res.end();
    });
    */
  }
});

module.exports = router;
