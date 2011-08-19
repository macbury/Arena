var _ = require('underscore');
var GameObject = require("./game_object").GameObject;
var Config = {
  updatesPerSecond: 1
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
    _.each(this.players, function(player) {
      player.send("server:delta", dt);
    });
  },
  
  findPlayer: function(player) {
    return _.detect(this.players, function(p){ return parseInt(p.id) == parseInt(player.id) });
  },
  
  hasPlayer: function(player) {
    return (this.findPlayer(player) != null);
  },
  
  tick: function() {
    var currentTime = new Date() * 1;
    var deltaTime = currentTime - this.lastTick;
    this.lastTick = currentTime;
    this.update(deltaTime);
  },
  
  enter: function(player) {
    if (this.hasPlayer(player)) {
      console.log("Player "+player.get("name")+" is alredy joined room "+this.get('name'));
    } else {
      console.log("Player "+player.get("name")+" enters room "+this.get('name'));
      this.players.push(player);
    }
  }, 
  
  exit: function(player) {
    var self = this;
    console.log("Player "+player.get("name")+" exits room "+this.get('name'));
    _.each(this.players, function(p, pos) {
      if (parseInt(p.id) == parseInt(player.id)) {
        self.players.splice(pos, 1);
      } 
    });
    player.disconnect();
  }
});


exports.GamePlay = GamePlay;