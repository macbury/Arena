var _ = require('underscore');
var GameObject = require("./game_object").GameObject;
var Config = {
  updatesPerSecond: 60
};

GamePlay = GameObject.extend({
  players: [],
  maxPlayers: 10,
  prefix: "room_",
  
  initialize: function(attributes, options) {
    this.lastTick = new Date();
    var self = this;
    this.timer = setInterval(function(){
      self.tick();
    },1000/Config.updatesPerSecond);
  },
  
  enter: function(socket) {
    var player = new Player(socket);
    this.players.push(player);
  },
  
  update: function(dt) {
    
  },
  tick: function() {
    var currentTime = new Date() * 1;
    var deltaTime = currentTime - this.lastTick;
    this.lastTick = currentTime;
    this.trigger('update',deltaTime);
  }
});


exports.GamePlay = GamePlay;