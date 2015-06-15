'use strict';

var d3demo = d3demo || {};

d3demo.forcemap = (function visualisation(d3, Rx) {
  // init
  var width = d3demo.layout.width
    , height = d3demo.layout.height;

  var force = null
    , nodes = null
    , dataNodes
    , foci = null;

  var svg = d3.select('.map').append('svg')
    .attr('width', width)
    .attr('height', height);

  document.addEventListener('mapresize', function(e) {
    svg.attr('width', e.detail.width)
       .attr('height', e.detail.height);
  })

  // Returns a random integer between min included) and max (excluded)
  var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  };

  var getColor = function(temp, grayScale) {
    var hue = 1000 * 270/(temp + 1000);
    if (!hue) {
      debugger;
    }
    var color = grayScale
      ? 'hsl(' + [Math.floor(hue), '70%', '20%'] + ')'
      : 'hsl(' + [Math.floor(hue), '70%', '50%'] + ')'
    // console.log(color);
    return color;
  };

  // A function to initialize our visualization.
  var init = function() {
    // clear out the contents of the SVG container
    // makes it possible to restart the layout without refreshing the page
    svg.selectAll('*').remove();

    foci = d3demo.layout.getLocations();

    // define the data
    dataNodes = [];
    dataNodes = d3.range(300).map(function(index) {
      var x = getRandomInt(foci[0].x - 10, foci[0].x + 10)
        , y = getRandomInt(height+50, height + 300);
      // x = 200, y= 200;
      return {
        id: index,
        x: x,
        y: y,
        x_i: x,
        y_i: y,
        focus: -1,
        present: false
      };
    });

    //create a force layout object and define its properties
    force = d3.layout.force()
        .size([width, height])
        .nodes(dataNodes)
        .links([])
        .gravity(0)
        .friction(0.83)
        .charge(function(d) {
          return d.focus === -1
            ? 0
            : d.selected
              ? d.present ? -120 : -60
              : d.present ? -10 : -2;
        });

    nodes = svg.selectAll('circle.user')
        .data(dataNodes, function(datum, index) {
          return datum.id;
        })
        .enter().append("circle")
          .attr('class', 'user')
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr('r', function(d) { return d.present ? 5 : 2});

    force.on('tick', stepForce);
  };

  var stepSize = 0.2 //d3demo.config.playback.rate > 100 ? 0.1 : 0.2;
  var stepForce = function(event) {
    var selectedNodesLength = getSelectedNodes()[0].length;
    var k = stepSize * event.alpha;
    // Push nodes toward their designated focus.
    var now = new Date().getTime();
    dataNodes.forEach(function(d, i) {
      if (d.exiting) {
        if (now - d.checkOutTimeInternal > 1000) {
          d.exiting = false;
          d.present = false;
          d.focus = -1;
        }
      }
      var x = d.focus === -1 ? d.x_i : foci[d.focus].x
        , y = d.focus === -1 ? d.y_i : foci[d.focus].y
      d.y += (y - d.y) * k;
      d.x += (x - d.x) * k;
      d.unselected = ! (selectedNodesLength === 0 || d.selected );
    });

    nodes.attr("cx", function(d) { return d.x; })
         .attr("cy", function(d) { return d.y; })
         .attr('r', function(d) {
           return d.selected
             ? d.present ? 20 : 14
             : d.present ? 5 : 2;
          })
         .style('fill', function(d) {
           var grayScale = d.unselected;
           if (d.present) {
             return getColor(now - d.checkInTimeInternal, grayScale);
           } else if (d.checkOutTimeInternal && d.checkInTimeInternal) {
             return getColor(d.checkOutTimeInternal - d.checkInTimeInternal, grayScale);
           } else {
             return getColor(0, grayScale);
           }
         })
         .classed('node', function(d) {
           return d.focus !== -1;
         })
         .classed('unselected', function(d) {
           return d.unselected;
         });

  };

  var start = function() {
    force.start();
  }

  var getNodeById = function(id) {
   return nodes.filter(function(d) {
     return d.id == id;
   });
  };

  var getDataNodeById = function(id) {
   return dataNodes[id];
  };

  var getNodesByName = function(str) {
    return nodes.filter(function(d) {
      if (!d.user) {
        return false;
      }
      var strlc = str.toString().toLowerCase();
      var match = d.user.name.toLowerCase().indexOf(strlc) > -1
        || d.user.id && d.user.id.toString().toLowerCase().indexOf(strlc) > -1
        || d.beaconId && d.beaconId.toString().toLowerCase().indexOf(strlc) > -1;
      return !! match;
    });
  };

  var getSelectedNodes = function() {
    return svg.selectAll('.selected');
  };

  var getNodeCount = function() {
    return dataNodes.filter(function(d) {
      return d.focus !== -1;
    }).length;
  };

  function particle(dataNode) {
    if (! dataNode.unselected) {
      var particle = svg.insert('circle')
          .attr('class', 'particle')
          .attr('cx', dataNode.x)
          .attr('cy', dataNode.y)
          .attr('r', 5)
          .style('stroke-opacity', 1)
        .transition()
          .duration(1000)
          .ease('quad-out')
          .attr('r', 50)
          .style('stroke-opacity', .1)
        .remove();
    };
  };

  return {
    init: init
  , start: start
  , getNodeById: getNodeById
  , getDataNodeById: getDataNodeById
  , getNodesByName: getNodesByName
  , getSelectedNodes: getSelectedNodes
  , getNodeCount: getNodeCount
  , particle: particle
  , getColor: getColor
  };
})(d3, Rx);
