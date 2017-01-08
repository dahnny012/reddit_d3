
graph = new RedditGraph();

svg = graph.svg;

original = d3.select('svg')
.append('g')
x = 0
queue = [0, 0, 0]
reset_times = 0

reset = function(){
    reset_times++;
    a = queue.shift()
    queue.push(a)
    svg = d3.select('svg')
    svg.attr('width', +svg.attr('width') + 1000)
    if(reset_times % 3 == 0){
        queue = queue.map(function(){ return 0 });
    }
}

timer = d3.timer(function(){
    queue[0]++
    original
    .append('rect')
    .attr('x', function(){
        return x++
    })
    .attr('height', 100)
    .attr('width', 10)
    .attr('fill', rgb( queue[0], queue[1] , queue[2]))
    if(x % 100 == 0)
        reset()
}, 100)



