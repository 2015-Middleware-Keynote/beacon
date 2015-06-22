'use strict';

var WebSocketServer = require('ws').Server
  , data = require('../beacon-playback')
  , Rx = require('rx')
  ;

var tag = 'WS/PLAYBACK';

var subscribeToScanEvents = function(ws, config) {
  var scans = data.scans(config.days, config.hour, config.minute).share();
  scans.take(1).subscribe(function(scan) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({type: 'setup', data: {
        startTime: scan.timestamp,
        endTime: new Date().getTime()
      }}));
    };
  });
  var send = Rx.Observable.fromNodeCallback(ws.send, ws);
  var subscription = scans
    .bufferWithTimeOrCount(20, 100)
    .filter(function(buf) {
      return buf.length > 0;
    })
    .flatMap(function(scanBundle) {
      if (ws.readyState === ws.OPEN) {
        return send(JSON.stringify({type: 'scanBundle', data: scanBundle}));
      } else {
        return Rx.Observable.empty;
      };
    })
    .subscribe(undefined, function(error) {
      console.error(error.stack || error);
    }, function() {
      if (ws.readyState === ws.OPEN) {
        console.log(tag, 'Playback complete, closing connection');
        ws.close();
      };
    });
  return subscription;
}

module.exports = function(server) {
  var wss = new WebSocketServer({server: server, path: '/playback'});

  wss.on('connection', function connection(ws) {
    console.log(tag, '/playback connection');
    var subscription;
    ws.on('message', function(data, flags) {
      var message = JSON.parse(data);
      if (message.type === 'subscribe') {
        console.log('Subscribe event:', message)
        subscription = subscribeToScanEvents(ws, message.data);
      };
      ws.onclose = function() {
        console.log(tag, 'Onclose: disposing /playback subscriptions');
        subscription && subscription.dispose();
      };
    });
  });
};
