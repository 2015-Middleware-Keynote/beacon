'use strict';

var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;

 var ScanSchema = new mongoose.Schema({
  beaconId: {type: String, required: true, index: true},
  locationCode: {type: String, required: true},
  type: {type: String, required: true}, // check-in / check-out
  retransmit: {type: Boolean, default: false, index: true},
  timestamp: {type: Date, required: true, index: true},
  created: { type: Date, default: Date.now }
});

module.exports = exports = {
  Scan: mongoose.model('Scan', ScanSchema)
, ScanLatest: mongoose.model('ScanLatest', ScanSchema)
};
