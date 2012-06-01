$(document).ready(function() {
  var r = 960;
  first = true;

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
	
	//node.remove("circle");
	//node.remove("text");

	node.append("circle")
		.attr("r",function(d) {return d.r;})
		.attr("fill",function(d) {return "#CCC";})
		.text(function(d) {return d.hashtag});
	  
	  node.append("text")
		.attr("text-anchor","middle")
		.attr("dy",".3em")
		.text(function(d) {return d.hashtag + ": " + format(d.value)});
	  first = false;
  }
	

  /* SOCKET IO STUFF */
  var socket = io.connect('http://localhost');
  socket.on('receiveData', function (data) {
	$('#intro-message').hide();
	drawData(data);
  });
  /* END SOCKET IO STUFF */

  
});