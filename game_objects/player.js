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
    current_room: null,
    sid: null,
  },
  
  initialize: function(attributes) {
    this.set({
      'health': this.maxHealth,
      "sid": Base.generate_uid()
    });
  },
  
  join: function(new_room) {
    if (this.get('current_room')) {
      var room = this.get('current_room');
      room.exit(this);
    }

    this.set({
      "current_room": new_room,
      "sid": Base.generate_uid()
    });
    
    if (new_room) {
      new_room.enter(this);
    }
  },
  
  disconnect: function() {
    
  }
});

exports.Player = Player;