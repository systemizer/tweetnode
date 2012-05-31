var twitter = require("ntwitter");
var config = require("./config");
var redis = require("redis");
var http = require("http");
var io = require("socket.io");
var fs = require("fs");
var static = require("node-static");

var file = new (static.Server)(config.static.webroot)

httpServer = http.createServer(function(req,res){
  /*static server */
  console.log(req.url);
  if (req.url.indexOf(config.static.weburl)==0) {
	file.serve(req,res,function(err,result) {
	  if (err) {		
		console.log("ERROR "+err.message);
		res.writeHead(err.status,err.headers);
		res.end();
	  } 
	  else {
		console.log("%s - %s",req.url,res.message);
	  }
	})
  }

  /* dynamic server */
  else {
	fs.readFile(__dirname+'/client.html',function(err,data) {
	  res.writeHead(200,{'Content-Type':'text/html'});
	  res.write(data);
	  res.end();
	});
  }
});
httpServer.listen(8000);

var ioServer = io.listen(httpServer);

/* BEGIN SOCKET.IO */

ioServer.on("connection",function(socket) {
  socket.emit("aloha",{});
});

/* END SOCKET.IO */



// /* TWITTER AND REDIS */

// var redisClient = redis.createClient();

// redisClient.on("error",function(err) {
//   console.log("ERROR " + err);
// });

// var multi = redisClient.multi();
// var counter = 0;
// var execLock = 1; //1 == unlocked. 0 == locked

// node = new twitter({
//   consumer_key:config.twitter.consumer_key,
//   consumer_secret:config.twitter.consumer_secret,
//   access_token_key:config.twitter.access_token_key,
//   access_token_secret:config.twitter.access_token_secret
// });


// node.stream("statuses/sample",function(stream) {
//   stream.on("data",function(data) {
// 	console.log(counter);
// 	if (data.entities.hashtags.length) {	  
// 	  data.entities.hashtags.map(function(hashtag) {
// 		multi.incr(hashtag.text);
// 		counter++;
// 		if (counter>config.buffer_max_size && execLock) {
// 		  execLock = 0;
// 		  counter = 0;
// 		  multi.exec();
// 		  execLock = 1;
// 		}
// 	  });
// 	}
//   });
// });

/* END TWITTER AND REDIS */

  
  