var net = require('net');
var parse = require('xml-parser');
var ppcom = require('./propresenter_communication.js');
var appjs = require('appjs');

var HOST = '127.0.0.1';
var PORT = 5555;
var PASSWORD = 'password';
var displayIdentifier = 'Default';

var layouts = {};
var frameContents = {};

function interpretLayouts(displayLayouts) {
  var layouts = {};

  for(i=0; i < displayLayouts.children.length; i++) {
    layoutdata = displayLayouts.children[i];
    var layout = {};

    layout.identifier = layoutdata.attributes.identifier;
    layout.border = layoutdata.attributes.showBorder;
    layout.width = layoutdata.attributes.width;
    layout.height = layoutdata.attributes.height;
    layout.fields = {};

    for(j=0; j < layoutdata.children.length; j++) {
      field = {};
      attributes = layoutdata.children[j].attributes;
      for(var i in attributes) {
        field[i] = attributes[i];
      }
      layout.fields[field.identifier] = field;
    }

    // console.log(layout.fields);
    layouts[layout.identifier] = layout;
  }

  return layouts;
}

function interpretData(frames) {
  var frameContents = {};
  for(i=0; i < frames.length; i++) {
    frame = frames[i];
    if (frame.name == 'Field') {
    frameContents[frame.attributes.identifier] = frame.content;
    }
  }
  return frameContents;
}

function interpretMessage(message) {
  switch (message.root.name) {
    case 'StageDisplayLoginSuccess':
      console.log("We're logged in!");
      break;
    case 'DisplayLayouts':
      layouts = interpretLayouts(message.root);
      console.log("Got layouts");
      break;
    case 'StageDisplayData':
      console.log("StageDisplayData:");
      frameContents = interpretData(message.root.children[0].children);
      console.log("Got display data");
      break;
    default:
      console.log("Unknown message type, help!");
      console.log(message.root.name);
  }
}

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
    client.write('<StageDisplayLogin>'+PASSWORD+'</StageDisplayLogin>\r\n');

});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {

    // console.log('DATA: ' + data);
    var message = parse(data.toString('utf-8'));
    // console.log(inspect(obj, { colors: true, depth: Infinity }));
    interpretMessage(message);
    // console.log(message.root.name);
    console.log("");
    // Close the client socket completely
    // client.destroy();

});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});



// handle requests from the browser
appjs.router.get('/', function(request, response, next){
  // response.send('Hey! How are you');
  page = '<html><head><style>html {background-color: black}</style></head><body>';

  var layout = layouts[displayIdentifier];

  for(var identifier in layout.fields) {
    var field = layout.fields[identifier];
    var style = "border: 1px solid white; color: white; position: absolute";
    style += "; left: " + Math.floor(parseFloat(field.xAxis));
    style += "; top: " + Math.floor(parseFloat(field.yAxis));
    style += "; width: " + Math.floor(parseFloat(field.width));
    style += "; height: " + Math.floor(parseFloat(field.height));
    var content = "";
    if (frameContents[identifier] !== undefined) {
      content = frameContents[identifier];
      console.log(content);
    } else {
      content = identifier;
    }
    var div = '<div style="' + style + '">' + content + '</div>';
    page += div;
  }

  page += '</body></html>';
  response.send(page);
});

setTimeout(function() {
  var layout = layouts[displayIdentifier];

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
  var window = appjs.createWindow({
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
}, 2000);
