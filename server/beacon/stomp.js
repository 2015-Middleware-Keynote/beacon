'use strict';

var Rx = require('rx')
  , Stomp = require('stompjs')
  , debuglog = require('debuglog')('stomp')
  , config = require('../config')
  ;

var tag = 'STOMP';

var username = config.get('AMQ_USER');
var password = config.get('AMQ_PASSWORD');

var connection = Rx.Observable.create(function (observer) {
  console.log(tag, new Date());
  console.log(tag, 'Connecting...');
  var client = Stomp.overWS('ws://184.72.167.147:61614', ['v12.stomp']);
  // client.heartbeat = {outgoing: 0, incoming: 0}; // a workaround for the failing heart-beat
  // client.heartbeat.incoming = 20000;
  client.debug = function(m) {
    debuglog(new Date());
    debuglog(m);
  };
  client.connect(username, password, function(frame) {
    debuglog(frame.toString());
    observer.onNext(client);
  }, function(error) {
    console.error(error);
    observer.onError(new Error(error));
  });
})
.retryWhen(function(errors) {
  return errors.delay(2000);
}).shareReplay();

var feeds = {};

var getStompFeed = function(queue) {
  if (!feeds[queue] ) {
    feeds[queue] = connection.flatMap(function(client) {
      return Rx.Observable.create(function (observer) {
        console.log(tag, 'Subscribing to ' + queue + '...');
        client.subscribe(queue, function(message) {
          message.ack();
          observer.onNext(message);
          return function() {
            client.disconnect(function() {
              console.log(tag, 'Disconnected.');
            });
          };
        }
        , {'ack': 'client'}
        )
      })
    }).share();
  };
  return feeds[queue];
};

var getBeaconEventsFeed = function() {
  var feed = '/topic/beaconEvents';
  return getStompFeed(feed);
};

var getBeaconEventsProcessedFeed = function() {
  var feed = config.get('STOMP_FEED');
  return getStompFeed(feed);
};

module.exports = {
  getBeaconEventsFeed: getBeaconEventsFeed
, getBeaconEventsProcessedFeed: getBeaconEventsProcessedFeed
};
