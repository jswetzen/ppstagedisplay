/*jslint node: true */
"use strict";

var http = require('http'),
    express = require('express'),
    path = require('path'),
    SOCKETIO_PORT = 8000,
    EXPRESS_PORT = 9000,
    // appjs = require('appjs'),
    io = require('socket.io')(SOCKETIO_PORT),
    ppcom = require('./propresenter_communication.js');

var HOST = '127.0.0.1';
var PORT = 5555;
var PASSWORD = 'password';
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
  // response.send('Hey! How are you');
  var page = '<html><head>';
  page += '<script src="http://code.jquery.com/jquery-1.8.2.min.js"></script>';
  page += '<script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>';
  page += '<script src="/js/textFit.min.js"></script>';
  page += "<script>";
  page += "$(function() {";
  page += "var socket = io.connect('http://localhost:"+SOCKETIO_PORT+"');";
  page += "socket.on('content', function (data) {";
  page += "frameContents = JSON.parse(data);";
  page += "console.log(frameContents);";
  page += "for(key in frameContents) {";
  page += "console.log(key);";
  page += "content = frameContents[key].content;";
  page += "if (key === 'Clock') {";
  page += "var d = new Date();";
  page += "console.log('content: '+content);";
  page += 'var time = content.match(/(\\d+):(\\d+):(\\d+)\\s*(p?)/);';
  page += "d.setHours( parseInt(time[1]) + (time[4] ? 12 : 0) );";
  page += "d.setMinutes( parseInt(time[2]) || 0 );";
  page += "d.setSeconds( parseInt(time[3]) || 0 );";
  page += "content = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();";
  page += "}";
  page += "brContent = content.replace(/\\n/g, '<br>');";
  page += "$('#'+key+' span').html(brContent);";
  page += "";
  page += "}";
  page += "textFit($('.fit'), {multiLine: true, maxFontSize: 120, alignHoriz: false, alignVert: false, reProcess: true});";
  page += "})});</script>";
  page += '<style>html {background-color: black; font-family: Helvetica}</style style="display:block"></head><body>';

  var layout = sd.getLayout(displayIdentifier);

  for(var identifier in layout.fields) {
    var field = layout.fields[identifier];
    var style = "border: 1px solid white; color: white; position: absolute";
    // style += "; overflow: hidden";
    style += "; left: " + Math.floor(parseFloat(field.xAxis));
    style += "; top: " + Math.floor(parseFloat(field.yAxis));
    style += "; width: " + Math.floor(parseFloat(field.width));
    style += "; height: " + Math.floor(parseFloat(field.height));
    var content = "";
    if (frameContents[identifier] !== undefined) {
      content = frameContents.content[identifier];
      // console.log(content);
    } else {
      content = identifier;
    }
    var div = '<div id="' + identifier + '" class="fit" style="' + style + '"><span>' + content + '</span></div>';
    page += div;
  }

  page += '</body></html>';
  response.send(page);
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
