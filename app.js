'use strict'

var path = require('path');
var bodyParser = require('body-parser');
var port = 9002;

var express = require('express')
var app = express();
var server = app.listen(port,function(){
	console.log("Server is running at port "+port);
});
var io = require('socket.io').listen(server);

var now;

app.use('/static', express.static(__dirname+'/static'));
app.use('/', express.static(__dirname+'/public'));

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req,res){
	console.log("get request to '/'")
	res.sendFile(__dirname+'/main.html', function(){
		res.end();
	})
})

app.get('/timer', function(req,res){
	console.log("get request to '/timer'")
	res.sendFile(__dirname+'/timer.html', function(){
		res.end();
	})
})

app.get('/timer2', function(req,res){
	console.log("get request to '/timer2'")
	res.sendFile(__dirname+'/timer2.html', function(){
		res.end();
	})
})

app.get('/timer_compare', function(req,res){
	console.log("get request to '/timer_compare'")
	res.sendFile(__dirname+'/timer_compare.html', function(){
		res.end();
	})
})

app.get('/SDVX',function(req,res){
	console.log("get request to '/SDVX'")
  res.sendFile(__dirname+'/SDVX.html',function(){
    res.end();
  })
})


setInterval(function(){
	var month = new Date().getMonth()+1;
	now = new Date().getFullYear().toString()+"-"+month.toString()+"-"+new Date().getDate().toString()+" ";
	if(new Date().getHours()<10){
		now=now+"0"+new Date().getHours().toString()+":";
	}
	else{
		now=now+new Date().getHours().toString()+":";
	}
	if(new Date().getMinutes()<10){
		now=now+"0"+new Date().getMinutes().toString()+":";
	}
	else{
		now=now+new Date().getMinutes().toString()+":";
	}
	if(new Date().getSeconds()<10){
		now=now+"0"+new Date().getSeconds().toString();
	}
	else{
		now=now+new Date().getSeconds().toString();
	}
}, 1000)

// ------------------------------------------------------------------------------------

var playerList = [];
var waitingList = [];
var onlineList = [];
var player = 1;
var gameStat = [];

var format = function(){
	for(var i=0;i<64;i++){
	    if(i%4==0)gameStat[i]=3;
	    else gameStat[i]=0;
	}
}

format();

var stat = [];
for(var i=0;i<4;i++){
	stat[i]=[];
	for(var j=0;j<4;j++){
		stat[i][j]=[];
	}
}
var chk = function(id){

	for(var i=0,j=0,k=0,l=0;l<64;i++,l++){
	    if(i==4){
	    	i=0;
	    	j++;
	    }
	    if(j==4){
	    	j=0;
	    	k++
		}
	    if(k==4){
	    	k=0;
	    	throw "k==4";
	    }
	    stat[i][j][k]=gameStat[l];
	}

	// stat part
	var x=id%4;
	var y=parseInt(id/4)%4;
	var z=parseInt(id/16);
	var jizz=1;
    var res=[0,0,0,0,0,0,0,0,0,0,0,0,0];
    for(var i=0;i<4;i++,jizz*=2){
        var point = [stat[x][y][i],stat[x][i][z],stat[i][y][z],stat[x][i][i],stat[x][i][3-i],stat[i][y][i],stat[i][y][3-i],stat[i][i][z],stat[i][3-i][z],stat[i][i][i],stat[i][i][3-i],stat[3-i][i][i],stat[3-i][i][3-i]];
        for(var line=0;line<point.length;line++){
            if(point[line]==1){
                res[line]+=jizz;
            }
            if(point[line]==2){
                res[line]-=jizz;
            }
        }
    }
    for(var i=0;i<res.length;i++){
        if(res[i]==15){
            return 1;
        }
        if(res[i]==-15){
            return 2;
        }
    }
    return 0;
}

var playing=false;
var readyToStart = false;

var gameStart = function(){
	readyToStart=false;
	if(waitingList.length>1) readyToStart=true;
	if(readyToStart && playing == false){
        console.log("Here is waiting list : "+waitingList);
    	playerList = [];
        playerList[0] = waitingList.shift(1);
	    playerList[1] = waitingList.shift(1);
    	playing=true;
    	format();
    	io.emit('restart')
    	console.log("Player 1 is : "+playerList[0]["id"]);
		io.to(playerList[0]["id"]).emit('youare',1);
        io.to(playerList[0]["id"]).emit('jizzz',"fuck you");
		io.to(playerList[1]["id"]).emit('youare',2);
		console.log("sended youare to "+playerList[0]["id"]);
		player=1;
		io.emit('downed',gameStat,player);
    	/*game start set.......*/
   	}
}

