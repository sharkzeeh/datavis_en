const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Create simulation with forceCenter(), forceX() and forceCollide()
const simulation = d3.forceSimulation()

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data)
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    // Part 1 - add domain to color, radius and x scales 
    radius.domain([d3.min(rating), d3.max(rating)])
    x.domain([d3.min(years), d3.max(years)])
    color.domain(ratings)
    
    // Part 1 - create circles
    var ns = bubble
        .selectAll("circle")
        .data(data)
            .enter()
            .append('circle')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .on('mouseover', overBubble)
            .on('mouseout', outOfBubble);
    
    // Part 1 - add data to simulation and add tick event listener 
    simulation
        .nodes(data)
        .force('x', d3.forceX().x(d => x(+d['release year'])))
        .force("collide", d3.forceCollide().radius(function(d) { return radius(+d['user rating score'])}))
        .force("center", d3.forceCenter().x(b_width / 2).y(b_height / 2))
        .on("tick", ticked)

    function ticked() {
        ns
            .attr('r', d => radius(+d['user rating score']))
            .attr('fill', d => color(d.rating))
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('id', d => d.rating)
            .exit().remove();
    }

    // Part 1 - create layout with d3.pie() based on rating
    var pie = d3.pie()
            .value(function(d) {return +d.value});
    
    // Part 1 - create an d3.arc() generator
    var arc = d3.arc()
            .innerRadius(d_width / 4)
            .outerRadius(d_height / 4)

    // Part 1 - draw a donut chart inside donut
    donut.selectAll('path')
        .data(pie(ratings))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.key))
        .attr("stroke", "white") 
        .style('stroke-width', 4)
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);
        
    function overBubble(d){
        console.log(d)
        // Part 2 - add stroke and stroke-width  \
        d3.select(this)
            .attr('stroke', 'blue')
            .attr('stroke-width', 7);
        
        tooltip.html("<b>" + d.title + "</b>" + "</br>" + d['release year'])        

        // Part 3 - change visibility and position of tooltip
        tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .style('display', 'block')
    }

    function outOfBubble(){
        // Part 2 - remove stroke and stroke-width
        d3.select(this)
            .attr('stroke', null)
            .attr('stroke-width', 0)

        // Part 3 - change visibility and position of tooltip
        tooltip
            .style('display', 'none')
    }

    var op = 0.75

    function overArc(d){
        console.log(d)
        // Part 2 - change donut_lable content
        donut_lable.text(d.data.key)
        // Part 2 - change opacity of an arc
        d3.select(this)
            .attr('opacity', op);

        // Part 3 - change opacity, stroke и stroke-width of circles based on rating
        bubble.selectAll("#" + d.data.key)
            .attr('opacity', op)
            .attr('stroke', null)
            .attr('stroke-width', 0)
    }

    function outOfArc(d){
        // Part 2 - change donut_lable content
        donut_lable.text("")
        // Part 2 - change opacity of an arc
        d3.select(this)
            .attr('opacity', 1);

        // Part 3 - revert opacity, stroke and stroke-width of circles
        bubble.selectAll("#" + d.data.key)
            .attr('opacity', 1)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
    }
});
