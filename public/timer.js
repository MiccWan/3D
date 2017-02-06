var times = 0;
var intt=setInterval(function(){
	var myWorker = new Worker('worker.js');
	times++;
},10);

// var intt = setInterval(function(){
// 	var i=0;
// 	for(;i<9999999;i++)i++,i--;
// 	times++;
// },10)

setInterval(function(){
	console.log(Date(),times);
	times=0;
},1000)

function stop(){
	clearInterval(intt);
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