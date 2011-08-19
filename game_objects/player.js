var _ = require('underscore');
var GameObject = require("./game_object").GameObject;
var Base = require("./base_helpers");

var Player = GameObject.extend({
  x: 0,
  y: 0,
  rotation: 0,
  
  fb_id: null,
  
  maxHealth: 100,
  health: 0,
  
  attributes: {
    name: "Anynomus",
    health: 0,
  },
  
  initialize: function(attributes) {
    this.set({
      'health': this.maxHealth
    });
  }
});

exports.Player = Player;