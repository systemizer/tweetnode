// var socket = io.connect('http://localhost');
// socket.on('aloha', function (data) {
//   alert("ALOHA");
// });



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

  d3.json("/static/js/data.json",function(json) {
	var node = vis.selectAll("g.node")
	  .data(bubble.nodes(json))
	  .enter().append("g")
	  .attr("class","node")
	  .attr("transform",function(d) { return "translate("+d.x+","+d.y+")";});

	node.append("title")
	  .text(function(d) {console.log(d);return d.hashtag + ": " + format(d.value)});
	
	node.append("circle")
	  .attr("r",function(d) {return d.r;})
	  .attr("fill",function(d) {return "#CCC";})
	  .text(function(d) {return d.hashtag});

	node.append("text")
	  .attr("text-anchor","middle")
	  .attr("dy",".3em")
	  .text(function(d) {return d.hashtag;});
			
  });
  
})