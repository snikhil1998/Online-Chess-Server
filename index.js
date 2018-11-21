var express = require('express');
var app = express();
app.use(express.static('homepage'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 4000;

var current_games = {};
var players = {};
var lobby_players = {};

app.get('/homepage/', function(req, res) {
	res.sendFile(__dirname + '/homepage/homepage.html');
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + 'index.html');
});

io.on('connection', function(socket){

	socket.on('login', function(player_id) {
		login(socket, player_id);
	});

	function login(socket, player_id){
		socket.player_id = player_id;
		if (players[player_id] != null){
			//TO-DO
            Object.keys(players[player_id].games).forEach(function(game_id) {
				console.log('gameid: ' + game_id);
			});
		}
		else{
			players[player_id] = {player_id: socket.player_id, games:{}};
		}
		socket.emit('login', {players: Object.keys(lobby_players), games: Object.keys(players[player_id].games)});

		socket.broadcast.emit('enterlobby', socket.player_id);
		lobby_users[player_id] = socket;
	}

	socket.on('challenge', function(opponent_id) {
		socket.broadcast.emit('exitlobby', socket.player_id);
		socket.broadcast.emit('exitlobby', opponent_id);
		var game = {id: Math.floor((Math.random() * 100) + 1), board: null, users: {white: socket.userId, black: opponentId}};
		socket.game_id = game.id;
		active_games[game.id] = game;
		users[game.users.white].games[game.id] = game.id;
		users[game.users.black].games[game.id] = game.id;
		lobby_users[game.users.white].emit('entergame', {game: game, color: 'white'});
		lobby_users[game.users.black].emit('entergame', {game: game, color: 'black'});
		delete lobby_users[game.users.white];
		delete lobby_users[game.users.black];
		socket.broadcast.emit('gameadd', {gameId: game.id, gameState:game});
	});

	socket.on('resumegame', function(game_id) {
		socket.game_id = game_id;
		var game = active_games[game_id];
		users[game.users.white].games[game.id] = game.id;
		users[game.users.black].games[game.id] = game.id;
		if (lobbyUsers[game.users.white]) {
			lobbyUsers[game.users.white].emit('entergame', {game: game, color: 'white'});
			delete lobbyUsers[game.users.white];
		}
		if (lobbyUsers[game.users.black]) {
			lobbyUsers[game.users.black] && lobbyUsers[game.users.black].emit('entergame', {game: game, color: 'black'});
			delete lobbyUsers[game.users.black];
		}
	});
	socket.on('move', function(msg) {
		socket.broadcast.emit('move', msg);
		active_games[msg.game_id].board = msg.board;
		console.log(msg);
    });
});