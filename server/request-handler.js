const fs = require('fs');
const messages = require('./messages.json');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization',
  'access-control-max-age': 10 // Seconds.
};

var allowedKeys = ['message_id', 'roomname', 'text', 'username', 'github_handle', 'campus', 'created_at', 'updated_at'];

var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var statusCode = 404;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';
  var output = 'Hello, World!';


  if (request.url === '/classes/messages') {
    if (request.method === 'GET' || request.method === 'OPTIONS') {
      // Get the messages from messages.json
      statusCode = 200;
      headers['Content-Type'] = 'application/json';
      output = JSON.stringify(messages);
    } else if (request.method === 'POST') {
      statusCode = 201;
      headers['Content-Type'] = 'application/json';
      var message = '';

      request.on('data', (data) => {
        message += data;
      });
      request.on('end', () => {
        message = JSON.parse(message);

        if (Object.keys(message).some(k => !allowedKeys.includes(k)) || !(['username', 'text'].every(k => Object.keys(message).includes(k)))) {
          statusCode = 400;
          console.log(message);
          console.log('statusCode: ' + statusCode);
        } else {

          message['message_id'] = messages.length;
          message['roomname'] = message['roomname'] || 'lobby';
          message['created_at'] = new Date();

          messages.unshift(message);

          fs.writeFile('./server/messages.json', JSON.stringify(messages), (err) => {
            if (err) {
              console.log(err);
            }
          });
        }

      });
    }


  } else {


  }

  response.writeHead(statusCode, headers);
  response.end(output);

};

module.exports = { requestHandler };