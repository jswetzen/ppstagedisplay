$(function() {
  var socket = io();
  socket.on('content', function (data) {
    frameContents = JSON.parse(data);
    console.log(frameContents);
    for (var key in frameContents) {
      console.log(key);
      content = frameContents[key].content;
      brContent = content.replace(/\\n/g, '<br>');
      $('#'+key+' span').html(brContent);
    }
    textFit($('.fit'), {
      multiLine: true,
      maxFontSize: 120,
      alignHoriz: false,
      alignVert: false,
      reProcess: true
    });
  });
});
