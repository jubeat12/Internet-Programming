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
var xml2js = require('xml2js');

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false}
));

var xml = new xml2js.Parser();
fs.readFile(__dirname + '/dbconfig.xml', function (err, data) {
  xml.parseString(data, function (err, result) {
    con = mysql.createConnection({
      host: result.dbconfig.host[0],
      user: result.dbconfig.user[0],
      password: result.dbconfig.password[0],
      database: result.dbconfig.database[0],
      port: result.dbconfig.port[0]
    });
  });
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

// GET method route for the admin page.
// It serves admin.html present in client folder
app.get('/admin',function(req, res) {
  //Add Details
  if (req.session.authenticated === false) {
    res.redirect('/login');
  }
  res.sendFile(path.join(__dirname + '/client/admin.html'));
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
 


app.get('/getListOfUsers', function (req, res) {
  con.query('SELECT * FROM tbl_accounts', function (err, result) {
    if (err) throw err;
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(result, null, 2));
    res.end();
  });
});

app.get('/getCurrentUser', function (req, res) {
  if (req.session.username) {
    res.send(req.session.username);
  }
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
app.post('/sendLoginDetails', function (req, res) {
  var username = req.body.username;
  var password = sha1(req.body.password);

  var sql = `SELECT acc_password FROM tbl_accounts WHERE acc_login = '${username}'`;
  con.query(sql, function (err, result) {
    if (err) {
      throw err;
    }
    var stored_password = result[0].acc_password;
    if (stored_password === password) {
      req.session.authenticated = true;
      req.session.username = username;
      res.send('/events');
    }
    else {
      res.status(500).send('Error: Invalid credentials');
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

// POST method to validate new user credentials
// upon successful login, user session is created
app.post('/validateNewUser', function (req, res) {
  var name = req.body.name;
  var login = req.body.login;
  var password = sha1(req.body.password);

  var sql = `SELECT acc_password FROM tbl_accounts WHERE acc_login = '${login}'`;
  con.query(sql, function (err, result) {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      res.status(500).send('Found user undefined in database');
    } else {
      con.query('INSERT tbl_accounts SET ?', { acc_name: name, acc_login: login, acc_password: password }, function (err, result) {
        if (err) {
          throw err;
        }
        res.status(200).send('ok');
      });
    }
  });
});

// POST method to validate new user credentials
// upon successful login, user session is created
app.post('/updateUser', function (req, res) {
  var name = req.body.name;
  var login = req.body.login;
  var oldLogin = req.body.oldLogin;
  var password = sha1(req.body.password);

  con.query(`SELECT * FROM tbl_accounts WHERE acc_login = '${login}' and acc_login != '${oldLogin}'`, function (err, result) {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
    } else {
      var sql = `UPDATE tbl_accounts SET ? WHERE acc_login = '${oldLogin}'`;
      var row = { acc_name: name, acc_login: login, acc_password: password };
      con.query(sql, row, function (err, result) {
        if (err) {
          throw err;
        }
        req.session.username = login;
        res.status(200).send('ok');
      });
    }
  });
});

app.delete('/deleteUser', function (req, res) {
  var login = req.body.login;

  if (login === req.session.username) {
    res.status(500).send('Error: Can not delete the user that is logged in');
  } else {
    var sql = `DELETE FROM tbl_accounts WHERE acc_login = '${login}'`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send('ok');
    });
  }
});