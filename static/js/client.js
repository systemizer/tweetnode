$(document).ready(function() {
  var r = 960;

  var bubble = d3.layout.pack()
	.sort(null)
	.size([r,r]);
  format = d3.format(",d");

  var vis = d3.select("#chart").append("svg")
	.attr("width",r)
	.attr("height",r)
	.attr("class","bubble");

  

  var drawData = function(data) {
	var node = vis.selectAll("g.node")
	  .data(bubble.nodes(data),function(d) {return d.hashtag;});

	node.enter().append("g");
	node.exit().remove();
	node.call(setThemAll);
  }

  var setThemAll = function(node) {
	node.attr("class","node")
	  .transition().duration(2000)
	  .attr("transform",function(d) { return "translate("+d.x+","+d.y+")";});
	
	node.append("circle")
		.attr("r",function(d) {return d.r;})
		.attr("fill",function(d) {return "#CCC";})
		.text(function(d) {return d.hashtag});
	  
	node.append("a")
	  .attr("xlink:href",function(d) {return "https://twitter.com/search/" + d.hashtag;})
	  .attr("target","_blank")
	  .append("text")
	  .attr("text-anchor","middle")
	  .attr("dy",".3em")
	  .text(function(d) {return d.hashtag + ": " + format(d.value)});
  }
	

  /* SOCKET IO STUFF */
  var socket = io.connect('http://tweetnode.com');
  socket.on('receiveData', function (data) {
	$('#intro-message').hide();
	drawData(data);
  });
  /* END SOCKET IO STUFF */

  
});