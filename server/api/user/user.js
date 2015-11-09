'use strict';

var Rx = require('rx')
  , request = require('request')
  , _ = require('underscore')
  , config = require('../../config')
  ;

var users = _.range(0, 350).map(function(index) {
  return {
    id: index
  , beaconId: index
  , name: 'Beacon ' + index
  }
})

var tag = 'USER';

var userInit = Rx.Observable.create(function (observer) {
  console.log(tag, 'Getting registration users');
  request.get({
    url:  config.get('USER_ENDPOINT')
  , timeout: 20000
  }
  , function (err, res, body) {
      var enqueueCount;
      if (res && res.statusCode === 200 && body) {
        observer.onNext(JSON.parse(body));
        observer.onCompleted();
      } else {
        var msg = 'Error: ';
        if (res && res.statusCode) {
          msg += res.statusCode;
        }
        console.log(tag, msg);
        console.log(tag, 'err', err);
        console.log(tag, 'res code', res.statusCode);
        console.log(tag, 'body', body);
        msg += err;
        observer.onError(msg);
      }
    });
})
.retryWhen(function(errors) {
  return errors.delay(2000);
})
.flatMap(function(array) {
  return array;
})
.map(function(data) {
  var beaconId = data.fields.beaconId;
  try {
    users[beaconId].name = data.fields.showName === true || data.fields.showName === 'true' ? data.fields.name : 'Beacon ' + beaconId;
  } catch(error) {
    console.log('Unknown beaconId', beaconId);
  }
})
.tapOnCompleted(function() {
  console.log('Users updated');
});


var getUser = function(beaconId) {
  var userMap = {
  '21940': 1,
  '63138': 2,
  '57492': 3,
  '31855': 4,
  '21708': 5,
  '33274': 6,
  '24424': 7,
  '56901': 8,
  '43366': 9,
  '63595': 10,
  '506'  : 12
  }
  var userId = beaconId > 326 ? userMap[beaconId] : beaconId;
  return users[userId] || {
  id: userId
  , beaconId: beaconId
  , name: ''
  };
};

module.exports = exports = {
  getUser: getUser
, userInit: userInit
};
