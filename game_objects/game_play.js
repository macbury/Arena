var _ = require('underscore');
var Config = {
  updatesPerSecond: 60
};

function GamePlay() {
  this.id = new Date();
  this.id = this.id * 1;
  this.lastTick = new Date();
  this.maxPlayers = 10;
  this.players = [];
  var self = this;
  this.timer = setInterval(function(){
    self.tick();
  },1000/Config.updatesPerSecond);
}

_.extend(GamePlay.prototype, {
  players: [],
  
  enter: function(socket) {
    var player = new Player(socket);
    this.players.push(player);
  },
  
  update: function(dt) {},
  tick: function() {
    var currentTime = new Date() * 1;
    var deltaTime = currentTime - this.lastTick;
    this.lastTick = currentTime;
    this.update(deltaTime);
  }
});

exports.GamePlay = GamePlay;