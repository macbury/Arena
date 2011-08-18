var _ = require('underscore');

function Player (socket) {
  this.socket = socket;
  this.health = this.maxHealth;
}

_.extend(Player.prototype, {
  x: 0,
  y: 0,
  rotation: 0,
  
  maxHealth: 100,
  health: 0,
  
  name: "Anynomus",
});

exports.Player = Player;