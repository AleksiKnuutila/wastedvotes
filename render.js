var BOXESPERSVG = 12;

var Color = net.brehaut.Color;
COLOURS = {
    "purple": "rgb(167,34,128)",
    "blue": "rgb(62,90,168)",
    "red": "rgb(171,25,23)",
    "yellow": "rgb(255,217,8)",
    "green": "rgb(68,182,95)"
}

GRAY_COLOUR = Color("rgb(220,220,214)");
WHITE_COLOUR = Color("rgb(240,240,240)");
PARTY_COLOURS = {
    "CON": [COLOURS["blue"], Color(COLOURS["blue"]).blend(WHITE_COLOUR, 0.72)],
    "DUP": [COLOURS["blue"], Color(COLOURS["blue"]).blend(WHITE_COLOUR, 0.72)],
    "GRN": [COLOURS["green"], Color(COLOURS["green"]).blend(WHITE_COLOUR, 0.85)],
    "LD": [COLOURS["yellow"], Color(COLOURS["yellow"]).blend(WHITE_COLOUR, 0.85)],
    "LAB": [COLOURS["red"], Color(COLOURS["red"]).blend(WHITE_COLOUR, 0.75)],
    "SNP": [COLOURS["yellow"], Color(COLOURS["yellow"]).blend(WHITE_COLOUR, 0.85)],
    "PC": [COLOURS["yellow"], Color(COLOURS["yellow"]).blend(WHITE_COLOUR, 0.85)],
    "UKIP": [COLOURS["purple"], Color(COLOURS["purple"]).blend(WHITE_COLOUR, 0.85)]
}

function getParty(party) {
    var PARTY_NAMES = {
        "CON": "Conservatives",
        "DUP": "DUP",
        "GRN": "Greens",
        "LD": "Liberal Democrats",
        "LAB": "Labour",
        "SNP": "SNP",
        "PC": "Plaid Cymru",
        "Others": "others",
        "IND": "independents",
        "UKIP": "UKIP"
    }
    if (PARTY_NAMES[party]) {
        return PARTY_NAMES[party]
    } else {
        return party
    }
}

window.dataIndex = 0;

function getNextData() {
    data = []
    targetIndex = window.dataIndex + 1
    for (i = window.dataIndex * BOXESPERSVG; i < targetIndex * BOXESPERSVG; i++) {
        data.push(pathJson['children'][i]);
    }
    hash = {};
    hash['children'] = data;
    return hash;
}

function DrawTreeMap() {

    function textHeight(d) {
        var ky = h / d.dy;
        y.domain([d.y, d.y + d.dy]);
        return (ky * d.dy) / pad;
    }

    var w = window.innerWidth,
        h = 1600,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        pad = 0,
        color = d3.scale.category10(),
        root,
        node;


    var svgwidth = $('.fullcontainer').width();
    var treemap = d3.layout.treemap()
        .sort(function(a, b) {
            return a.size - b.size;
        })
        .round(false)
        .size([768, h])
        .sticky(false)
        .mode("squarify")
        .ratio(1)
        .padding([pad, 10, 10, 10])
        .value(function(d) {
            return d.size;
        });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            if (d.win == 1) {
                return "" + d.size + " votes won " + getParty(d.name) + " an MP"
            } else {
                return "" + d.size + " votes for " + getParty(d.name) + " made no difference"
                return getParty(d.name) + " lost :("
            }
        })

    tip.direction(function(d) {
        if (d.x < 40) return 'e'
        if ((window.innerWidth - d.x - d.dx) < 30) return 'n';
        return 'n';
    })

    var svg = d3.select(".tributary_svg" + window.dataIndex.toString())
        .append("svg:svg")
        .attr('id', 'my-svg-div')
        .attr("width", "768px")
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(.5,.5)");

    svg.call(tip);

    node = root = getNextData();

    var nodes = treemap.nodes(root);
    var children = nodes.filter(function(d) {
        return !d.children;
    });
    var parents = nodes.filter(function(d) {
        return d.children;
    });

    var childCell = svg.selectAll("g")
        .data(children)
        .enter().append("svg:g")
        .attr("class", "childCell")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    var parentCell = svg.selectAll("g.parentCell")
        .data(parents)
        .enter().append("svg:g")
        .attr("class", "parentCell")
        .attr("childsize", function(d) {
            return d.dx + "," + d.dy + ")";
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    parentCell = parentCell.filter(function(d) {
        return d.depth > 0;
    });

    parentCell.append("foreignObject")
        .attr("width", function(d) {
            return d.dx - 70;
        })
        .attr("height", 400)
        .attr("x", 12)
        .attr("y", 5)
        .attr("pointer-events", "none")
        .append("xhtml:body")
        .html(function(d) {
            return "<h1 class=\"areaname\">" + d.name + "</h1>";
        });

    parentCell.append("foreignObject")
        .attr("width", 300)
        .attr("height", 400)
        .attr("x", function(d) {
            return d.dx - 205;
        })
        .attr("y", function(d) {
            return d.dy - 45;
        })
        .attr("pointer-events", "none")
        .append("xhtml:body")
        .html(function(d) {
            return "<h1 class=\"percentages\">" + d.shareign + " of votes ignored" + "</h1>";
        });

    childCell.append("svg:rect")
        .attr("width", function(d) {
            return d.dx - 1;
        })
        .attr("height", function(d) {
            return d.dy - 1;
        })
        .attr("rx", 7)
        .attr("ry", 7)
        .style("fill", function(d) {
            if (d.win == 0) {
                if (PARTY_COLOURS[d.name]) {
                    return Color(PARTY_COLOURS[d.name][1]).toCSS()
                } else {
                    return GRAY_COLOUR.toCSS()
                }
            } else {
                if (PARTY_COLOURS[d.name]) {
                    return PARTY_COLOURS[d.name][0]
                } else {
                    return GRAY_COLOUR.toCSS()
                }
            }
        })

}
DrawTreeMap();

// infinite scroll
$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 400 && window.dataIndex < ((655 / BOXESPERSVG) - 4)) {
        window.dataIndex = window.dataIndex + 1;
        $('.fullcontainer').append('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:xlink="http://www.w3.org/1999/xlink" class="tributary_svg' + window.dataIndex.toString() + '" preserveAspectRatio="xMinYMin meet" viewBox="0 0 768 1600" width="100%" height="100%"></svg>');
        DrawTreeMap();
    }
});
