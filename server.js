var twitter = require("ntwitter");
var config = require("./config");
var redis = require("redis");
var http = require("http");
var io = require("socket.io");
var fs = require("fs");
var static = require("node-static");

var file = new (static.Server)(config.static.webroot)

/* UTILS */
function getLowKey(cache,high_keys) {
  var low_key = high_keys[0];
  var low_val = cache[low_key];
  high_keys.forEach(function(value,index) {
	if (cache[value]<low_val) {
	  console.log("found lower key " + value + " with value " + cache[value]);
	  low_key = value;
	  low_val = cache[low_key];
	}
  });
  return low_key;
}
  

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

httpServer = http.createServer(function(req,res){
  /*static server */
  //console.log(req.url);
  if (req.url.indexOf(config.static.weburl)==0) {
	file.serve(req,res,function(err,result) {
	  if (err) {		
		console.log("ERROR "+err.message);
		res.writeHead(err.status,err.headers);
		res.end();
	  } 
	  else {
		//console.log("%s - %s",req.url,res.message);
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
  //noop
});

/* END SOCKET.IO */

var high_keys = [];
var cache;

/* TWITTER AND REDIS */

var redisClient = redis.createClient();

redisClient.on("error",function(err) {
  console.log("ERROR " + err);
});

redisClient.flushdb();

var multi = redisClient.multi();
var counter = 0;
var execLock = 1; //1 == unlocked. 0 == locked
var cur_txn = [];
var cache = {};

node = new twitter({
  consumer_key:config.twitter.consumer_key,
  consumer_secret:config.twitter.consumer_secret,
  access_token_key:config.twitter.access_token_key,
  access_token_secret:config.twitter.access_token_secret
});

node.stream("statuses/sample",function(stream) {
  stream.on("data",function(data) {
	//console.log(counter);
	if (data.entities.hashtags.length) {	  
	  data.entities.hashtags.map(function(hashtag) {
		//console.log(hashtag.text);
		if (high_keys.length<30 && high_keys.indexOf(hashtag.text)==-1) {
		  high_keys.push(hashtag.text);
		  cache[hashtag.text] = 1;
		}  else if (high_keys.length<30) {
		  cache[hashtag.text] = cache[hashtag.text]+1;
		}
		
		multi.incr(hashtag.text);
		cur_txn.push(hashtag.text);

		counter++;
		if (counter>config.buffer_max_size && execLock) {
		  execLock = 0;
		  counter = 0;
		  //console.log("getting cached value of lowest key");
		  //console.log(cache);
		  //console.log(high_keys[high_keys.length-1]);

		  var cur_txn_copy = cur_txn.map(function(x) {return x;});
		  cur_txn = [];
		  multi.exec(function(err,replies)
					 {
					   //console.log(cache);
					   //console.log("LOW VAL: " +low_val + " LOW KEY " + low_key);
					   replies.map(function(value,index) {
						 var low_key = getLowKey(cache,high_keys);
						 var low_val = cache[low_key];

						 //console.log("parsing int");
						 var new_val = parseInt(value);						 
						 console.log("NEW VAL: " + new_val + " for " + cur_txn_copy[index]);
						 console.log("LOW VAL: " +low_val + " LOW KEY " + low_key);
						 if (new_val > low_val && high_keys.indexOf(cur_txn_copy[index])==-1) {
						   console.log("HELLLLLLLLOOOOOOOO");
						   delete cache[high_keys.po];
						   high_keys.remove(high_keys.indexOf(low_key));
						   cache[cur_txn_copy[index]] = new_val;
						   high_keys.push(cur_txn_copy[index]);
						 }
					   });
					   console.log(high_keys);
					   redisClient.mget(high_keys,function(err,res) {
						 cur_data = {'name':'data','children':[]};
						 res.map(function(value,index) {
						   cur_data.children.push({'hashtag':high_keys[index],'value':value});
						 });
						 //console.log(cur_data);
						 ioServer.sockets.emit("receiveData",cur_data);
					   });
					 });
		  multi = redisClient.multi();		  
		  
		  execLock = 1;
		}
	  });
	}
  });
});


/* END TWITTER AND REDIS */

