/*jslint node: true */
"use strict";

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path'),
    ppcom = require('./lib/propresenter_communication.js');

var HOST = null;
var PORT = null;
var PASSWORD = 'password';
var EXPRESS_PORT = 9000;
var displayIdentifier = 'Default';
var frameContents = {};

var ioEmit = function() {
  io.sockets.emit('content', JSON.stringify(frameContents));
};

var sd = new ppcom.StageDisplay(HOST, PORT, PASSWORD, displayIdentifier, function(data) {
  frameContents = data;
  ioEmit();
});

app.set('port', process.env.PORT || EXPRESS_PORT);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Handle static files
app.use(express.static(path.join(__dirname, 'public')));

// handle requests from the browser
app.get('/', function(request, response, next){
  if (sd.isInitialized()) {
    var layout = sd.getLayout(displayIdentifier);

    var frames = [];
    for(var identifier in layout.fields) {
      var field = layout.fields[identifier];
      var left = 100 * (parseFloat(field.xAxis) / layout.width);
      var top = 100 * (parseFloat(field.yAxis) / layout.height);
      var width = 100 * (parseFloat(field.width) / layout.width);
      var height = 100 * (parseFloat(field.height) / layout.height);
      var style = "color: white; position: absolute";
      style += "; box-sizing: border-box";
      style += "; border: " + (layout.border ? "1" : "0")  + "px solid white";
      style += "; left: " + left + "%";
      style += "; top: " + top + "%";
      style += "; width: " + width + "%";
      style += "; height: " + height + "%";
      style += "; display: " + (field.isVisible == "YES" ? "block" : "none");
      frames.push({'identifier': identifier, 'style': style, 'content': ''});
    }

    response.render('stagedisplay', {'frames': frames});
    setTimeout(function() {
      ioEmit();
    }, 5000);
  } else {
    response.render('waiting');
  }
});

// Start listening on a port
http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
