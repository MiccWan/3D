'use strict'

// require modules
var path       = require('path');
var bodyParser = require('body-parser');
var express    = require('express')
var app        = require('express')();
var server     = require('http').Server(app);
var io         = require('socket.io')(server);
var http       = require('http');
var colors     = require('colors/safe');
var rdmString  = require('randomstring');

// variables
var fs = require('fs');
var recordRoot = __dirname + "/saves/" + rdmString.generate(16) + '/';
var fileNum = 0;
fs.mkdir(recordRoot, function (err) {
	if(err) throw err;
});
var port = 9003;
colors.setTheme ({
	setup : ['green', 'underline'],
	info  : ['grey', 'underline'],
	error : ['red', 'underline'],
	title : ['blue', 'bold']
});

app.use('/static', express.static(__dirname + '/static'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
	console.log( colors.title("[System] ") + "Get request to '/'" );
	res.sendFile(__dirname + '/main.html', function () {
		res.end();
	});
});

function getTime () {
	let now = new Date();
	return now.toLocaleDateString() + ' ' + now.toLocaleTimeString()	
}

// Bingo part

// variables
var playerList = [];
var waitingList = [];
var onlineList = [];
var player = 1;
var playing = false;
var stat_1D = []; //creating 1D array
var stat_3D = []; //creating 3D array

function gameOver (gameInfo){
	
}





function writeRecord (){
	record += "-1 -1 -1\n"
	let recordPath = recordRoot + fileNum.toString();
	fs.writeFile(recordPath, record, function (err) {
		if(err) throw err;
		record = "";
	});
    fileNum++;
}


io.sockets.on('connection', function(socket){

	//when somebody connecting
	var name;
	console.log( colors.title("[Bingo] ") + colors.info("Someone joined") );
	socket.emit('loginHint', playing);
	if (playing) socket.emit('refreshState', stat_1D, player);
	else socket.emit('refreshState', stat_1D, 3);

	//when receiving login request
	socket.on('loginreq', function (name, join){
		// escape
		if (typeof(name) == 'string'){
			name = name.replace(/&/g,"&amp;");
			name = name.replace(/</g,"&lt;");
			name = name.replace(/>/g,"&gt;");
		}
		if (join) waitingList.push({ name: name, id: socket.id });
		onlineList.push({ name: name, id: socket.id });
		tryStart();
	})
	socket.on('downReq', function ( num ) {
		if (typeof(num) != 'number') return;
		downReq(socket.id, num);
		
	});
	socket.on('disconnect',function(){
		console.log(colors.title("[Bingo] ") + colors.info("Someone has discennected"));

		// remove info from lists
		for (let i = 0; i < onlineList.length; i++){
			if (onlineList[i]["id"] == socket.id){
				onlineList.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < waitingList.length; i++){
			if (waitingList[i]["id"] == socket.id) {
				waitingList.splice(i, 1);
				break;
			}
		}

		// if player leave
		if (playing){
			if (playerList[0]["id"] == socket.id){
				gameOver({ 'endWay': 0, 'winnerId': 2, 'winnerName':playerList[1].name })
				waitingList.push(playerList[1]);
			}
			if (playerList[1]["id"] == socket.id){
				gameOver({ 'endWay': 0, 'winnerId': 1, 'winnerName':playerList[0].name });
				waitingList.push(playerList[0]);
			}
		}
	});
});

server.listen(port, function () {
	console.log(colors.setup("Server is running at port " + port));
});




//Notes :
// set player to 3 while playing is false
// edit Line124 : player = 3;
// to optimize Line 173
// may affect : wrong index with player-1

// sockets document
// 'gameOver': { endWay[, winnerId, winnerName ]} , 
//		endWay: 0 = leave, 1,2 = player wins, 3 = draw
