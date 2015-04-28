var ppcom = require('./propresenter_communication.js');

sd = new ppcom.StageDisplay('localhost', 5555, 'password', 'Default', function(data) {
  console.log("Got contents");
  console.log(data);
});

console.log(sd.getLayout('Default'));

