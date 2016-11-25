$(function() {
  var timers = {'clock': {}, 'countdown': {}, 'elapsed': {}},
      ticker = window.setInterval(function() {
        for (var type in timers) {
          for (var key in timers[type]) {
            if (timers[type][key].running) {
              if (type === 'countdown') {
                timers[type][key].seconds -= 1;
              } else {
                timers[type][key].seconds += 1;
              }
              $('#'+key+' span').html(formatTime(timers[type][key].seconds), type);
            }
          }
        }
      }, 1000),
      socket = io();

  socket.on('content', function (data) {
    frameContents = JSON.parse(data);
    // Update all frames
    for (var key in frameContents) {
      var content = frameContents[key].content;
      if (typeof content.replace === 'function') {
        content = content.replace(/\\n/g, '<br>');
      }

      var attrs = frameContents[key].attributes,
      type = attrs.type;
      // Add timers and the clock to be updated
      if (type == 'clock' || type == 'countdown' || type == 'elapsed') {
        var seconds = parseInt(content, 10);
        if (isNaN(seconds)) {
            seconds = 0;
        }

        if (timers[type][key] === undefined) {
          timers[type][key] = {'running': 0, 'seconds': seconds};
        }

        // Run timers if "running" is true or if it's the clock
        // (has no "running" attribute)
        var running = ((!attrs.hasOwnProperty('running')) ||
                       attrs.running == "1");
        // Don't let the clock count backwards, can happen on Windows that
        // doesn't send seconds.
        if (type == 'clock' && timers[type][key].hasOwnProperty('seconds') &&
           seconds < timers[type][key].seconds) {
            seconds = timers[type][key].seconds;
        }

        // Only update if timer really wrong, not just a few seconds,
        // but always update if the running state changed
        if (Math.abs(timers[type][key].seconds - seconds) > 10 ||
            timers[type][key].running != running) {
          timers[type][key].seconds = seconds;
        }
        timers[type][key].running = running;

        content = formatTime(timers[type][key].seconds, type);
      }
      $('#'+key+' span').html(content);

      if (attrs.htmlColor != undefined)
        $('#'+key+' span').css('color', attrs.htmlColor);
    }

    ticker = startTicker(timers);

    textFit($('.fit'), {
      multiLine: true,
      maxFontSize: 120,
      alignHoriz: false,
      alignVert: false,
      reProcess: true
    });
  });
});

function pad(num) {
    return ('0' + num).slice(-2);
}

function formatTime(seconds, type) {
  timeString = '';

  if (seconds < 0) {
    timeString += '-';
    seconds = -seconds;
  }

  timeString += pad(Math.floor(seconds / 3600)) + ':';
  seconds = (seconds % 3600);
  timeString += pad(Math.floor(seconds / 60)) + ':';
  seconds = (seconds % 60);
  timeString += pad(seconds);

  return timeString;
}

function startTicker(timers) {
      return ;
}
