var COMMENT_REGEX = 't'
var MORE_REGEX = 'more'

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

function RedditGraph(){
  this.create_svg()
  this.reply_count_as_circles()
}

RedditGraph.prototype.create_svg = function(){
  this.h = 50;
  this.w  = 1000;
  this.svg = d3.select('body')
              .append('svg')
              .attr('width', this.w)
              .attr('height', this.h);
}

RedditGraph.prototype.reply_count_as_circles = function(){
  var dataset = this.reply_count().map(function(e){ return e * 2});
  var plot_points = []
  var spacing = this.w / dataset.length
  for(var i =0+spacing; i< this.w; i+=spacing){
    plot_points.push(i)
  }
  circles = this.svg.selectAll('circle')
                .data(dataset)
                .enter()
                .append('circle')
  
  circles.attr('cx', function(d, i){
    return plot_points[i];
  })
  .attr('cy', this.h/2)
  .attr('r', reflect_data);
}

// Gets the number of replies of each comment on the first level
// as a function its sort of inefficient but w/e
RedditGraph.prototype.reply_count = function(){
  var first_level_comments = thread.comments;
  var comments = first_level_comments.map(function(e){ return e.body })
  var reply_count = first_level_comments.map(function(e){ if(e.replies) { return e.replies.length } else return 0 })
  return reply_count;
}

// functions learned from tutorial
// saving them for the heck of it
RedditGraph.prototype.reply_count_as_text = function(){
  var number_to_pix = function(d){ return d + "px" }
  var adjusted_number_to_pix = function(coeff){
    return function(number){
      return number_to_pix(number * coeff)
    }
  }
  d3.select.append('p').text("reply count for first_level_comments")
  d3.select("body")
  .data(this.reply_count())
  .enter()
  .append("div")
  .attr("class", "bar")
  .style('height', adjusted_number_to_pix(5))
}