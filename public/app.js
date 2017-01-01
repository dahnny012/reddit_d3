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
  get_reddit_data()
  document.addEventListener('reddit_data', build_d3)
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
  var first_level_comments = thread.comments.map(function(comment){ return comment})
  var comments = first_level_comments.map(function(e){ return e.body })
  var reply_count = first_level_comments.map(function(e){ if(e.replies) { return e.replies.length } else return 0 })
  var number_to_pix = function(d){ return d + "px" }
  var adjusted_number_to_pix = function(coeff){
    return function(number){
      return number_to_pix(number * coeff)
    }
  }
  d3.select("body")
  .data(reply_count)
  .enter()
  .append("div")
  .attr("class", "bar")
  .style('height', adjusted_number_to_pix(5))
}