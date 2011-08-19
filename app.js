
/**
 * Module dependencies.
 */

var express = require('express');
var _ = require('underscore');
var everyauth = require('everyauth');
var app = module.exports = express.createServer();
var Facebook = require(__dirname+"/config/facebook").Config;
var io = require('socket.io');
var GamePlay = require(__dirname+"/game_objects/game_play").GamePlay,
    Player = require(__dirname+"/game_objects/player").Player;

var Store = {
  Rooms: [],
  Players: []
}

function login_required(req, res, next){
  if(req.session.user_id) {
    req.user = _.detect(Store.Players, function(p){ return parseInt(p.id) == parseInt(req.session.user_id) });
    next(); 
  } else {
    res.redirect('/auth/facebook');
  }
}

everyauth.facebook
  .appId(Facebook.AppId)
  .appSecret(Facebook.Secret)
  //.authPath('/oauth/access_token')
  .handleAuthCallbackError( function (req, res) {
    // If a user denies your app, Facebook will redirect the user to
    // /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
    // This configurable route handler defines how you want to respond to
    // that.
    // If you do not configure this, everyauth renders a default fallback
    // view notifying the user that their authentication failed and why.
  })
  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
    session.user_id = fbUserMetadata.id;
    session.access_token = accessToken;
    
    var player = _.detect(Store.Players, function(p){ return parseInt(p.id) == parseInt(session.user_id) });
    
    if(player == null) {
      var player = new Player({
        id: session.user_id,
        name: fbUserMetadata.name
      });
      Store.Players.push(player);
    }
    
    return player;
  })
  .scope(Facebook.Scope)  
  .redirectPath('/');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(everyauth.middleware());
});

app.dynamicHelpers({
  current_user: function(req, res){
    return req.user;
  }
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    rooms: Store.Rooms,
    players: Store.Players
  });
});

app.get('/rooms/new', login_required, function(req, res){
  res.render('new_room', {});
});

app.post("/rooms", login_required, function(req, res){
  //console.log(req.params);
  //console.log(req.body.room);
  var room = new GamePlay(req.body.room);
  Store.Rooms.push(room);
  res.redirect('/rooms/'+room.id);
});

app.get('/rooms/:id', login_required, function(req, res){
  var room = _.detect(Store.Rooms, function(r){ return r.id == req.params['id'] });
  if (room) {
    req.user.join(room);
    //console.log(room.players);
    res.render('play', { sid: req.user.get('sid') });
  } else {
    throw new NotFound;
  }
});

app.listen(3000);
socket = io.listen(app);

socket.configure(function (){
  socket.set('authorization', function (handshakeData, callback) {
    var player = _.detect(Store.Players, function(p){ return p.get('sid') == handshakeData.query.sid });
    if (player) {
      console.log("Authorized "+player.get('name')+ " with sid "+player.get('sid'));
      callback(null, player);
    } else {
      console.log("UnAuthorized ");
      callback('unauthorized');
    }
  });
});

socket.sockets.on('connection', function (client) {
  var player = _.detect(Store.Players, function(p){ return p.get('sid') == client.handshake.query.sid });
  console.log("Player "+player.get('name')+ " have connected");
  player.connect(client);
  //console.log(socket.handshake.sid); /
  /*socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });*/
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
