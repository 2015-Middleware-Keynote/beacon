'use strict';

var Rx = require('rx')
  , app   = require('./app.js')
  , http = require('http')
  , port  = app.get('port')
  , ip = app.get('base url')
  , log   = 'Listening on ' + ip + ':' + port
  , user = require('./api/user/user.js')
  ;

var tag = 'SERVER';

var server = http.createServer(app);
server.listen(port, ip);
console.log(tag, log);

require('./beacon/ws/beacon-live')(server);
require('./beacon/ws/beacon-playback')(server);
require('./beacon/ws/beacon-random')(server);
require('./beacon/ws/broker')(server);
