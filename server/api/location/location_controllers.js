'use strict';

var locations = [
  { id: 0, x_i: 700, y_i: 300, name: 'Scanner A', code: 'scannerA'}
, { id: 1, x_i: 700, y_i: 900, name: 'Scanner B', code: 'scannerB'}
];

var tag = 'API/LOCATION';

var locationHashMap = {};
locations.forEach(function(location) {
  locationHashMap[location.code] = location;
});

var convertLocation = function(code) {
  var location = locationHashMap[code];
  if (!location) {
    if (code.lastIndexOf('x')) {
      console.log(tag, 'Exit event leaked through:', code);
    } else {
      console.log(tag, 'Unmapped location code:', code);
    };
  };
  return location;
}

module.exports = exports = {
  getAll: function(req, res, next) {
    res.json(locations);
  }
, getLocation: function(req, res, next) {
    res.json(locations[req.params.id]);
  }
, locations: locations
, convertLocation: convertLocation
};