gameStart();


io.sockets.on('connection', function(socket){
	var id = socket.id;
	var name;
	console.log("somebody in")
	socket.emit('loginHint',playing);
	if(playing)socket.emit('downed',gameStat,player);
	if(playing==false)socket.emit('downed',gameStat,3);
	socket.on('loginreq', function(name,join){
        if(typeof(name)=='string'){
            name = name.replace(/&/g,"&amp;");
            name = name.replace(/</g,"&lt;");
            name = name.replace(/>/g,"&gt;");
        }
        if(typeof(join)=='string'){
            join = join.replace(/&/g,"&amp;");
            join = join.replace(/</g,"&lt;");
            join = join.replace(/>/g,"&gt;");
        }
		if(join){
			waitingList.push({name:name,id:id});
		}
		onlineList.push({name:name,id:socket.id});
		gameStart();
	})
	socket.on('down',function(num){
        if(typeof(num)=='string'){
            num = num.replace(/&/g,"&amp;");
            num = num.replace(/</g,"&lt;");
            num = num.replace(/>/g,"&gt;");
        }
		if(playing && id==playerList[player-1]["id"]){
            gameStat[num]=player;
            var winner=chk(num);
            if(winner){
                io.emit('gameOver',winner,playerList[winner-1]["name"],false)
                playing=false;
                console.log("there is a winner");
                for(var i=0;i<64;i++){
                	if(gameStat[i]==3)gameStat[i]=0;
                }
            	io.emit('downed',gameStat,3);
                waitingList.push(playerList[1]);
    			waitingList.push(playerList[0]);
            	setTimeout(function(){
        			gameStart();
        		},10000);
            }
            else{
	            if( num%4 != 3 )gameStat[num+1]=3;
	            player = player==1 ? 2 : 1;
	            io.emit('downed',gameStat,player);	
            }
		}
	})
	socket.on('disconnect',function(){
		console.log(playerList);
		for(var i=0;i<onlineList.length;i++){
			if(onlineList[i]["id"]==id){
				onlineList.splice(i,1);
				console.log("onlineList remove success")
			}
		}
		for(var i=0;i<waitingList.length;i++){
			if(waitingList[i]["id"]==id){
				waitingList.splice(i,1);
				console.log("waitList remove success")
			}
		}
		if(playing){
			if(playerList[0]["id"]==id){
				io.emit('gameOver',2,playerList[1]["name"],true)
	            playing=false;
	            for(var i=0;i<64;i++){
	            	if(gameStat[i]==3)gameStat[i]=0;
	            }
	        	io.emit('downed',gameStat,3);
        		waitingList.push(playerList[1]);
	        	setTimeout(function(){
	        		gameStart();
	        	},10000);
			}
			if(playerList[1]["id"]==id){
				io.emit('gameOver',1,playerList[0]["name"],true)
	            playing=false;
	            for(var i=0;i<64;i++){
	            	if(gameStat[i]==3)gameStat[i]=0;
	            }
	        	io.emit('downed',gameStat,3);
	        	waitingList.push(playerList[0]);
	        	setTimeout(function(){
	        		gameStart();
	        	},10000);
			}
		}
		console.log("somebody leave")
	})
    
    //chatroom==========
    
    setInterval(function(){
        socket.emit("now",{date:now});
    },1000)

    socket.on('sendchat', function(text,name){
        if(typeof(text)=='string'){
            text = text.replace(/&/g,"&amp;");
            text = text.replace(/</g,"&lt;");
            text = text.replace(/>/g,"&gt;");
        }
        if(typeof(name)=='string'){
            name = name.replace(/&/g,"&amp;");
            name = name.replace(/</g,"&lt;");
            name = name.replace(/>/g,"&gt;");
        }
        console.log(name+" "+text+" "+now);
        io.emit("pubchat", text, name ,now);
    });

    socket.on('disconnect', function(){
        
    })
})