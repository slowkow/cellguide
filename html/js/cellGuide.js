"use strict";

var g_bins = null

var pals = {
  "alphabet": [
    "#F0A0FF", "#0075DC", "#993F00", "#4C005C", "#191919",
    "#005C31", "#2BCE48", "#FFCC99", "#808080", "#94FFB5", "#8F7C00",
    "#9DCC00", "#C20088", "#003380", "#FFA405", "#FFA8BB", "#426600",
    "#FF0010", "#5EF1F2", "#00998F", "#E0FF66", "#740AFF", "#990000",
    "#FFFF80", "#FFE100", "#FF5005"
  ],
  "okabe": [
    "#666666", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2",
    "#D55E00", "#CC79A7"
  ]
}

// Store one gene in a list of objects.
var mydata = [];

var g_count = 0;
var g_loadGeneAndColor = 0;

var db = null;
var g_coords = null;
var g_exprArr, g_decArr, g_geneSym, g_geneDesc, g_binInfo;

var mybrowser = function() {
  // var db = null; // the cbData object from cbData.js. Loads coords,

  var gRecentGenes = [];
  // var coords = null;

  var vlSpec = vega_geneHeatmap;

  var recent_genes = []

  var state = {
    gene: "HMGB2",
    meta: "cluster"
  }

  // +-- container ------------------------------+
  // | +-- mydiv ------------------------------+ |
  // | | +-- mydiv-meta --+ +-- mydiv-gene --+ | |
  // | | |                | |                | | |
  // | | +----------------+ +----------------+ | |
  // | +---------------------------------------+ |
  // | +-- mytable ----------------------------+ |
  // | |                                       | |
  // | +---------------------------------------+ |
  // +-------------------------------------------+

  $("body").html(
    `
    <div class="container" id="mycontainer">
      <h1 id="mytitle">Gene Observer</h1>
      <hr>

      <div id="mydiv" style="height:370px;display:block;">
        <div class="row">
          <div id="mydiv-meta" class="col-6"></div>
          <div id="mydiv-gene" class="col-6"></div>
        </div>
      </div>

      <div id="mycontrols"></div>

      <div class="row">
          <div id="mybars" class="col-6" style="height:500px;"></div>
          <div id="mytable" class="col-6"></div>
      </div>

      <div class="row">
      </div>

      <div class="row">
        <div id="myfooter" class="col">
          <hr>
          <p>Please email <a href="https://slowkow.com">Kamil Slowikowski</a> with questions, bug reports, and feature requests.</p>
        </div>
      </div>

    </div
    `
  )

  var renderer = function() {

    // Use vega to draw a heatmap
    function drawGene(geneSym) {
      console.log("vega drawGene()");
      console.log(vlSpec);
      vegaEmbed("#mydiv", vlSpec);
    }

    function drawMetaHex(fieldName) {
      console.log("d3 canvas drawMetaHex()");

      //var fieldName = 'cluster';
      var metaInfo = db.findMetaInfo(fieldName);

      if (metaInfo.type == "enum") {
        var this_pal = metaInfo.valCounts.length <= pals.okabe.length ?
          pals.okabe : pals.alphabet
        var metaColors = {}
        // {'healthy': {r: 240, g: 160, b: 255, opacity: 1}, ...}
        for (var i = 0; i < metaInfo.valCounts.length; i++) {
          var x = metaInfo.valCounts[i][0]
          var color_i = i
          if (color_i > this_pal.length - 1) {
            color_i = color_i % this_pal.length
          }
          metaColors[x] = d3.color(this_pal[color_i])
        }
      }

      // _dump(metaColors)

      function doDrawMetaHex() {
        var radius = 2
        var legend_width = 210
        var plot_width = 360
        var plot_height = 360
        var legend_margin = {
          top: 45, right: 0, bottom: 0, left: 10
        }
        var margin = {
          top: 45, right: 10, bottom: 10, left: 10
        }

        d3.select("#mydiv-meta-plot").remove()
        const container = d3.select("#mydiv-meta").append("div")
          .attr("id", "mydiv-meta-plot")
          .style("position", "relative")
          .style("display", "inline-block")
        const canvas = container.append('canvas').node()
        const context = canvas.getContext('2d')

        canvas.width = plot_width + legend_width;
        canvas.height = plot_height;

        const svg = container.append('svg')
          .attr("width", canvas.width)
          .attr("height", canvas.height)
          .style("position", "absolute")
          .style("top", '0px')
          .style("left", '0px');

        let meta_title = metaInfo.valCounts ?
          `${metaInfo.label} (n = ${metaInfo.valCounts.length})` :
          `${metaInfo.label}`

        svg.append("text")
          .attr("x", margin.left)
          .attr("y", margin.top - 20)
          .attr("font-family", "sans-serif")
          .attr("font-size", "32px")
          .text(meta_title)

        svg.append("text")
          .attr("x", margin.left / 2)
          .attr("y", plot_height - margin.bottom)
          .attr("font-family", "sans-serif")
          .attr("font-size", "1em")
          .text(d3.format(",")(db.conf.sampleCount) + " cells")

        let panelBorder = svg.append("rect")
          .attr("x", margin.left - 10)
          .attr("y", margin.top - 10)
          .attr("width", plot_width)
          .attr("height", plot_height - margin.top + margin.bottom)
          .style("stroke", "black")
          .style("fill", "none")
          .style("stroke-width", "1px");

        var x = d3.scaleLinear()
          .domain(d3.extent(mydata, d => d.x))
          .range([margin.left, plot_width - margin.right])

        var y = d3.scaleLinear()
          .domain(d3.extent(mydata, d => d.y))
          .rangeRound([plot_height - margin.bottom, margin.top])

        var hexbin = d3.hexbin()
          .x(d => x(d.x))
          .y(d => y(d.y))
          .radius(radius * (plot_width - legend_width) / plot_height + 0.2)
          .extent([[margin.left, margin.top], [plot_width - margin.right, plot_height - margin.bottom]])

        var bins = hexbin(mydata)

        // var color = d3.scaleSequential(d3.interpolateBuPu)
        //   .domain([0, d3.max(bins, bin => bin.length) / 2])
        
        context.fillStyle = "#fff";

        // context.strokeStyle = "black";
        // context.strokeRect(
        //   margin.left - 10,
        //   margin.top - 10,
        //   plot_width,
        //   plot_height - margin.top + margin.bottom
        // )

        var hex = new Path2D(hexbin.hexagon());

        if (metaInfo.type == "enum") {

          function colorEnum(bin) {
            // Input: [{health: "healthy"}, {health: "not healthy"}, ...]
            // Ouput: [["healthy", 0.25], ["not healthy", 0.75]]
            var a = Array.from(d3.rollup(bin, v => v.length / bin.length, d => d[fieldName]))
            var r = 0, g = 0, b = 0
            for (var i = 0; i < a.length; i++) {
              r += a[i][1] * metaColors[a[i][0]].r
              g += a[i][1] * metaColors[a[i][0]].g
              b += a[i][1] * metaColors[a[i][0]].b
            }
            return(d3.rgb(r, g, b).toString())
          }

          bins.forEach(function(bin) {
            context.translate(bin.x, bin.y)
            context.fillStyle = colorEnum(bin)
            context.fill(hex)
            context.setTransform(1, 0, 0, 1, 0, 0)
          });

          var ordinal = d3.scaleOrdinal()
            .domain(Object.keys(metaColors))
            .range(Object.values(metaColors))

          svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform",
              "translate(" + (5 + plot_width + legend_margin.left) + "," + legend_margin.top + ")"
            );

          var legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolCircle).size(200)())
            // .labelWrap(legend_width - 30)
            // .shapePadding(10)
            .scale(ordinal);

          svg.select(".legendOrdinal")
            .call(legendOrdinal);

        } else if (metaInfo.type == "int" || metaInfo.type == "float") {

          const color_domain = [
            0, d3.max(bins, bin => d3.mean(bin, d => d[fieldName]))
          ]

          // var color = d3.scaleSequential(d3.interpolateBuPu)
          //   .domain(color_domain)

          // var color = d3.scaleQuantize()
          //   .domain(color_domain)
          //   .range([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(d => d3.interpolateBuPu(d)))

          // let color_range = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
          let color_range = linspace(0, 1, 11)
          var color = d3.scaleQuantile()
            .domain(bins.map(bin => d3.mean(bin, d => d[fieldName])))
            .range(color_range.map(d => d3.interpolateBuPu(d)))

          bins.forEach(function(bin) {
            context.translate(bin.x, bin.y)
            context.fillStyle = color(d3.mean(bin, d => d[fieldName]))
            context.fill(hex)
            context.setTransform(1, 0, 0, 1, 0, 0)
          });

          svg.append("text")
            .attr("x", plot_width + legend_margin.left)
            .attr("y", legend_margin.top)
            .attr("font-family", "sans-serif")
            .attr("font-size", "1em")
            .attr("font-weight", "bold")
            .text(metaInfo.label)

          svg.append("text")
            .attr("x", plot_width + legend_margin.left)
            .attr("y", legend_margin.top)
            .attr("font-family", "sans-serif")
            .attr("font-size", "1em")
            .attr("font-weight", "bold")
            .text(metaInfo.label)

          var legend = svg.selectAll("g.legend_colorbar")
            .data(color.range().reverse())
            .enter()
            .append("g")
            .attr("class","legend_colorbar");

          let legend_rect_height = 25

          legend
            .append('rect')
            .attr("x", plot_width + legend_margin.left)
            .attr("y", function(d, i) {
               return 20 + legend_margin.top + i * legend_rect_height;
            })
           .attr("width", 15)
           .attr("height", legend_rect_height)
           // .style("stroke", "black")
           // .style("stroke-width", 0.1)
           .style("fill", function(d){return d;});

          legend
            .append('text')
            .attr("x", plot_width + legend_margin.left + 20) //leave 5 pixel space after the <rect>
            .attr("y", function(d, i) {
             return 20 + legend_margin.top + i * legend_rect_height;
            })
            .attr("alignment-baseline", "middle")
            // .attr("dy", "0.8em") //place text one line *below* the x,y point
            .style("font-size","1em")
            .text(function(d, i) {
              // if (i % 2 == 0) {
              var extent = color.invertExtent(d);
              //extent will be a two-element array, format it however you want:
              var format = d3.format(".2s");
              // if (i == color_range.length - 1) {
              //   return `${format(+extent[0])} - ${format(+extent[1])}`
              // }
              return `${format(+extent[1])}`
              // }
            });
            
          // TODO Create just one text at the end instead of N texts
          legend
            .append("text")
            .attr("x", plot_width + legend_margin.left + 20)
            .attr("y", 20 + legend_margin.top + color_range.length * legend_rect_height)
            .attr("alignment-baseline", "middle")
            // .attr("dy", "0.8em") //place text one line *below* the x,y point
            .style("font-size","0.9em")
            .text(function(d, i) {
              var extent = color.invertExtent(d);
              //extent will be a two-element array, format it however you want:
              var format = d3.format(".0f");
              if (i == color_range.length - 1) {
                return `${format(+extent[0])}`
              }
            });

        }

        // cluster labels

        let clusterLabels = d3.nest()
          .key(d => d.cluster)
          .rollup(v => [d3.mean(v, d => d.x), d3.mean(v, d => d.y)])
          .entries(mydata)

        let cluster_label_size = "0.75em"

        svg.selectAll("g.cluster_label")
          .data(clusterLabels)
          .enter()
          .append("g")
          .append("text")
          .attr("class","cluster_label")
          .attr("x", d => x(d.value[0]))
          .attr("y", d => y(d.value[1]))
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", cluster_label_size)
          .attr("font-weight", "bold")
          .style("fill", "black")
          .style("stroke", "white")
          .style("stroke-width", "2px")
          .style("stroke-align", "outset")
          .style("display", $("#show-cluster-labels").is(":checked") ? "block" : "none")
          .text(d => d.key)

        svg.selectAll("g.cluster_label")
          .data(clusterLabels)
          .enter()
          .append("g")
          .append("text")
          .attr("class","cluster_label")
          .attr("x", d => x(d.value[0]))
          .attr("y", d => y(d.value[1]))
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", cluster_label_size)
          .attr("font-weight", "bold")
          .style("fill", "black")
          .style("display", $("#show-cluster-labels").is(":checked") ? "block" : "none")
          .text(d => d.key)

        drawBars(metaInfo)

      } // doDrawMetaHex

      function gotMetaArr(metaArr, metaInfo) {
        var fieldName = metaInfo.name;
        if (metaInfo.valCounts) {
          for (var i = 0; i < metaArr.length; i++) {
            mydata[i][fieldName] = metaInfo.valCounts[metaArr[i]][0]
          }
        } else if (metaInfo.origVals){
          for (var i = 0; i < metaInfo.origVals.length; i++) {
            mydata[i][fieldName] = metaInfo.origVals[i]
          }
        }
        doDrawMetaHex()
      }

      if (metaInfo.origVals) {
        console.log("LOG metaInfo.origVals")
        // for numeric fields, the raw data is already in memory
        gotMetaArr(metaInfo.origVals, metaInfo)
      } else {
        console.log("LOG not metaInfo.origVals")
        // other fields may not be loaded yet
        db.loadMetaVec(metaInfo, gotMetaArr, onProgressConsole);
      }

      // db.loadMetaVec(metaInfo, gotMetaArr, onProgressConsole);
    } // drawMetaHex()

    function drawBars(metaInfo) {

        if (metaInfo.type != "enum" || metaInfo.valCounts.length > pals.okabe.length) {
          return
        }

        let groupKey = "cluster"
        let groups = Array.from(
          d3.rollup(mydata, v => v.length, d => d["cluster"])
        )

        // let subgroupKey = "health"
        // let subgroupLevels = ["Non-inflamed","Inflamed","Healthy"]
        let subgroupKey = metaInfo.name
        let subgroupLevels = metaInfo.valCounts.map(d => d[0])

        var data = []
        for (var i = 0; i < groups.length; i++) {
          var res = {
            "cluster": groups[i][0]
          }
          var counts = Array.from(d3.rollup(
            mydata.filter(d => d.cluster == groups[i][0]),
            v => v.length, d => d[subgroupKey]
          ))
          for (var j = 0; j < counts.length; j++) {
            res[counts[j][0]] = counts[j][1]
          }
          data.push(res)
        }

        let height = 500
        let width = 500
        let margin = {top: 0, right: 120, bottom: 20, left: 180}

        let y0 = d3.scaleBand()
          .domain(data.map(d => d[groupKey]))
          .rangeRound([margin.top, height - margin.bottom])
          .paddingInner(0.1)

        let y1 = d3.scaleBand()
          .domain(subgroupLevels)
          // .rangeRound([y0.bandwidth(), 0])
          .rangeRound([0, y0.bandwidth()])
          .padding(0.05)

        let x = d3.scaleLinear()
          .domain([0, d3.max(data, d => d3.max(subgroupLevels, key => d[key]))]).nice()
          .rangeRound([margin.left, width - margin.right])

        let color_range = subgroupLevels.length <= 8 ? pals.okabe : pals.alphabet
        let color = d3.scaleOrdinal()
          .range(color_range)
          // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])

        let xAxis = g => g
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5, "s"))
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
          .call(
            g => g.select(".tick:last-of-type text").clone()
              .attr("x", 15)
              .attr("text-anchor", "start")
              // .attr("font-weight", "bold")
              .attr("font-size", "14px")
              .text("cells")
          )

        let yAxis = g => g
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y0).ticks(null, "s"))
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll(".tick text").attr("font-size", "14px"))

        const legend = svg => {
          const g = svg
              .attr("transform", `translate(${width},0)`)
              .attr("text-anchor", "end")
              .attr("font-family", "sans-serif")
              .attr("font-size", 14)
            .selectAll("g")
            // .data(color.domain().slice().reverse())
            .data(color.domain().slice())
            .join("g")
              .attr("transform", (d, i) => `translate(0,${i * 20})`);
          g.append("rect")
              .attr("x", -19)
              .attr("width", 19)
              .attr("height", 19)
              .attr("fill", color);
          g.append("text")
              .attr("x", -24)
              .attr("y", 9.5)
              .attr("dy", "0.35em")
              .text(d => d);
        }

        $("#mybars").html("")
        const svg = d3.select("#mybars").append('svg')
          .attr("width", width)
          .attr("height", height)
          .style("position", "absolute")
          .style("top", '0px')
          .style("left", '0px');

        let panelBorder = svg.append("rect")
          .attr("x", margin.left)
          .attr("y", margin.top)
          .attr("height", height - margin.top - margin.bottom)
          .attr("width", width - margin.left - margin.right)
          .style("stroke", "black")
          .style("fill", "none")
          .style("stroke-width", "1px");

        svg.append("g")
          .selectAll("g")
          .data(data)
          .join("g")
            .attr("transform", d => `translate(0,${y0(d[groupKey])})`)
          .selectAll("rect")
          .data(d => subgroupLevels.map(key => ({key, value: d[key]})))
          .join("rect")
            .attr("x", d => x(0))
            .attr("y", d => y1(d.key))
            .attr("height", y1.bandwidth())
            .attr("width", d => x(d.value) - x(0))
            .attr("fill", d => color(d.key));

        svg.append("g")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        svg.append("g")
            .call(legend);

        //------------------------------------------------------------------------ 
        // Vertical grouped bars
        //------------------------------------------------------------------------ 

        // let y = d3.scaleLinear()
        //   .domain([0, d3.max(data, d => d3.max(subgroupLevels, key => d[key]))]).nice()
        //   .rangeRound([height - margin.bottom, margin.top])

        // let x0 = d3.scaleBand()
        //   .domain(data.map(d => d[groupKey]))
        //   .rangeRound([margin.left, width - margin.right])
        //   .paddingInner(0.1)

        // let x1 = d3.scaleBand()
        //   .domain(subgroupLevels)
        //   .rangeRound([0, x0.bandwidth()])
        //   .padding(0.05)

        // let yAxis = g => g
        //   .attr("transform", `translate(${margin.left},0)`)
        //   .call(d3.axisLeft(y).ticks(null, "s"))
        //   .call(g => g.select(".domain").remove())
        //   .call(g => g.select(".tick:last-of-type text").clone()
        //       .attr("x", 3)
        //       .attr("text-anchor", "start")
        //       .attr("font-weight", "bold")
        //       .text(data[0]))

        // let xAxis = g => g
        //   .attr("transform", `translate(0,${height - margin.bottom})`)
        //   .call(d3.axisBottom(x0).tickSizeOuter(0))
        //   .call(g => g.select(".domain").remove())

        // let color = d3.scaleOrdinal()
        //   .range(["#98abc5", "#8a89a6", "#7b6888"])//, "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])

        // $("#mybars").html("")
        // const svg = d3.select("#mybars").append('svg')
        //   .attr("width", width)
        //   .attr("height", height)
        //   .style("position", "absolute")
        //   .style("top", '0px')
        //   .style("left", '0px');

        // svg.append("g")
        //   .selectAll("g")
        //   .data(data)
        //   .join("g")
        //     .attr("transform", d => `translate(${x0(d[groupKey])},0)`)
        //   .selectAll("rect")
        //   .data(d => subgroupLevels.map(key => ({key, value: d[key]})))
        //   .join("rect")
        //     .attr("x", d => x1(d.key))
        //     .attr("y", d => y(d.value))
        //     .attr("width", x1.bandwidth())
        //     .attr("height", d => y(0) - y(d.value))
        //     .attr("fill", d => color(d.key));

        // svg.append("g")
        //     .call(xAxis);

        // svg.append("g")
        //     .call(yAxis);

        // var legend = svg => {
        //   const g = svg
        //       .attr("transform", `translate(${width},0)`)
        //       .attr("text-anchor", "end")
        //       .attr("font-family", "sans-serif")
        //       .attr("font-size", 10)
        //     .selectAll("g")
        //     .data(color.domain().slice().reverse())
        //     .join("g")
        //       .attr("transform", (d, i) => `translate(0,${i * 20})`);

        //   g.append("rect")
        //       .attr("x", -19)
        //       .attr("width", 19)
        //       .attr("height", 19)
        //       .attr("fill", color);

        //   g.append("text")
        //       .attr("x", -24)
        //       .attr("y", 9.5)
        //       .attr("dy", "0.35em")
        //       .text(d => d);
        // }

        // svg.append("g")
        //     .call(legend);

      }

    function drawGene3(geneSym) {
      g_count++;
      console.log("d3 canvas drawGene() " + g_count);

      let radius = 2
      let legend_width = 180
      let plot_width = 360
      let plot_height = 360
      let legend_margin = {
        top: 65, right: 0, bottom: 0, left: 10
      }
      let margin = {
        top: 45, right: 10, bottom: 10, left: 10
      }

      d3.select("#mydiv-gene-plot").remove()
      const container = d3.select("#mydiv-gene").append("div")
        .attr("id", "mydiv-gene-plot")
        .style("position", "relative")
        .style("display", "inline-block")
      const canvas = container.append('canvas').node()
      const context = canvas.getContext('2d')

      canvas.width = plot_width + legend_width;
      canvas.height = plot_height;

      const svg = container.append('svg')
        .attr("width", canvas.width)
        .attr("height", canvas.height)
        .style("position", "absolute")
        .style("top", '0px')
        .style("left", '0px');

      svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top - 15)
        .attr("font-family", "sans-serif")
        .attr("font-size", "32px")
        .attr("font-style", "italic")
        .text(geneSym)

      let panelBorder = svg.append("rect")
        .attr("x", margin.left - 10)
        .attr("y", margin.top - 10)
        .attr("width", plot_width)
        .attr("height", plot_height - margin.top + margin.bottom)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");

      var x = d3.scaleLinear()
        .domain(d3.extent(mydata, d => d.x))
        .range([margin.left, plot_width - margin.right])

      var y = d3.scaleLinear()
        .domain(d3.extent(mydata, d => d.y))
        .rangeRound([plot_height - margin.bottom, margin.top])

      var hexbin = d3.hexbin()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .radius(radius * (plot_width - legend_width) / (plot_height))
        .extent([[margin.left, margin.top], [plot_width - margin.right, plot_height - margin.bottom]])

      var bins = hexbin(mydata)

      // Number of points in the bin (works)
      // var color = d3.scaleSequential(d3.interpolateBuPu)
      //   .domain([0, d3.max(bins, bin => bin.length) / 2])

      // Sequential scale (works)
      var color = d3.scaleSequential(d3.interpolateBuPu)
        .domain([0, d3.max(bins, bin => d3.mean(bin, d => d.gene))])

      // Quantile scale (works)
      //var color_range = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      let color_range = linspace(0, 1, 10)
      // g_bins = bins
      // Need to filter out the zeros because genes are sparse
      let my_domain = bins
        .map(bin => d3.mean(bin, d => d.gene))
        .filter(d => d > 0)
      var color = d3.scaleQuantile()
        .domain(my_domain)
        .range(color_range.map(d => d3.interpolateBuPu(d)))

      context.fillStyle = "#fff";

      // context.strokeStyle = "black";
      // context.strokeRect(0, margin.top - 10, plot_width, plot_height - margin.top + margin.bottom);

      var hex = new Path2D(hexbin.hexagon());

      bins.forEach(function(bin){
        context.translate(bin.x, bin.y);
        //context.fillStyle = color(bin.length);
        context.fillStyle = color(d3.mean(bin, d => d.gene));
        context.fill(hex);
        context.setTransform(1, 0, 0, 1, 0, 0);
      });

      svg.append("text")
        .attr("x", plot_width + legend_margin.left)
        .attr("y", legend_margin.top - 20)
        .attr("font-family", "sans-serif")
        .attr("font-size", "1em")
        .attr("font-weight", "bold")
        .text("log2CPM")

      var legend = svg.selectAll("g.legend_colorbar")
        .data(color.range().reverse())
        .enter()
        .append("g")
        .attr("class","legend_colorbar");

      let legend_rect_height = 25

      legend
        .append('rect')
        .attr("x", plot_width + legend_margin.left)
        .attr("y", function(d, i) {
           return legend_margin.top + i * legend_rect_height;
        })
       .attr("width", 15)
       .attr("height", legend_rect_height)
       // .style("stroke", "black")
       // .style("stroke-width", 0.1)
       .style("fill", function(d){return d;});

      legend
        .append('text')
        .attr("x", plot_width + legend_margin.left + 20) //leave 5 pixel space after the <rect>
        .attr("y", function(d, i) {
         return legend_margin.top + i * legend_rect_height;
        })
        .attr("alignment-baseline", "middle")
        // .attr("dy", "0.8em") //place text one line *below* the x,y point
        .style("font-size","1em")
        .text(function(d, i) {
          // if (i % 2 == 0) {
          var extent = color.invertExtent(d);
          //extent will be a two-element array, format it however you want:
          var format = d3.format(".1f");
          // if (i == color_range.length - 1) {
          //   return `${format(+extent[0])} - ${format(+extent[1])}`
          // }
          return `${format(+extent[1])}`
          // }
        });
        
      // TODO Create just one text at the end instead of N texts
      legend
        .append("text")
        .attr("x", plot_width + legend_margin.left + 20)
        .attr("y", legend_margin.top + color_range.length * legend_rect_height)
        .attr("alignment-baseline", "middle")
        // .attr("dy", "0.8em") //place text one line *below* the x,y point
        .style("font-size","0.9em")
        .text(function(d, i) {
          var extent = color.invertExtent(d);
          //extent will be a two-element array, format it however you want:
          var format = d3.format(".0f");
          if (i == color_range.length - 1) {
            return `${format(+extent[0])}`
          }
        });

      // Canvas text
      ////There are several options for setting text
      //context.font = "italic 30px Open Sans";
      ////textAlign supports: start, end, left, right, center
      //context.textAlign = "start"
      ////textBaseline supports: top, hanging, middle, alphabetic, ideographic bottom
      //context.textBaseline = "hanging"
      //context.fillStyle = "black";
      //context.fillText(geneSym, 5, 5);
    }

    // Use d3 to draw a binhex plot
    function drawGene2(geneSym) {
      console.log("d3 drawGene()");

      var radius = 2
      var width = 800
      var height = 600
      var margin = ({top: 20, right: 20, bottom: 30, left: 40})

      var x = d3.scaleLinear()
        .domain(d3.extent(mydata, d => d.x))
        .range([margin.left, width - margin.right])

      var y = d3.scaleLinear()
        .domain(d3.extent(mydata, d => d.y))
        .rangeRound([height - margin.bottom, margin.top])

      hexbin = d3.hexbin()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .radius(radius * width / height)
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])

      bins = hexbin(mydata)

      // var color = d3.scaleSequential(d3.interpolateBuPu)
      //   .domain([0, d3.max(bins, d => d.length) / 2])

      var color = d3.scaleSequential(d3.interpolateBuPu)
        .domain([0, d3.max(bins, bin => d3.mean(bin, d => d.gene))])

      const svg = d3.select("#mydiv").append("svg")
          .attr("viewBox", [0, 0, width * 3, height * 3]);

      // var xAxis = g => g
      //   .attr("transform", `translate(0,${height - margin.bottom})`)
      //   .call(d3.axisBottom(x).ticks(width / 80, ""))
      //   .call(g => g.select(".domain").remove())
      //   .call(g => g.append("text")
      //       .attr("x", width - margin.right)
      //       .attr("y", -4)
      //       .attr("fill", "currentColor")
      //       .attr("font-weight", "bold")
      //       .attr("text-anchor", "end")
      //       .text(mydata.x))
      // svg.append("g")
      //     .call(xAxis);

      // var yAxis = g => g
      //   .attr("transform", `translate(${margin.left},0)`)
      //   .call(d3.axisLeft(y).ticks(null, ".1s"))
      //   .call(g => g.select(".domain").remove())
      //   .call(g => g.append("text")
      //       .attr("x", 4)
      //       .attr("y", margin.top)
      //       .attr("dy", ".71em")
      //       .attr("fill", "currentColor")
      //       .attr("font-weight", "bold")
      //       .attr("text-anchor", "start")
      //       .text(mydata.y))
      // svg.append("g")
      //     .call(yAxis);

      svg.append("g")
          // .attr("stroke", "#000")
          // .attr("stroke-opacity", 0.1)
        .selectAll("path")
        .data(bins)
        .join("path")
          .attr("d", hexbin.hexagon())
          .attr("transform", d => `translate(${d.x},${d.y})`)
          //.attr("fill", d => color(d.length));
          .attr("fill", bin => color(d3.mean(bin, d => d.gene)));

      //svg.append("g")
      //    // .attr("stroke", "#000")
      //    // .attr("stroke-opacity", 0.1)
      //  .selectAll("path")
      //  .data(bins)
      //  .join("path")
      //    .attr("d", hexbin.hexagon())
      //    .attr("transform", d => `translate(${d.x},${d.y})`)
      //    .attr("fill", d => color(d.length));

      //d3.select("#mydiv").append(svg)
    }

    return {
      "drawGene": drawGene3,
      "drawMetaHex": drawMetaHex,
      "drawBars": drawBars
    }
  }();

  function deparam(params){
  /* https://github.com/jupiterjs/jquerymx/blob/master/lang/string/deparam/deparam.js */
    if(! params || ! paramTest.test(params) ) {
      return {};
    }

    var data = {},
      pairs = params.split('&'),
      current;

    for(var i=0; i < pairs.length; i++){
      current = data;
      var pair = pairs[i].split('=');

      // if we find foo=1+1=2
      if(pair.length !== 2) {
        pair = [pair[0], pair.slice(1).join("=")];
      }

      var key = decodeURIComponent(pair[0].replace(plus, " ")),
        value = decodeURIComponent(pair[1].replace(plus, " ")),
        parts = key.match(keyBreaker);

      for ( var j = 0; j < parts.length - 1; j++ ) {
        var part = parts[j];
        if (!current[part] ) {
          // if what we are pointing to looks like an array
          current[part] = digitTest.test(parts[j+1]) || parts[j+1] === "[]" ? [] : {};
        }
        current = current[part];
      }
      var lastPart = parts[parts.length - 1];
      if(lastPart === "[]"){
        current.push(value);
      }else{
        current[lastPart] = value;
      }
    }
    return data;
  }

  function getVar(name, defVal) {
     /* get query variable from current URL or default value if undefined */
     var myUrl = window.location.href;
     myUrl = myUrl.replace("#", "")
     var urlParts = myUrl.split("?")
     var queryStr = urlParts[1]
     var varDict = deparam(queryStr) // parse key=val&... string to object
     if (varDict[name]===undefined) {
       return defVal
     }
     return varDict[name]
  }

  function getDatasetNameFromUrl() {
    /* search for the "ds" parameter or a DNS hostname that indicates the dataset */
    // if ds=xxx was found in the URL, load the respective dataset
    var datasetName = getVar("ds");
    if (datasetName === undefined) {
        datasetName = ""
    }
    return datasetName;
  }

  function main(rootMd5) {
    console.log("mybrowser()");
    // var datasetName = 'Smillie2019';
    var datasetName = getDatasetNameFromUrl()
    db = new CbDbFile(datasetName);
    db.loadConfig(onConfigLoaded, rootMd5);
  }

  function colorByDefaultField(onDone) {
    /* get the default coloring field from the config or the URL and start coloring by it.
     * Call onDone() when done. */
    var colorByInfo = db.getDefaultColorField();
    var colorType = colorByInfo[0];
    var colorBy = colorByInfo[1];

    renderer.drawMetaHex(colorBy) //"cluster")

    if (getVar("gene")!==undefined) {
      colorType = "gene";
      colorBy = getVar("gene");
      loadGeneAndColor(colorBy) //"HMGB2")
    }

    // // allow to override coloring by URL args
    // else if (getVar("meta")!==undefined) {
    //   colorType = "meta";
    //   colorBy = getVar("meta");
    // }
    // if (colorType === "meta") {
    //   // update the meta field combo box
    //   var fieldIdx  = db.fieldNameToIndex(onlyAlphaNum(colorBy));
    //   if (fieldIdx===null) {
    //     alert("Default coloring is configured to be on field "+fieldName+
    //      " but cannot find a field with this name, using field 1 instead.");
    //     fieldIdx = 1;
    //   }
    //   $('#tpMetaCombo').val(fieldIdx).trigger('chosen:updated');
    //   $('#tpMetaBox_'+db.getMetaFields()[fieldIdx].name).addClass('tpMetaSelect');
    // }
    // else {
    //   loadGeneAndColor(colorBy, onDone);
    // }
  }

  var digitTest = /^\d+$/,
    keyBreaker = /([^\[\]]+)|(\[\])/g,
    plus = /\+/g,
    paramTest = /([^?#]*)(#.*)?$/;

  function deparam(params){
  /* https://github.com/jupiterjs/jquerymx/blob/master/lang/string/deparam/deparam.js */
    if(! params || ! paramTest.test(params) ) {
      return {};
    }

    var data = {},
      pairs = params.split('&'),
      current;

    for(var i=0; i < pairs.length; i++){
      current = data;
      var pair = pairs[i].split('=');

      // if we find foo=1+1=2
      if(pair.length !== 2) {
        pair = [pair[0], pair.slice(1).join("=")];
      }

      var key = decodeURIComponent(pair[0].replace(plus, " ")),
        value = decodeURIComponent(pair[1].replace(plus, " ")),
        parts = key.match(keyBreaker);

      for ( var j = 0; j < parts.length - 1; j++ ) {
        var part = parts[j];
        if (!current[part] ) {
          // if what we are pointing to looks like an array
          current[part] = digitTest.test(parts[j+1]) || parts[j+1] === "[]" ? [] : {};
        }
        current = current[part];
      }
      var lastPart = parts[parts.length - 1];
      if(lastPart === "[]"){
        current.push(value);
      }else{
        current[lastPart] = value;
      }
    }
    return data;
  }

  function changeUrl(vars, oldVars) {
  /* push the variables (object) into the history as the current URL. key=null deletes a variable. */
     // first get the current variables from the URL of the window
     var myUrl = window.location.href;
     myUrl = myUrl.replace("#", "");
     var urlParts = myUrl.split("?");
     var baseUrl = urlParts[0];

     let urlVars;
     if (oldVars===undefined) {
       var queryStr = urlParts[1];
       urlVars = deparam(queryStr); // parse key=val&... string to object
     } else {
       urlVars = oldVars;
     }

     // overwrite everthing that we got
     for (var key in vars) {
       var val = vars[key];
       if (val===null || val in urlVars)
         delete urlVars[key];
       else
         urlVars[key] = val;
     }

     var argStr = jQuery.param(urlVars); // convert to query-like string

     var dsName = "noname";
     if (db!==null)
      dsName = db.getName();

     if (argStr.length > 1000)
       warn("Cannot save current changes to the URL, the URL would be too long. "+
         "You can try to shorten some cluster labels to work around the problem temporarily. "+
         "But please contact us at cells@ucsc.edu and tell us about the error. Thanks!");
    else
       history.pushState({}, dsName, baseUrl+"?"+argStr);
  }

  function gotFirstCoords(coords, info, clusterMids) {
    /* XX very ugly way to implement promises. Need a better approach one day. */
    // gotCoords(coords, info, clusterMids);
    var n_cells = coords.length / 2;
    // console.log(n_cells + ' cells');
    // console.log(coords);
    // console.log(info);
    // console.log(clusterMids);

    // if (mydata === null) {
    //   for (var i = 0; i < coords.length; i += 2) {
    //     mydata.push({x: coords[i], y: coords[i + 1]});
    //   }
    // } else {
    //   for (var i = 0; i < n_cells; i++) {
    //     mydata[i].x = coords[i * 2];
    //     mydata[i].y = coords[i * 2 + 1];
    //   }
    // }

    mydata = []
    for (var i = 0; i < coords.length; i += 2) {
      mydata.push({ x: coords[i], y: coords[i + 1] });
    }

    function gotMetaArr(metaArr, metaInfo, funcVal) {
      var fieldName = metaInfo.name;
      for (var i = 0; i < metaArr.length; i++) {
        mydata[i][fieldName] = metaInfo.valCounts[metaArr[i]][0];
      }
      // loadGeneAndColor(state.gene) //"HMGB2")
      // renderer.drawMetaHex(state.meta) //"cluster")
      colorByDefaultField()
    }

    // Set the title of the page
    setTitle(db.name)

    // var fieldName = 'health';
    var fieldName = 'cluster';
    var metaInfo = db.findMetaInfo(fieldName);
    db.loadMetaVec(metaInfo, gotMetaArr, onProgressConsole);
  } // gotFirstCoords()

  function setTitle(text) {
    $("#mytitle").text(text)
  }

  function makeLabelRenames(metaInfo) {
    /* return an obj with old cluster name -> new cluster name */
    var valCounts = metaInfo.valCounts;
    if (valCounts===undefined) { // 'int' and 'float' types do not have their values counted yet
      // this doesn't work because the values are not loaded yet, requires moving this call to 
      // later
      //metaInfo.valCounts = countValues(metaInfo.arr);
      alert("cannot label on numeric fields, please use the enumFields option in cellbrowser.conf");
    }
    var newLabels = metaInfo.ui.shortLabels;

    var oldToNew = {};
    for (var i = 0; i < valCounts.length; i++) {
      var oldLabel = valCounts[i][0];
      var newLabel = newLabels[i];
      oldToNew[oldLabel] = newLabel;
    }
    return oldToNew;
  }

  // function gotCoords(coords, info, clusterInfo, newRadius) {
  //  /* called when the coordinates have been loaded */
  //  if (coords.length===0)
  //    alert("cellBrowser.js/gotCoords: coords.bin seems to be empty");
  //  var opts = {};
  //  if (newRadius)
  //    opts["radius"] = newRadius;

  //  g_coords = coords;

  //  // labels can be overriden by the user cart
  //  var labelField = db.conf.labelField;
  //  if (labelField) {
  //    var metaInfo = db.findMetaInfo(labelField);
  //    var oldToNew = makeLabelRenames(metaInfo);
  //  }

  //  var origLabels = [];
  //  var clusterMids = clusterInfo.labels;
  //  // old-style files contain just coordinates, no order
  //  if (clusterMids===undefined)
  //    clusterMids = clusterInfo;

  //  for (var i = 0; i < clusterMids.length; i++) {
  //    var labelInfo = clusterMids[i];
  //    var oldName = labelInfo[2];
  //    origLabels.push(oldName);
  //    var newName = oldToNew[oldName];
  //    labelInfo[2] = newName;
  //  }

  //  db.clusterOrder = clusterInfo.order;
   // }

  function onConfigLoaded(datasetName) { 
    // this is a collection if it does not have any field information
    if (!db.conf.metaFields) {
      showCollectionDialog(datasetName);
      return;
    }

    let binData = localStorage.getItem(db.name+"|custom");
    if (binData) {
      let jsonStr = LZString.decompress(binData);
      let customMeta = JSON.parse(jsonStr);
      db.conf.metaFields.unshift(customMeta);
    }

    db.loadCoords(0, gotFirstCoords, onProgressConsole);
    // Show the table of gene markers for each cluster
    // onClusterNameClick("TA 1")
    buildMarkerTables()

    let gene_search = $('#gene-search').selectize({
      maxItems: 1,
      valueField : 'id',
      labelField : 'text',
      searchField : 'text',
      closeAfterSelect: false,
      load : geneComboSearch
    });
    gene_search.on("change", onGeneChange);
  }

  function onGeneChange(ev) {
    /* user changed the gene in the combobox */
    var geneSym = ev.target.value;
    if (geneSym === "") {
      return; // do nothing if user just deleted the current gene
    }
    loadGeneAndColor(geneSym);
  }

  function geneComboSearch(query, callback) {
    /* called when the user types something into the gene box, returns matching gene symbols */
    if (!query.length) {
      return callback()
    }
    console.log("LOG geneComboSearch")
    db.searchGenes(query.toLowerCase(), callback)
  }

  function onProgressConsole(ev) {
    console.log(ev);
  }

  function loadGeneAndColor(geneSym, onDone) {
    recent_genes.unshift(geneSym)
    recent_genes = recent_genes.filter((x, i, a) => a.indexOf(x) === i).slice(0, 5)
    $("#recent-genes").html(
      "Recent: " + recent_genes.map(x =>
        `<i><a data-gene="${x}" class="text-primary recent-gene-link" style="cursor: pointer;">${x}</a></i>`
      ).join(", ")
    )
    $(".recent-gene-link").unbind("click")
    $(".recent-gene-link").on("click", onMarkerGeneClick);

    ++g_loadGeneAndColor
    console.log('loadGeneAndColor() call ' + g_loadGeneAndColor)
    /* color by a gene, load the array into the renderer and call onDone or just redraw */
    if (onDone===undefined) {
      onDone = function() {
        renderer.drawGene(geneSym)
      };
    }

    function gotGeneVec(exprArr, decArr, geneSym, geneDesc, binInfo) {

      g_exprArr = exprArr;
      g_decArr = decArr;
      g_geneSym = geneSym;
      g_geneDesc = geneDesc;
      g_binInfo = binInfo;

      if (mydata === null) {
        for (var i = 0; i < decArr.length; i++) {
          mydata.push({gene: decArr[i]});
        }
      } else {
        for (var i = 0; i < decArr.length; i++) {
          mydata[i]['gene'] = decArr[i];
        }
      }
      
      /* called when the expression vector has been loaded and binning is done */
      if (decArr===null)
        return;
      console.log("Received expression vector, gene "+geneSym+", geneId "+geneDesc);
      _dump(binInfo);
      // makeLegendExpr(geneSym, geneDesc, binInfo, exprArr, decArr);

      // renderer.setColors(legendGetColors(gLegend.rows));
      // renderer.setColorArr(decArr);
      // buildLegendBar();
      onDone();

      // update the gene combo box
      // selectizeSetValue("#tpGeneCombo", geneSym);

      // // update the "recent genes" div
      // for (var i = 0; i < gRecentGenes.length; i++) {
      //   // remove previous gene entry with the same symbol
      //   if (gRecentGenes[i][0]===geneSym) {
      //     gRecentGenes.splice(i, 1);
      //     break;
      //   }
      // }
      // gRecentGenes.unshift([geneSym, geneDesc]); // insert at position 0
      // gRecentGenes = gRecentGenes.slice(0, 9); // keep only nine last
    }

    changeUrl({"gene":geneSym, "meta":null, "pal":null});
    console.log("Loading gene expression vector for "+geneSym);

    db.loadExprAndDiscretize(geneSym, gotGeneVec, onProgressConsole);
  }

  function buildMarkerTables() {
    var metaInfo = db.findMetaInfo("cluster")

    var clusterNames = metaInfo.valCounts.map(d => d[0])

    var htmls = [];

    htmls.push(`<div class="row">`)

    htmls.push(`<div class="col-12"><div class="custom-control custom-switch">
      <input type="checkbox" class="custom-control-input" id="show-cluster-labels" checked>
      <label class="custom-control-label" for="show-cluster-labels">Show cluster labels</label>
    </div></div>`)

    htmls.push(`<div class="col-6"><h4>Metadata</h4>`)
    htmls.push(`<nav> <div class="nav nav-pills" id="nav-metadata" role="tablist"> `)
    for (var i = 0; i < db.conf.metaFields.length; i++) {
      var fieldLabel = db.conf.metaFields[i].label
      var fieldName = db.conf.metaFields[i].name
      if (fieldName.startsWith("custom") || fieldName.toLowerCase() == "cell") {
        continue
      }
      var selected = fieldName == "cluster"
      htmls.push(
        `<a class="nav-metadata nav-item nav-link ${selected ? 'active' : ''}"
        id="nav-metadata-${fieldName}"
        data-name="${fieldName}" data-toggle="tab"
        href="#metadata-${fieldName}" role="tab"
        aria-controls="metadata-${fieldName}"
        aria-selected="${selected ? true : false}">${fieldLabel}</a>`
      )
    }
    htmls.push(`</div> </nav>`)
    htmls.push(`</div>`) // Metadata



    htmls.push(`<div class="col-6">
      <h4>Genes</h4>
      <div class="row">
        <div class="col-auto">
          <select style="width:200px" id="gene-search" placeholder="search for a gene..." class="tpCombo"></select>
        </div>
        <div class="col-12" id="recent-genes">
        </div>
      </div>
    </div>`); // Genes

    htmls.push(`</div>`) // row

    $("#mycontrols").html(htmls.join(""))

    htmls = []

    htmls.push(`<div><h4>Clusters</h4></div>`)
    htmls.push(`<nav> <div class="nav nav-pills" id="nav-cluster-tables" role="tablist"> `)
    for (var clusterIndex = 0; clusterIndex < clusterNames.length; clusterIndex++) {
      var clusterName = clusterNames[clusterIndex]
      htmls.push(`<a class="nav-item nav-link ${clusterIndex == 0 ? 'active' : ''}" id="nav-cluster-table-${clusterIndex}" data-toggle="tab" href="#cluster-table-${clusterIndex}" role="tab" aria-controls="cluster-table-${clusterIndex}" aria-selected="${clusterIndex == 0 ? true : false}">${clusterName}</a>`)
    }
    htmls.push(`</div> </nav>`)

    htmls.push("<div id='tpPaneHeader' style='padding:0.4em 1em'>");
    htmls.push("Click a gene to plot it, or click a column name to sort the table.<br>");
    htmls.push("</div>");

    htmls.push("<div class='tab-content' id='cluster-tables'>");
    for (var clusterIndex = 0; clusterIndex < clusterNames.length; clusterIndex++) {
      htmls.push(`<div class="tab-pane ${clusterIndex == 0 ? 'show active' : ''}" id="cluster-table-${clusterIndex}" role="tabpanel" aria-labelledby="nav-cluster-table-${clusterIndex}">`)

      var clusterName = clusterNames[clusterIndex]

      var nameIdx = metaInfo.valCounts.map(d => d[0]).indexOf(clusterName)

      var tabInfo = db.conf.markers; // list with (label, subdirectory)

      console.log("building marker genes window for "+clusterName);

      var buttons = [];

      if (tabInfo===undefined || tabInfo.length===0) {
        tabInfo = [];
        buttons.push({
          text:"Close", 
          click: function() { $( this ).dialog( "close" ) }
        }); 
        htmls.push("No marker genes are available in this dataset. " +
          "To add marker genes, contact the original authors of the dataset and ask them to add " +
          " them to the cell browser.");
      } else {
        buttons.push({
          text:"Download as file", 
          click: function() {
            document.location.href = markerTsvUrl;
          }
        });
      }

      var doTabs = (tabInfo.length>1);

      if (doTabs) {
        htmls.push("<div id='tabs'>");
        htmls.push("<ul>");
        for (var tabIdx = 0; tabIdx < tabInfo.length; tabIdx++) {
          var tabLabel = tabInfo[tabIdx].shortLabel;
          htmls.push("<li><a href='#tabs-"+tabIdx+"'>"+tabLabel+"</a>");
        }
        htmls.push("</ul>");
      }

      for (let tabIdx = 0; tabIdx < tabInfo.length; tabIdx++) {
        var divName = "tabs-"+tabIdx+"-cluster-"+clusterIndex;
        var tabDir = tabInfo[tabIdx].name;
        var sanName = sanitizeName(clusterName);
        var markerTsvUrl = cbUtil.joinPaths([db.name, "markers", tabDir, sanName+".tsv.gz"]);
        htmls.push(`<div id="${divName}" style="height:500px; overflow-y: scroll;">`);
        htmls.push("Loading...");
        htmls.push("</div>");

        loadClusterTsv(markerTsvUrl, loadMarkersFromTsv, divName, clusterName, clusterIndex);
      }

      if (doTabs) {
        htmls.push("</div>"); // tabs
      }

      htmls.push("</div>"); // tab-pane
    }
    htmls.push("</div>"); // tab-content
    
    $("#mytable").html(htmls.join(""));

    $("#show-cluster-labels").unbind("change")
    $("#show-cluster-labels").change(function() {$(".cluster_label").toggle()})
  }

  function onClusterNameClick(clusterName) {
    var metaInfo = db.findMetaInfo("cluster")
    var nameIdx = metaInfo.valCounts.map(d => d[0]).indexOf(clusterName)

    var tabInfo = db.conf.markers; // list with (label, subdirectory)

    console.log("building marker genes window for "+clusterName);
    var htmls = [];
    htmls.push("<div id='tpPaneHeader' style='padding:0.4em 1em'>");

    var buttons = [];

    if (tabInfo===undefined || tabInfo.length===0) {
      tabInfo = [];
      buttons.push({
        text:"Close", 
        click: function() { $( this ).dialog( "close" ) }
      }); 
      htmls.push("No marker genes are available in this dataset. " +
        "To add marker genes, contact the original authors of the dataset and ask them to add " +
        " them to the cell browser.");
    } else {
      htmls.push("Click gene symbols below to color plot by gene<br>");
      buttons.push({
        text:"Download as file", 
        click: function() {
          document.location.href = markerTsvUrl;
        }
      });
    }
    htmls.push("</div>");

    var doTabs = (tabInfo.length>1);

    if (doTabs) {
      htmls.push("<div id='tabs'>");
      htmls.push("<ul>");
      for (var tabIdx = 0; tabIdx < tabInfo.length; tabIdx++) {
        var tabLabel = tabInfo[tabIdx].shortLabel;
        htmls.push("<li><a href='#tabs-"+tabIdx+"'>"+tabLabel+"</a>");
      }
      htmls.push("</ul>");
    }

    for (let tabIdx = 0; tabIdx < tabInfo.length; tabIdx++) {
      var divName = "tabs-"+tabIdx;
      var tabDir = tabInfo[tabIdx].name;
      var sanName = sanitizeName(clusterName);
      var markerTsvUrl = cbUtil.joinPaths([db.name, "markers", tabDir, sanName+".tsv.gz"]);
      htmls.push("<div id='"+divName+"'>");
      htmls.push("Loading...");
      htmls.push("</div>");

      loadClusterTsv(markerTsvUrl, loadMarkersFromTsv, divName, clusterName);
    }

    htmls.push("</div>"); // tabs

    var winWidth = window.innerWidth - 0.10*window.innerWidth;
    var winHeight = window.innerHeight - 0.10*window.innerHeight;
    var title = "Cluster markers for &quot;"+clusterName+"&quot;";
    
    //var metaInfo = db.findMetaInfo("cluster")
    //if (metaInfo.ui.longLabels) {
    //  //var nameIdx = cbUtil.findIdxWhereEq(metaInfo.ui.shortLabels, 0, clusterName);
    //  //var acronyms = db.conf.acronyms;
    //  //title += " - "+acronyms[clusterName];
    //  var longLabel = metaInfo.ui.longLabels[nameIdx];
    //  if (clusterName!==longLabel)
    //    title += " - "+metaInfo.ui.longLabels[nameIdx];
    //}

    //if (acronyms!==undefined && clusterName in acronyms)
      //title += " - "+acronyms[clusterName];
    // showDialogBox(htmls, title, {width: winWidth, height:winHeight, "buttons":buttons});
    // $(".ui-widget-content").css("padding", "0");
    // $("#tabs").tabs();
    
    $("#mytable").html(htmls.join(""));
  }

  // ---------

  var DEBUG = true;

  function _dump(o) {
  /* for debugging */
    console.log(JSON.stringify(o));
  }

  function formatString (str) {
    /* Stackoverflow code https://stackoverflow.com/a/18234317/233871 */
    /* "a{0}bcd{1}ef".formatUnicorn("foo", "bar"); // yields "aFOObcdBARef" */
      if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
          Array.prototype.slice.call(arguments)
          : arguments[0];
  
        for (key in args) {
          str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
      }
      return str;
    }

  function debug(msg, args) {
    if (DEBUG) {
      console.log(formatString(msg, args));
    }
  }

  function warn(msg) {
    alert(msg);
  }

  function cloneObj(d) {
  /* returns a copy of an object, wasteful */
    // see http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
    return JSON.parse(JSON.stringify(d));
  }

  function cloneArray(a) {
  /* returns a copy of an array */
    return a.slice();
  }

  function copyNonNull(srcArr, trgArr) {
  /* copy non-null values to trgArr */
    if (srcArr.length!==trgArr.length)
      alert("warning - copyNonNull - target and source array have different sizes.");

    for (var i = 0; i < srcArr.length; i++) {
      if (srcArr[i]!==null)
        trgArr[i] = srcArr[i];
    }
    return trgArr;
  }

  function isEmpty(obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  function allEmpty(arr) {
    /* return true if all members of array are white space only strings */
    var newArr = arr.filter(function(str) { return /\S/.test(str); });
    return (newArr.length===0);
  }

  function copyNonEmpty(srcArr, trgArr) {
  /* copy from src to target array if value is not "". Just return trgArr is srcArr is null or lengths don't match.  */
    if (!srcArr || (srcArr.length!==trgArr.length))
      return trgArr;

    for (var i = 0; i < srcArr.length; i++) {
      if (srcArr[i]!=="")
        trgArr[i] = srcArr[i];
    }
    return trgArr;
  }

  function keys(o) {
  /* return all keys of object as an array */
    var allKeys = [];
    for(var k in o) allKeys.push(k);
    return allKeys;
  }

  function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
  }

  
  function findMetaValIndex(metaInfo, value) {
    /* return the index of the value of an enum meta field */
    var valCounts = metaInfo.valCounts;
    for (var valIdx = 0; valIdx < valCounts.length; valIdx++) {
      if (valCounts[valIdx][0]===value)
        return valIdx;
    }
  }

  function intersectArrays(arrList) {
    /* return the intersection of all arrays as an array. Non-IE11? */
    var smallSet = new Set(arrList[0]);
    for (var i=1; i < arrList.length; i++) {
      var otherSet = new Set(arrList[i]);
      smallSet = new Set([...smallSet].filter(x => otherSet.has(x)));
    }
    var newArr = Array.from(smallSet);
    // alternative without spread:
    //function intersection(setA, setB) {
      //  var _intersection = new Set();
      //  for (var elem of setB) {
      //    if (setA.has(elem)) {
      //      _intersection.add(elem);
      //    }
      //  }
      //  return _intersection;
    //}
    return newArr;
  }

  function prettyNumber(/*int*/ count) /*str*/ {
    /* convert a number to a shorter string, e.g. 1200 -> 1.2k, 1200000 -> 1.2M, etc */
    var f = count;

    if (count>1000000) {
      f = (count / 1000000);
      return f.toFixed(1)+"M";
    }
    if (count>10000) {
      f = (count / 1000);
      return f.toFixed(0)+"k";
    }
    if (count>1000) {
      f = (count / 1000);
      return f.toFixed(1)+"k";
    }

    return f;
  }

  function sanitizeName(name) {
    /* ported from cellbrowser.py: remove non-alpha, allow underscores */
    var newName = name.replace(/[^a-zA-Z_0-9]/g, "");
    return newName;
  }

  function onlyAlphaNum(name) {
    /* only allow alphanumeric characters */
    var newName = name.replace(/[^a-zA-Z0-9+]/g, "");
    return newName;
  }

  function loadClusterTsv(fullUrl, func, divName, clusterName, clusterIndex) {
  /* load a tsv file relative to baseUrl and call a function when done */
    function conversionDone(data) {
      Papa.parse(data, {
          complete: function(results, localFile) {
                func(results, localFile, divName, clusterName, clusterIndex);
              },
          error: function(err, file) {
                if (divName!==undefined)
                  alert("could not load "+fullUrl);
              }
          });
    }

    function onTsvLoadDone(res) {
      var data = res.target.response;
      if (res.target.responseURL.endsWith(".gz")) {
        data = pako.ungzip(data);
        //data = String.fromCharCode.apply(null, data); // only good for short strings
        data = arrayBufferToString(data, conversionDone);
      }
      else
        conversionDone(data);
    }

    var req = new XMLHttpRequest();
    req.addEventListener("load", onTsvLoadDone);
    req.open('GET', fullUrl, true);
    req.responseType = "arraybuffer";
    req.send();
  }

  function loadMarkersFromTsv(papaResults, url, divId, clusterName, clusterIndex) {
    /* construct a table from a marker tsv file and write as html to the DIV with divID */
    console.log("got coordinate TSV rows, parsing...");
    var rows = papaResults.data;

    var headerRow = rows[0];

    var htmls = [];

    var markerListIdx = parseInt(divId.split("-")[1]);
    var selectOnClick = db.conf.markers[markerListIdx].selectOnClick;

    htmls.push(`<table class='table' id='tpMarkerTable-${clusterIndex}'>`);
    htmls.push("<thead>");
    var hprdCol = null;
    var geneListCol = null;
    var exprCol = null;
    var pValCol = null
    //var doDescSort = false;
    for (var i = 1; i < headerRow.length; i++) {
      var colLabel = headerRow[i];
      var isNumber = false;

      if (colLabel.indexOf('|') > -1) {
        var parts = colLabel.split("|");
        colLabel = parts[0];
        var colType = parts[1];
        if (colType==="int" || colType==="float")
          isNumber = true;
      }

      var width = null;
      if (colLabel==="_geneLists") {
        colLabel = "Gene Lists";
        geneListCol = i;
      }
      else if (colLabel==="P_value" || colLabel==="p_val" || colLabel==="pVal") {
        colLabel = "P-value";
        pValCol = i;
        //if (i===2)
          //doDescSort = true;
      }
      
      else if (colLabel==="_expr") {
        colLabel = "Expression";
        exprCol = i;
      }
      else if (colLabel==="_hprdClass") {
        hprdCol = i;
        colLabel = "Protein Class (HPRD)";
        width = "200px";
      }

      var addStr = "";
      if (isNumber)
        addStr = " data-sort-method='number'";

      if (width===null) {
        htmls.push(`<th ${addStr} style="position:sticky; top:0; border-top:0; background-color: #f0f0f0;">`);
      } else {
        htmls.push(`<th ${addStr} style="width:${width}; position:sticky; top:0; border-top:0; background-color: #f0f0f0;">`);
      }
      colLabel = colLabel.replace(/_/g, " ");
      htmls.push(colLabel);
      htmls.push("</th>");
    }
    htmls.push("</thead>");

    // var hubUrl = makeHubUrl();
    var hubUrl = null;

    htmls.push("<tbody>");
    for (let i = 1; i < rows.length; i++) {
      var row = rows[i];
      if ((row.length===1) && row[0]==="") // papaparse sometimes adds empty lines to files
        continue;

      htmls.push("<tr>");
      var geneId = row[0];
      var geneSym = row[1];
      htmls.push(`<td><i><a data-gene="${geneSym}" class='text-primary tpLoadGeneLink' style="cursor: pointer;">${geneSym}</a></i>`);
      if (hubUrl!==null) {
        var fullHubUrl = hubUrl+"&position="+geneSym+"&singleSearch=knownCanonical";
        htmls.push("<a target=_blank class='link' style='margin-left: 10px; font-size:80%; color:#AAA' title='link to UCSC Genome Browser' href='"+fullHubUrl+"'>Genome</a>");
      }
      htmls.push("</td>");

      for (var j = 2; j < row.length; j++) {
        var val = row[j];
        htmls.push("<td>");
        // added for the autism dataset, allows to add mouse overs with images
        // field has to start with ./
        if (val.startsWith("./")) {
          var imgUrl = val.replace("./", db.url+"/");
          var imgHtml = '<img width="100px" src="'+imgUrl+'">';
          val = "<a data-toggle='tooltip' data-placement='auto' class='tpPlots link' target=_blank title='"+imgHtml+"' href='"+ imgUrl + "'>plot</a>";
        }
        if (j===geneListCol || j===exprCol) {
          geneListFormat(htmls, val, geneSym);
        } else if (j===pValCol) {
          htmls.push(parseFloat(val).toPrecision(5)); // five digits ought to be enough for everyone
        } else {
          htmls.push(+val);
        }
        htmls.push("</td>");
      }
      htmls.push("</tr>");
    }

    htmls.push("</tbody>");
    htmls.push("</table>");


    $("#"+divId).html(htmls.join(""));
    var sortOpt = {};
    //if (doDescSort)
      //sortOpt.descending=true;
    new Tablesort(document.getElementById(`tpMarkerTable-${clusterIndex}`));
    $(".tpLoadGeneLink").unbind("click")
    $(".tpLoadGeneLink").on("click", onMarkerGeneClick);
    // activateTooltip(".link");
    //
    $(".nav-metadata").unbind("click")
    $(".nav-metadata").on("click", onMetaClick);

    var ttOpt = {"html": true, "animation": false, "delay":{"show":100, "hide":100} };
    // $(".tpPlots").bsTooltip(ttOpt);
  }

  function onMarkerGeneClick(ev) {
    /* user clicks onto a gene in the table of the marker gene dialog window */
    var geneSym = ev.target.getAttribute("data-gene");
    loadGeneAndColor(geneSym);
  }

  function onMetaClick(ev) {
    /* user clicks onto a gene in the table of the marker gene dialog window */
    var fieldName = ev.target.getAttribute("data-name");
    renderer.drawMetaHex(fieldName);
  }

  function buildGeneCombo(htmls, id, left, width) {
    /* Combobox that allows searching for genes */
    //htmls.push('<div class="tpToolBarItem" style="position:absolute;left:'+left+'px;top:'+toolBarComboTop+'px">');
    htmls.push('<div class="tpToolBarItem" style="padding-left: 3px">');
    htmls.push('<label style="display:block; margin-bottom:8px; padding-top: 8px;" for="'+id+'">Color by Gene</label>');
    htmls.push('<select style="width:'+width+'px" id="'+id+'" placeholder="search for gene..." class="tpCombo">');
    htmls.push('</select>');
    htmls.push('</div>');
    //htmls.push("<button>Multi-Gene</button>");
  }

  function arrayBufferToString(buf, callback) {
    /* https://stackoverflow.com/questions/8936984/uint8array-to-string-in-javascript */
     var bb = new Blob([new Uint8Array(buf)]);
     var f = new FileReader();
     f.onload = function(e) {
       callback(e.target.result);
     };
     f.readAsText(bb);
  }

  function linspace(start, stop, nsteps) {
    let delta = (stop - start) / (nsteps - 1)
    return d3.range(nsteps).map(function(i){return start + i * delta;})
  }


  // Only export these functions
  return {
    "main": main,
    "renderer": renderer
  }


}();
