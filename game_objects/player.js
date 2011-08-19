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
  client_socket: null,
  
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
  
  send: function(event, data) {
    if (this.client_socket) {
      this.client_socket.emit(event, data);
    } else {
      
    }
  },
  
  connect: function(client_socket) {
    this.disconnect();
    this.client_socket = client_socket;
  },
  
  disconnect: function() {
    if(this.client_socket) {
      this.client_socket.disconnect();
    }
    this.client_socket = null;
  }
});

exports.Player = Player;