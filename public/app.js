var COMMENT_REGEX = 't'
var MORE_REGEX = 'more'
var STEEL_BLUE = '#4682b4'
var FUZZY_GREY = '#eef3f8'
var X_PADDING = 10;

// a convenience wrapper
function Thread(data) {
  this.thread = data[0].data.children[0].data
  this.id = this.thread.id
  this.title = this.thread.title
  this.selftext = this.thread.selftext
  this.replies = data[1].data.children.map(function (e) {
    return new (build_strategy(e.kind))(e)
  });
}

// Edge case ill deal with later
function More() {
  // get request and stream
}


function Comment(raw) {
  this.comment = raw.data
  this.upvotes = this.comment.ups
  this.body = this.comment.body
  if (this.comment.replies !== "" && this.comment.replies !== undefined) {
    this.replies = this.comment.replies.data.children.map(function (e) {
      return new (build_strategy(e.kind))(e)
    })
  } else {
    this.replies = null
  }
}

Comment.prototype.is_comment = is_comment;
Comment.prototype.is_more = is_more;
More.prototype.is_comment = is_comment;
More.prototype.is_more = is_more;

function is_comment() { return Comment.prototype.isPrototypeOf(self) }
function is_more() { return More.prototype.isPrototypeOf(self) }

function build_strategy(type) {
  if (type.includes(COMMENT_REGEX))
    return Comment
  if (type.includes(MORE_REGEX))
    return More
}

var thread;
var reddit_loaded = new CustomEvent('reddit_data');
$(document).ready(bootstrap)

function bootstrap() {
  document.addEventListener('reddit_data', build_d3);
  get_reddit_data();
}

function get_reddit_data() {
  $.get('reddit.json').
    then(function (data, status) {
      thread = new Thread(data);
      document.dispatchEvent(reddit_loaded);
    })
}

function build_d3() {
  console.log("building d3")
  graph = new RedditGraph();
}

function reflect_data(d) {
  return d
}

function rgb(r, g, b) {
  return "rgb(" + [r, g, b].join(",") + ")";
}

function RedditGraph() {
  this.create_svg();
  this.create_tree();
  this.update_root();
}

RedditGraph.prototype.create_tree = function(){
  this.hierarchy =   d3.hierarchy(thread, function(d){ return d.replies; })
  this.tree = d3.tree();
  this.nodes = this.tree(this.hierarchy);
}

RedditGraph.prototype.update_root = function(){
  root = this.svg.selectAll('rect.root')
  .data([this.nodes.data])
  .enter()
  .append('rect')
  .attr('y', this.h / 2)
  .attr('x', 0)
  .attr('fill', STEEL_BLUE)
  .attr('width', this.w / 4)
  .attr('height', this.h / 6)

  this.svg.append('text')
        .text(thread.title)
        .attr('y', this.h/2 + this.h/12 )
        .attr('x', 0)

  this.update_children(this.nodes)
}

RedditGraph.prototype.update_children = function(parent, i){

  var position_chart = {};

  for(i=0; i <= this.nodes.height; i++){
    position_chart[i] = 0;
  }

  this.svg.selectAll('rect.children')
  .data(parent.descendants().splice(1))
  .enter()
  .append('rect')
  .attr('y', function(d){  
    var depth = d.depth;
    var i = position_chart[depth]++;
    return i * 30;
  })
  .attr('x', function(d) { return this.w /4 + 10 + d.depth * 20; }.bind(this))
  .attr('fill', STEEL_BLUE)
  .attr('id', function(d){ return d.id;})
  .attr('width', 10)
  .attr('height', 10 )
}


RedditGraph.prototype.create_root_node = function(){
  root = this.svg.selectAll('rect')
          .data([thread])
          .enter()
          .append('rect')
          .attr('class', 'root')
          .attr('y', this.h/2)
          .attr('x', 0)
          .attr('fill', STEEL_BLUE)
          .attr('width', this.w / 4)
          .attr('height', this.h / 6)
          .attr('id', thread.id)

  this.svg.append('text')
          .text(thread.title)
          .attr('y', this.h/2 + this.h/12 )
          .attr('x', 0)

  this.render_children(root)
};

RedditGraph.prototype.render_children = function(root){
  comments = root.datum().comments
  debugger
  comment_nodes = this.svg.selectAll('rect')
  .data(comments)
  .enter()
  .append('rect')
  .attr('y', function(d, i){
    return i * 30
  })
  .attr('x', parseInt(root.attr('width')) + X_PADDING)
  .attr('fill', STEEL_BLUE)
  .attr('width', 10)
  .attr('id', function(d){ return d.id })
  .attr('height', 10)

  var single_node = comment_nodes
  this.render_children(single_node)
};

