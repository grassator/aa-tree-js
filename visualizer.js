d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function TreeVisualizer(svgContainerSelector) {
    this.canvas = d3.select('svg');
    this.root = this.canvas.append('g')
        .attr('class', 'root');
    this.nodes = [];
}

TreeVisualizer.prototype.update = function(rootNode) {
    var treeLayout = d3.layout.tree()
        .nodeSize([20, 30])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 5 : 10) / a.depth;
        })
        .children(function(d) {
            var result = [];
            if(d.left !== TreeNode.nil) result.push(d.left);
            if(d.right !== TreeNode.nil) result.push(d.right);
            return result;
        });

    this.root
        .attr('transform', 'translate(' + (window.outerWidth / 2) + ', 80)');

    // Stash the old positions for transition.
    this.nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    this.nodes = treeLayout.nodes(rootNode);
    var links = treeLayout.links(this.nodes);
    var diagonal = d3.svg.diagonal();

    var pathSelection = this.root.selectAll("path.link")
        .data(links, function(d) {
            if(d.source.depth > d.target.depth) {
                return d.source.key + ',' + d.target.key;
            } else {
                return d.target.key + ',' + d.source.key;
            }
        });

    pathSelection.enter()
        .append("path")
        .attr("class", "link")
        .attr("d", diagonal);

    pathSelection.exit()
        .attr('opacity', 1)
        .attr('class', 'link deleting')
        .transition()
            .duration(1000)
            .attr('transform', 'translate(50, -50)')
            .attr('opacity', 0)
            .remove();

    pathSelection
        .attr("d", function(d) {
            var source = {
                x: d.source.x0 === undefined ? d.source.x : d.source.x0,
                y: d.source.y0 === undefined ? d.source.y : d.source.y0,
            };
            var target = {
                x: d.target.x0 === undefined ? d.target.x : d.target.x0,
                y: d.target.y0 === undefined ? d.target.y : d.target.y0,
            };
            return diagonal({ source: source, target: target });
        })
        .transition()
            .duration(1000)
            .attr("d", diagonal);

    nodeSelection = this.root.selectAll('.node')
        .data(this.nodes, function(d) {
            return d.key;
        });

    nodeSelection
        .moveToFront()
        .transition()
            .duration(1000)
            .attr('transform', function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

    var nodeEnter = nodeSelection.enter().append('g');
    nodeSelection.exit()
        .attr('opacity', 1)
        .transition()
            .duration(1000)
            .attr('transform', 'translate(50, -50)')
            .attr('opacity', 0)
            .remove();

    nodeEnter
        .attr('transform', function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr('opacity', function(d) { return d.key === undefined ? 0.5 : 1})
        .attr('class', 'node');

    nodeEnter.append('foreignObject')
        .attr('x', -10)
        .attr('y', -10)
        .attr('width', 20)
        .attr('height', 20)
        .append('xhtml:div')
        .attr('class', 'node-html')
        .attr('title', function(d) {
            return d.value === undefined ? '' : d.value;
        })
        .text(function(d) {
            return d.key === undefined ? 'nil' : d.key;
        });

    // nodeEnter
    //     .append('circle')
    //         .attr('r', 5)
    //         .attr('cy', 5)
    //         .attr('class', 'node-dot')

    // nodeEnter.append('text')
    //     .attr("dx", 5)
    //     .attr("dy", 3)
    //     .style("text-anchor", "start")
    //     .text(function(d) {
    //         return d.key === undefined ? 'nil' : d.key;
    //     });
}
