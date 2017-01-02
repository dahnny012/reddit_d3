var COMMENT_REGEX = 't'
var MORE_REGEX = 'more'
var STEEL_BLUE = '#4682b4'
var FUZZY_GREY = '#eef3f8'

// a convenience wrapper
function Thread(data){
  this.comments = data[1].data.children.map(function(e){
    return new Comment(e)
  })
}

// Edge case ill deal with later
function More(){
  // get request and stream
}

function Comment(raw){
  this.comment = raw.data
  this.body = this.comment.body
  if(this.comment.replies !== "" && this.comment.replies !== undefined){
    this.replies = this.comment.replies.data.children.map(function(e){
      return new build_strategy(e.kind)
    })
  }else{
    this.replies = null
  }

  function build_strategy(type){
    if(type.includes(COMMENT_REGEX))
      return Comment
    if(type.includes(MORE_REGEX))
      return More
  }
}

var thread;
var reddit_loaded = new CustomEvent('reddit_data');
$(document).ready(bootstrap)

function bootstrap(){
  document.addEventListener('reddit_data', build_d3)
  get_reddit_data()
}

function get_reddit_data() {
  $.get('reddit.json').
  then(function(data, status){
    thread = new Thread(data);
    document.dispatchEvent(reddit_loaded);
  })
}

function build_d3(){
  console.log("building d3")
  graph = new RedditGraph()
}

function reflect_data(d){
  return d
}

function rgb (r,g,b){
  return "rgb(" + [r,g,b].join(",") + ")";
}

function RedditGraph(){
  this.create_svg()
  this.reply_count_as_bar_chart()
}

RedditGraph.prototype.create_svg = function(){
  this.h = 150;
  this.w  = 800;
  this.svg = d3.select('body')
              .append('svg')
              .attr('width', this.w)
              .attr('height', this.h);
}

RedditGraph.prototype.x_spacing = function(dataset){
  return  this.w / dataset.length;
}

RedditGraph.prototype.y_spacing = function(dataset){
  return this.h / dataset.length;
}

RedditGraph.prototype.reply_count_as_circles = function(){
  var dataset = this.reply_count().map(function(e){ return e * 2});
  var spacing = this.w / dataset.length

  circles = this.svg.selectAll('circle')
                .data(dataset)
                .enter()
                .append('circle')
  
  circles.attr('cx', function(d, i){
    return i * spacing + spacing;
  })
  .attr('cy', this.h/2)
  .attr('r', reflect_data)
  .attr('fill', STEEL_BLUE)
  .attr('stroke', FUZZY_GREY)
  .attr('stroke-width', function(d){
    return d/4
  })
}

// Gets the number of replies of each comment on the first level
// as a function its sort of inefficient but w/e
RedditGraph.prototype.reply_count = function(){
  var first_level_comments = thread.comments;
  var reply_count = first_level_comments.map(function(e){ if(e.replies) { return e.replies.length } else return 0 })
  return reply_count;
}

RedditGraph.prototype.comments = function(){
  var comments = thread.comments.map(function(e){ return e.body })
  return comments
}

RedditGraph.prototype.reply_count_as_bar_chart = function(){
  var scale_number = function(coeff){
    return function(number){
      return reflect_data(number * coeff)
    }
  }
  var reply_count = this.reply_count() 
  //var comments = this.comments()
  var spacing = this.x_spacing(reply_count)
  var bar_padding = 1
  var scale = 18
  this.svg.selectAll('rect')
     .data(this.reply_count())
     .enter()
     .append('rect')
     .attr('fill', function(d){ return rgb(70, 110 + (d * 10), 180) })
     .attr('x', function(d, i){ return i * spacing;})
     .attr('y', function(d){ return this.h  - d * scale;  }.bind(this))
     .attr('width', function(d, i){ return spacing - bar_padding; })
     .attr('height', scale_number(scale));

  this.svg.selectAll("text")
      .data(reply_count)
      .enter()
      .append("text")
      .text(reflect_data)
      .attr('x', function(d, i){ return (i * spacing) + (spacing /  2);})
      .attr('y', function(d){ return this.h  - d * scale + 14;  }.bind(this))
      .attr('fill', 'black')
      .attr('font-size', '11px')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle')

/*
  d3.select("body")
  .data(this.reply_count())
  .enter()
  .append("div")
  .attr("class", "bar")
  .style('height', adjusted_number_to_pix(5))*/
}