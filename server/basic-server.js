const messages = require('./messages.json');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization',
  'access-control-max-age': 10 // Seconds.
};
var allowedKeys = ['message_id', 'roomname', 'text', 'username', 'github_handle', 'campus', 'created_at', 'updated_at'];
var port = 3000;
var ip = '127.0.0.1';

// Middlewares
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '../')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'chatterbox.html'));
});


// Get handler
app.get('/classes/messages', function(req, res) {
  res.statusCode = 200;
  res.set(defaultCorsHeaders);
  res.json(messages);
});

// Post handler
app.post('/classes/messages', function(req, res, next) {
  res.statusCode = 201;
  res.set(defaultCorsHeaders);
  var message = req.body;
  // Make sure object is in a correct format...
  if (Object.keys(message).some(k => !allowedKeys.includes(k)) || !(['username', 'text'].every(k => Object.keys(message).includes(k)))) {
    res.statusCode = 400;
  } else {
    // Fill in the blanks
    message['message_id'] = messages.length;
    message['roomname'] = message['roomname'] || 'lobby';
    message['created_at'] = new Date();

    messages.unshift(message);

    // Store in messages.json
    fs.writeFile('./server/messages.json', JSON.stringify(messages), (err) => {
      if (err) {
        console.log('Error!', err);
        next(err);
      }
    });

  }

  // Response message
  if (res.statusCode === 400) {
    res.send(res.statusCode + ': Inappropriate/incomplete data...');
  } else {
    res.send(res.statusCode + ': Message stored...');
  }
});

app.options('/classes/messages', function(req, res) {
  res.status(200);
  res.type('application/json');

  res.set(defaultCorsHeaders);

  res.json(messages);
});

app.listen(port, () => {
  console.log('Listening on http://' + ip + ':' + port);
});