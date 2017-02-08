var times = 0,times_1=0;
var myWorker = new Worker('worker.js');
var intt=setInterval(function(){
    myWorker.postMessage(7122);
	times++;
},10);

var intt2 = setInterval(function(){
 	var i=0;
    for(;i<9999999;i++)i++,i--;
    times_1++;
},10)
var intt3 = setInterval(function(){
 	var i=0;
    for(;i<9999999;i++)i++,i--;
},10)
var intt4 = setInterval(function(){
 	var i=0;
    for(;i<9999999;i++)i++,i--;
},10)

setInterval(function(){
	console.log("use worker:"+times,"not worker"+times_1);
	times=0;
    times_1=0;
},1000)

function stop(){
	if(intt)clearInterval(intt);
    if(intt2)clearInterval(intt2);
}



// function myInterval(func,interval){
// 	var start=Date.now(),time,expected=interval;
// 	func();
// 	setTimeout(function(){
// 		setInterval(function(){
// 			time = Date.now();
// 			setTimeout(function(){
// 				func();
// 			},expected-(time-start))
// 			expected+=interval;
// 		},interval)
// 	},0.9*interval)
// }
