/*jslint node: true */
"use strict";

var http = require('http'),
    express = require('express'),
    path = require('path'),
    EXPRESS_PORT = 9000,
    // appjs = require('appjs'),
    io = require('socket.io')(8000),
    ppcom = require('./propresenter_communication.js');

var HOST = '127.0.0.1';
// var HOST = '172.20.0.202';
var PORT = 5555;
// var PORT = 1234;
var PASSWORD = 'password';
// var PASSWORD = '1234';
var displayIdentifier = 'Default';
var frameContents = {};

var sd = new ppcom.StageDisplay(HOST, PORT, PASSWORD, displayIdentifier, function(data) {
  frameContents = data;
  io.sockets.emit('content', JSON.stringify(frameContents));
});

var app = express();
app.set('port', process.env.PORT || EXPRESS_PORT);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Handle static files
app.use(express.static(path.join(__dirname, 'public')));

// handle requests from the browser
app.get('/', function(request, response, next){
  var layout = sd.getLayout(displayIdentifier);

  var frames = [];
  for(var identifier in layout.fields) {
    var field = layout.fields[identifier];
    var left = 100 * (parseFloat(field.xAxis) / layout.width);
    var top = 100 * (parseFloat(field.yAxis) / layout.height);
    var width = 100 * (parseFloat(field.width) / layout.width);
    var height = 100 * (parseFloat(field.height) / layout.height);
    var style = "color: white; position: absolute";
    // style += "; overflow: hidden";
    style += "; border: " + (layout.border ? "1" : "0")  + "px solid white";
    style += "; left: " + left + "%";
    style += "; top: " + top + "%";
    style += "; width: " + width + "%";
    style += "; height: " + height + "%";
    /*
    style += "; left: " + Math.floor(parseFloat(field.xAxis)) + "px";
    style += "; top: " + Math.floor(parseFloat(field.yAxis)) + "px";
    style += "; width: " + Math.floor(parseFloat(field.width)) + "px";
    style += "; height: " + Math.floor(parseFloat(field.height)) + "px";
    */
    style += "; display: " + (field.isVisible == "YES" ? "block" : "none");
    var content = identifier;
    frames.push({'identifier': identifier, 'style': style, 'content': content});
  }

  response.render('stagedisplay', {'frames': frames});
});

// Start listening on a port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*
var initializeWindow = function() {
  var layout = sd.getLayout(displayIdentifier);

  var menubar = appjs.createMenu([{
    label:'&File',
    submenu:[
      {
        label:'E&xit',
        action: function(){
          window.close();
        }
      }
    ]
  },{
    label:'&Window',
    submenu:[
      {
        label:'Fullscreen',
        action:function(item) {
          window.frame.fullscreen();
          console.log(item.label+" called.");
        }
      },
      {
        label:'Minimize',
        action:function(){
          window.frame.minimize();
        }
      },
      {
        label:'Maximize',
        action:function(){
          window.frame.maximize();
        }
      },{
        label:''//separator
      },{
        label:'Restore',
        action:function(){
          window.frame.restore();
        }
      }
    ]
  }]);

  menubar.on('select',function(item){
    console.log("menu item "+item.label+" clicked");
  });

  var trayMenu = appjs.createMenu([{
    label:'Show',
    action:function(){
      window.frame.show();
    },
  },{
    label:'Minimize',
    action:function(){
      window.frame.hide();
    }
  },{
    label:'Exit',
    action:function(){
      window.close();
    }
  }]);

  // create a window
  var window = appjs.createWindow('http://localhost:' + app.get('port') + '/',
    {
    width: layout.width,
    height: layout.height,
    alpha: false,
  });

  // prepare the window when first created
  window.on('create', function(){
    console.log("Window Created");
    // window.frame controls the desktop window
    window.frame.show().center();
    window.frame.setMenuBar(menubar);
  });

  // the window is ready when the DOM is loaded
  window.on('ready', function(){
    console.log("Window Ready");
    // directly interact with the DOM
    window.process = process;
    window.module = module;

    window.addEventListener('keydown', function(e){
      // show chrome devtools on f12 or commmand+option+j
      if (e.keyIdentifier === 'F12' || e.keyCode === 74 && e.metaKey && e.altKey) {
        window.frame.openDevTools();
      }
    });
  });

  // cleanup code when window is closed
  window.on('close', function(){
    console.log("Window Closed");
  });
};

var init = function() {
  if (sd.isInitialized()) {
    console.log('init done');
    initializeWindow();
  } else {
    console.log('waiting some more');
    setTimeout(init, 1000);
  }
};

init();
*/