RedditGraph.prototype.create_svg = function () {
  this.h = 720;
  this.w = 1360;
  this.svg = d3.select('body')
    .append('svg')
    .attr('width', this.w)
    .attr('height', this.h);
}

RedditGraph.prototype.x_spacing = function (dataset) {
  return this.w / dataset.length;
}

RedditGraph.prototype.y_spacing = function (dataset) {
  return this.h / dataset.length;
}

RedditGraph.prototype.reply_count_as_circles = function () {
  var dataset = this.reply_count().map(function (e) { return e * 2 });
  var spacing = this.w / dataset.length;

  circles = this.svg.selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle');

  circles.attr('cx', function (d, i) {
    return i * spacing + spacing;
  })
    .attr('cy', this.h / 2)
    .attr('r', reflect_data)
    .attr('fill', STEEL_BLUE)
    .attr('stroke', FUZZY_GREY)
    .attr('stroke-width', function (d) {
      return d / 4;
    });
};

// Gets the number of replies of each comment on the first level
// as a function its sort of inefficient but w/e
RedditGraph.prototype.reply_count = function () {
  var reply_count = thread.comments.map(function (e) { if (e.replies) { return e.replies.length } else return 0 })
  return reply_count;
};

RedditGraph.prototype.reply_count_as_bar_chart = function () {
  var scale_number = function (coeff) {
    return function (number) {
      return reflect_data(number * coeff)
    }
  }
  var reply_count = this.reply_count()
  var spacing = this.x_spacing(reply_count)
  var bar_padding = 1;
  var scale = 18;
  this.svg.selectAll('rect')
    .data(this.reply_count())
    .enter()
    .append('rect')
    .attr('fill', function (d) { return rgb(70, 110 + (d * 10), 180) })
    .attr('x', function (d, i) { return i * spacing; })
    .attr('y', function (d) { return this.h - d * scale; }.bind(this))
    .attr('width', function (d, i) { return spacing - bar_padding; })
    .attr('height', scale_number(scale));

  this.svg.selectAll("text")
    .data(reply_count)
    .enter()
    .append("text")
    .text(reflect_data)
    .attr('x', function (d, i) { return (i * spacing) + (spacing / 2); })
    .attr('y', function (d) { return this.h - d * scale + 14; }.bind(this))
    .attr('fill', 'black')
    .attr('font-size', '11px')
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle');
};

RedditGraph.prototype.upvotes = function () {
  var ups = thread.comments.map(function (e) { if (e.upvotes) return e.upvotes; else return 0; })
  return ups;
};

RedditGraph.prototype.upvotes_vs_replies_scatterplot = function () {
  var reply_count = this.reply_count()
  var upvotes = this.upvotes()
  dataset = reply_count.map(function (e, i) {
    return [e, upvotes[i]];
  })
  var upvote_downscale = 9;
  var radius = 5;
  var padding = 50;
  var max_upvote = d3.max(upvotes, reflect_data);
  var max_replies = d3.max(reply_count, reflect_data);

  var y_scale = d3.scaleLinear()
    .domain([0, max_upvote])
    .range([this.h - padding, padding]);

  var x_scale = d3.scaleLinear()
    .domain([0, max_replies])
    .range([padding, this.w - padding]);

  var r_scale = d3.scaleLinear()
    .domain([0, max_upvote])
    .range([5, 30])

  var x_axis = d3.axisBottom(x_scale).ticks(6);
  var y_axis = d3.axisLeft(y_scale).ticks(10);

  circles = this.svg.selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle');

  var radius_fun = function (d) { return r_scale(d[1]); };

  circles.attr('cx', function (d) { return x_scale(d[0]); })
    .attr('cy', function (d) { return y_scale(d[1]); }.bind(this))
    .attr('r', radius_fun);

 /* this.svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function (d) { return "(" + d[0] + ", " + d[1] + ")"; })
    .attr('fill', 'red')
    .attr('font-size', '11px')
    .attr('font-family', 'sans-serif')
    .attr('x', function (d) { return x_scale(d[0]); })
    .attr('y', function (d, i) { return y_scale(d[1]); }.bind(this))*/

  this.svg.append('g')
  .attr('transform', 'translate(' + 0 + ',' + (this.h - padding) + ')')
  .attr('class', 'axis')
  .call(x_axis)
  this.svg.append('g').attr('class', 'axis')
  .attr('transform', 'translate(' + padding + ','  + 0 + ')')
  .attr('class', 'axis')
  .call(y_axis)
};