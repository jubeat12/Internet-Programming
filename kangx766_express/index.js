// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

// create an express application
var app = express();

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-1 algorithm
var sha1 = require('sha1');

// include the mysql module
var mysql = require("mysql");

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false}
));

var con = mysql.createConnection({
  host: "cse-curly.cse.umn.edu",
  user: "C4131F18G35", // replace with the database user provided to you
  password: "1275", // replace with the database password provided to you
  database: "C4131F18G35", // replace with the database user provided to you
  port: 3306
});

var path = require("path");

// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));

app.get('/',function(req, res) {
	res.sendFile(path.join(__dirname + '/client/welcome.html'));
});

// // GET method route for the events page.
// It serves events.html present in client folder
app.get('/events',function(req, res) {
  //Add Details
  if (req.session.authenticated === false) {
    res.redirect('/login');
  }
  else {
    res.sendFile(path.join(__dirname + '/client/events.html'));
  }

});

// GET method route for the addEvents page.
// It serves addEvents.html present in client folder
app.get('/addEvents',function(req, res) {
  //Add Details
  if (req.session.authenticated === false) {
    res.redirect('/login');
  }
  res.sendFile(path.join(__dirname + '/client/addEvents.html'));
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login',function(req, res) {
  //Add Details
    res.sendFile(path.join(__dirname + '/client/login.html'));
});

// GET method to return the list of events
// The function queries the table events for the list of places and sends the response back to client
app.get('/getListOfEvents', function(req, res) {
  //Add Details
  con.query('SELECT * FROM tbl_events', function (err, result) {
     if (err) {
       throw err;
     }
     res.statusCode = 200;
     res.setHeader('Content-type', 'application/json');
     res.write(JSON.stringify(result, null, 2));
     res.end();
   });
 });

// POST method to insert details of a new event to tbl_events table
app.post('/postEvent', function(req, res) {
  //Add Details
  var row = {
    event_name: req.body.eventname,
    event_location: req.body.location,
    event_date: req.body.date
  };
  con.query('INSERT tbl_events SET ?', row, function (err,result) {
    if (err) {
      throw err;
    }
    res.statusCode = 302;
    res.setHeader('Location', '/events');
    res.end();
  });
});

// POST method to validate user login
// upon successful login, user session is created
app.post('/sendLoginDetails', function(req, res) {
  // Add Details
  var username = req.body.username;
  var password = sha1(req.body.password);
  var mysql = `SELECT * FROM tbl_accounts`;
  con.query(mysql, function (err, result) {
    if (err) {
      throw err;
    }
    var pass = result[0].acc_password;
    if(pass === password &&  username === result[0].acc_login) {
      req.session.authenticated = true;
      res.send('/events');
    }
    else {
      res.status(500).send('Invalid credentials.');
    }
  });
});

// log out of the application
// destroy user session
app.get('/logout', function(req, res) {
  //Add Details
  req.session.authenticated = false;
  res.redirect('/login');
});

// middle ware to serve static files
app.use('/client', express.static(path.join(__dirname + '/client')));


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.status(404).send('NOT FOUND');
});
