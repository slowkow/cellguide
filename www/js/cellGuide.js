"use strict";

var g_bins = null

var pals = {
  "alphabet": [
    "#F0A0FF", "#0075DC", "#993F00", "#4C005C", "#191919",
    "#005C31", "#2BCE48", "#FFCC99", "#808080", "#94FFB5", "#8F7C00",
    "#9DCC00", "#C20088", "#003380", "#FFA405", "#FFA8BB", "#426600",
    "#FF0010", "#5EF1F2", "#00998F", "#E0FF66", "#740AFF", "#990000",
    "#FFFF80", "#FFE100", "#FF5005",
    "#F0A0FF", "#0075DC", "#993F00", "#4C005C", "#191919",
    "#005C31", "#2BCE48", "#FFCC99", "#808080", "#94FFB5", "#8F7C00",
    "#9DCC00", "#C20088", "#003380", "#FFA405", "#FFA8BB", "#426600",
    "#FF0010", "#5EF1F2", "#00998F", "#E0FF66", "#740AFF", "#990000",
    "#FFFF80", "#FFE100", "#FF5005"
  ],
  "okabe": [
    "#666666", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2",
    "#D55E00", "#CC79A7"
  ],
  "mpn65": [
    '#ff0029', '#377eb8', '#66a61e', '#984ea3', '#00d2d5', '#ff7f00', '#af8d00',
    '#7f80cd', '#b3e900', '#c42e60', '#a65628', '#f781bf', '#8dd3c7', '#bebada',
    '#fb8072', '#80b1d3', '#fdb462', '#fccde5', '#bc80bd', '#ffed6f', '#c4eaff',
    '#cf8c00', '#1b9e77', '#d95f02', '#e7298a', '#e6ab02', '#a6761d', '#0097ff',
    '#00d067', '#000000', '#252525', '#525252', '#737373', '#969696', '#bdbdbd',
    '#f43600', '#4ba93b', '#5779bb', '#927acc', '#97ee3f', '#bf3947', '#9f5b00',
    '#f48758', '#8caed6', '#f2b94f', '#eff26e', '#e43872', '#d9b100', '#9d7a00',
    '#698cff', '#d9d9d9', '#00d27e', '#d06800', '#009f82', '#c49200', '#cbe8ff',
    '#fecddf', '#c27eb6', '#8cd2ce', '#c4b8d9', '#f883b0', '#a49100', '#f48800',
    '#27d0df', '#a04a9b'
  ],
  "batlow": [
    "#001959", "#021C5A", "#041F59", "#04215B", "#06245B", "#07265B",
    "#09295C", "#0A2C5C", "#0A2E5C", "#0C315D", "#0C335D", "#0D365D",
    "#0F395F", "#0F3C5F", "#103F60", "#114160", "#124460", "#134660",
    "#154A61", "#164C60", "#184F60", "#1A5260", "#1C5460", "#1E5761",
    "#20595F", "#235C5F", "#255E5E", "#29605E", "#2C635C", "#2F655B",
    "#336759", "#366858", "#3A6A56", "#3E6C54", "#416D53", "#456F50",
    "#49704F", "#4D724C", "#50734B", "#547548", "#597645", "#5C7744",
    "#607841", "#647940", "#687B3D", "#6C7B3C", "#707D39", "#757E37",
    "#797F35", "#7D8133", "#818132", "#868330", "#8A842F", "#90862E",
    "#95872D", "#9A872D", "#9F892D", "#A48A2D", "#AA8C2F", "#AF8D30",
    "#B58D33", "#BB8F36", "#C08F38", "#C5903C", "#CA913F", "#CF9243",
    "#D49347", "#D9944C", "#DE9651", "#E29755", "#E6985A", "#E9995F",
    "#ED9B65", "#F19D6B", "#F39E70", "#F5A076", "#F7A17B", "#F9A380",
    "#F9A486", "#FBA68B", "#FBA892", "#FDA997", "#FCAC9C", "#FDADA1",
    "#FDAFA6", "#FDB0AC", "#FDB3B2", "#FDB5B7", "#FDB6BC", "#FDB9C2",
    "#FDBAC7", "#FDBCCC", "#FDBDD2", "#FCC0D8", "#FBC2DD", "#FBC3E3",
    "#FAC6E8", "#FAC7EE", "#FBCAF4", "#F9CCF9"
  ].reverse(),
}

// Store one gene in a list of objects.
var g_mydata = []

var g_healthField = "health"
var g_donorField = "donor"

var g_count = 0
var g_loadGeneAndColor = 0

var db = null
var g_coords = null
var g_exprArr, g_decArr, g_geneSym, g_geneDesc, g_binInfo

var mybrowser = function() {
  // var db = null; // the cbData object from cbData.js. Loads coords,

  var gRecentGenes = [];
  // var coords = null;

  // var vlSpec = vega_geneHeatmap;

  var recent_genes = []

  var state = {
    gene: "none",
    gene_groupby: "none",
    meta: "none"
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
    <div class="container">
<nav class="navbar navbar-expand-lg navbar-light bg-light mb-5">
  <a class="navbar-brand" href="/">Cell Guide &#129517;</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav">
      <li class="nav-item">
        <!-- <a class="nav-link" href="https://github.com/slowkow/cellguide"><span class="fa fa-github"></span>Source Code</a> -->
      </li>
    </ul>
  </div>
</nav>
  </div>

    <div class="container" id="mycontainer">

      <h2 id="mytitle">Cell Guide</h2>
      <hr>

      <div id="display-meta" style="display:block;">
        <div id="meta-row" class="row">
          <div id="mydiv-meta-plot" class="col-6"></div>
          <div id="meta-boxplot" class="col-6"></div>
        </div>
        <div id="mycontrols" class="row mb-4">
        </div>
        <div>
          <h3>Heatmap of cell counts</h3>
          <a class="btn btn-secondary" data-toggle="collapse" href="#collapse-heatmap" role="button" aria-expanded="false" aria-controls="collapse-heatmap">Show / Hide</a>
        </div>
        <div class="collapse show" id="collapse-heatmap">
        <div id="meta-row-2" class="row">
          <div id="meta-heatmap" class="col-12"></div>
        </div>
        </div>
      </div>

      <div id="display-gene" style="display:block;height:500px;">
          <h3>Gene expression</h3>
        <div class="row">
          <div id="gene-loading-spinner" class="col-2 offset-5">
            <div class="loader"></div>
          </div>
          <div id="mydiv-gene" class="col-6"></div>
          <div id="gene-bars" class="col-3" style="min-height:450px;"></div>
          <div id="gene-boxplot" class="col-3"></div>
        </div>
      </div>

      <div class="row">
          <div id="mytable" class="col-12"></div>
      </div>

      <footer class="text-center mastfoot my-5">
        <div class="inner">
          <hr>
          <p><a href="/">Cell Guide</a> is a project by <a href="https://twitter.com/slowkow">@slowkow</a>.</p>
        </div>
      </footer>

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
        var meta_valcounts = get_groups(fieldName)
        var this_pal = metaInfo.valCounts.length <= pals.okabe.length ?
          pals.okabe : pals.mpn65
        var metaColors = {}
        // {'healthy': {r: 240, g: 160, b: 255, opacity: 1}, ...}
        for (var i = 0; i < meta_valcounts.length; i++) {
          var x = meta_valcounts[i][0]
          var color_i = i
          if (color_i > this_pal.length - 1) {
            color_i = color_i % this_pal.length
          }
          metaColors[x] = d3.color(this_pal[color_i])
        }
      }

      // _dump(metaColors)

      function doDrawMetaHex() {
        var radius = 1
        var legend_width = 210
        const canvas_scale = 2
        var plot_width = 460 * canvas_scale
        var plot_height = 460 * canvas_scale
        var legend_margin = {
          top: 40, right: 0, bottom: 0, left: 5
        }
        var margin = {
          top: 45, right: 10, bottom: 10, left: 10
        }

        d3.select("#mydiv-meta-plot").html("")
          .style("position", "relative")
          .style("display", "inline-block")
        // const container = d3.select("#mydiv-meta").append("div")
        //   .attr("id", "mydiv-meta-plot")
        //   .style("position", "relative")
        //   .style("display", "inline-block")
        //   // .style("display", "none")
        // const canvas = container.append('canvas').node()
        const container = d3.select("#mydiv-meta-plot")
        const canvas = container.append("canvas")
          .attr("id", "mycanvas-meta-plot")
          // .style("width", `${plot_width + legend_width}px`)
          .node()
        const context = canvas.getContext('2d')

        canvas.width = plot_width + legend_width * canvas_scale
        canvas.height = plot_height

        const svg = container.append('svg')
          .attr("width", canvas.width / canvas_scale - legend_width / 1.7)
          .attr("height", canvas.height / canvas_scale)
          .style("position", "absolute")
          .style("top", '0px')
          .style("left", `${margin.left}px`)

        let meta_title = metaInfo.valCounts ?
          `${metaInfo.label} (n = ${metaInfo.valCounts.length})` :
          `${metaInfo.label}`

        svg.append("text")
          .attr("x", margin.left)
          .attr("y", margin.top - 20)
          .attr("font-family", "sans-serif")
          .attr("font-size", "24px")
          .text(meta_title)

        svg.append("text")
          .attr("x", margin.left / 2)
          .attr("y", plot_height / canvas_scale - margin.bottom)
          .attr("font-family", "sans-serif")
          .attr("font-size", "1em")
          .text(d3.format(",")(db.conf.sampleCount) + " cells")

        let panelBorder = svg.append("rect")
          .attr("x", margin.left - 10)
          .attr("y", margin.top - 10)
          .attr("width", plot_width / canvas_scale)
          .attr("height", plot_height / canvas_scale - margin.top + margin.bottom)
          .style("stroke", "black")
          .style("fill", "none")
          .style("stroke-width", "1px");

        var x = d3.scaleLinear()
          .domain(d3.extent(g_mydata, d => d.x))
          .range([margin.left, plot_width - margin.right])

        var y = d3.scaleLinear()
          .domain(d3.extent(g_mydata, d => d.y))
          .rangeRound([plot_height - margin.bottom, margin.top])

        var hexbin = d3.hexbin()
          .x(d => x(d.x))
          .y(d => y(d.y))
          .radius(radius * (plot_width - legend_width) / plot_height + 0.2)
          .extent([[margin.left, margin.top], [plot_width - margin.right, plot_height - margin.bottom]])

        var bins = hexbin(g_mydata)

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

          // mixing colors...
          // TODO: consider using HCL space https://bl.ocks.org/mbostock/3014589
          function colorEnum(bin) {
            // Input: [{health: "healthy"}, {health: "not healthy"}, ...]
            // Ouput: [["healthy", 0.25], ["not healthy", 0.75]]
            var a = Array.from(d3.rollup(
              bin, v => v.length / bin.length, d => d[fieldName]
            ))
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
            context.strokeStyle = context.fillStyle
            context.lineWidth = 0
            context.stroke(hex)
            context.setTransform(1, 0, 0, 1, 0, 0)
          });

          var ordinal = d3.scaleOrdinal()
            .domain(meta_valcounts.map(d => d[0]))
            .range(meta_valcounts.map(d => metaColors[d[0]]))
            // .domain(Object.keys(metaColors).slice().sort())
            // .range(Object.values(metaColors).reverse())

          svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform",
              `translate(
                ${plot_width / canvas_scale + legend_margin.left},
                ${legend_margin.top})`
            )

          var legendOrdinal = svg => {
            const box_height = Math.min(
              20,
              (0.9 * plot_height / canvas_scale) / meta_valcounts.length
            )
            const font_size = Math.min(14, box_height)
            const g = svg
                .attr("text-anchor", "start")
                .attr("font-family", "sans-serif")
                // .attr("font-size", 14)
                .attr("font-size", `${font_size}px`)
              .selectAll("g")
              .data(ordinal.domain())
              .join("g")
                .attr("transform", (d, i) => `translate(0,${i * box_height})`)
            g.append("rect")
              .attr("width", 10)
              .attr("height", box_height * 0.9)
              .attr("fill", ordinal)
            g.append("text")
              .attr("x", 10 + 3)
              .attr("y", box_height / 2)
              .attr("alignment-baseline", "middle")
              // .attr("dy", "0.35em")
              .text(d => d)
          }

          // var legendOrdinal = d3.legendColor()
          //   .shape("path", d3.symbol().type(d3.symbolCircle).size(200)())
          //   // .labelWrap(legend_width - 30)
          //   // .shapePadding(10)
          //   .scale(ordinal);

          // if (metaColors.length < 10) {
            svg.select(".legendOrdinal")
              .call(legendOrdinal);
          // }
          
          // function text_position(d,i) {
          //   var c = 16;   // number of rows
          //   var h = 20;  // legend entry height
          //   var w = 150; // legend entry width (so we can position the next column) 
          //   var tx = 10; // tx/ty are essentially margin values
          //   var ty = 10;
          //   var y = i % c * h + ty;
          //   var x = Math.floor(i / c) * w + tx;
          //   return "translate(" + x + "," + y + ")";
          // }

          // svg.select(".legendOrdinal")
          //   .attr("font-family", "sans-serif")
          //   .attr("font-size", `${plot_height / metaColors.length}px`)
          //   .append("g")
          //   .selectAll("g")
          //   .data(items)
          //   .join("g")
          //   .append("text")
          //   // .attr("transform", (d, i) => `translate(0,${i * 16})`)
          //   .attr("transform", text_position)
          //   .text(d => d[0])


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
          
          // // Quantile scale (weird?)
          // let color_range = linspace(0, 1, 11)
          // var color = d3.scaleQuantile()
          //   .domain(bins.map(bin => d3.mean(bin, d => d[fieldName])))
          //   .range(color_range.map(d => d3.interpolateBuPu(d)))


          // Sequential scale (works)
          var extent = d3.extent(bins, bin => d3.mean(bin, d => d[fieldName]))
          var color = null
          var format = null
          if (extent[0] < 0 && extent[1] > 0) {
            color = d3.scaleDiverging()
              .domain([extent[0], 0, extent[1]])
              // .interpolator(d3.interpolatePiYG)
              .interpolator(d3.interpolateRdYlBu)
          } else {
            color = d3.scaleSequential(d3.interpolateBuPu)
              .domain([extent[0], extent[1]])
          }
          var color_range = linspace(extent[0], extent[1], 10)

          bins.forEach(function(bin) {
            context.translate(bin.x, bin.y)
            context.fillStyle = color(d3.mean(bin, d => d[fieldName]))
            context.fill(hex)
            context.setTransform(1, 0, 0, 1, 0, 0)
          });

          // svg.append("text")
          //   .attr("x", plot_width / canvas_scale + legend_margin.left)
          //   .attr("y", legend_margin.top)
          //   .attr("font-family", "sans-serif")
          //   .attr("font-size", "14px")
          //   .attr("font-weight", "bold")
          //   .text(metaInfo.label)

          vertical_legend({
            svg: svg,
            color: color,
            title: metaInfo.label,
            offsetLeft: plot_width / canvas_scale + legend_margin.left,
            offsetTop: legend_margin.top
          })

          //var legend = svg.selectAll("g.legend_colorbar")
          //  // .data(color.range().reverse())
          //  .data(color_range)
          //  .enter()
          //  .append("g")
          //  .attr("class", "legend_colorbar")
          ////
          //let legend_rect_height = (
          //  plot_height / canvas_scale - legend_margin.top - legend_margin.bottom
          //) / (color_range.length + 2)
          ////
          //legend
          //  .append('rect')
          //  .attr("x", plot_width / canvas_scale + legend_margin.left)
          //  .attr("y", function(d, i) {
          //    return legend_margin.top + (color_range.length - i - 0.5) * legend_rect_height
          //  })
          // .attr("width", 15)
          // .attr("height", legend_rect_height)
          // .style("fill", d => color(d))
          ////
          //legend
          //  .append('text')
          //  .attr("x", plot_width / canvas_scale + legend_margin.left + 20)
          //  .attr("y", function(d, i) {
          //    return legend_margin.top + (color_range.length - i) * legend_rect_height
          //  })
          //  .attr("alignment-baseline", "middle")
          //  .style("font-size", "14px")
          //  .text(d => d3.format(",.2r")(d))

        }

        // cluster labels

        let clusterLabels = d3.nest()
          .key(d => d.cluster)
          .rollup(v => [d3.mean(v, d => d.x), d3.mean(v, d => d.y)])
          .entries(g_mydata)

        let cluster_label_size = "0.75em"

        svg.selectAll("g.cluster_label")
          .data(clusterLabels)
          .enter()
          .append("g")
          .append("text")
          .attr("class","cluster_label")
          .attr("x", d => x(d.value[0]) / canvas_scale)
          .attr("y", d => y(d.value[1]) / canvas_scale)
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
          .attr("x", d => x(d.value[0]) / canvas_scale)
          .attr("y", d => y(d.value[1]) / canvas_scale)
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
            g_mydata[i][fieldName] = metaInfo.valCounts[metaArr[i]][0]
          }
        } else if (metaInfo.origVals){
          for (var i = 0; i < metaInfo.origVals.length; i++) {
            g_mydata[i][fieldName] = metaInfo.origVals[i]
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

    function draw_gene_bars(geneSym, gene_groupby) {

      var metaInfo = null

      if (gene_groupby !== "none") {
        metaInfo = db.findMetaInfo(gene_groupby)
        if (metaInfo.type != "enum" || metaInfo.valCounts.length > pals.okabe.length) {
          return
        }
      } else {
        return draw_gene_bars_none(geneSym)
      }

      let groupKey = db.conf.clusterField
      let groups = get_groups(groupKey)
      let group_names = groups.map(d => d[0])

      let subgroupKey = metaInfo.name
      let subgroupLevels = metaInfo.valCounts.map(d => d[0]).slice().sort()

      var data = []
      var x_min = Infinity
      var x_max = -Infinity
      for (var i = 0; i < groups.length; i++) {
        var res = {
          "cluster": groups[i][0]
        }
        var counts = Array.from(d3.rollup(
          g_mydata.filter(d => d.cluster == groups[i][0]),
          v => v.filter(d => d.gene > 0).length / v.length, d => d[subgroupKey]
        ))
        for (var j = 0; j < counts.length; j++) {
          let val = counts[j][1]
          res[counts[j][0]] = val
          x_min = val < x_min ? val : x_min
          x_max = val > x_max ? val : x_max
        }
        data.push(res)
      }

      var el = $("#gene-bars")
      el.html("")
      const height = Math.min(10 * groups.length * subgroupLevels.length, el.outerHeight())
      let width = el.outerWidth() * 0.85
      const longest_group_key = d3.greatest(
        group_names, (a, b) => d3.ascending(a.length, b.length)
      )
      let margin = {
        top: 15, right: 15, bottom: 20,
        left: getTextWidth(longest_group_key, "15px arial") + 9
      }

      let y0 = d3.scaleBand()
        .domain(data.map(d => d[groupKey]))
        // .rangeRound([margin.top, height - margin.bottom])
        .range([margin.top + 2, height - margin.bottom - 2])
        .paddingInner(0.1)
        .paddingOuter(0.0)

      let y1 = d3.scaleBand()
        .domain(subgroupLevels)
        .rangeRound([0, y0.bandwidth()])
        .padding(0.05)

      let x = d3.scaleLinear()
        // .domain([0, d3.max(data, d => d3.max(subgroupLevels, key => d[key]))]).nice()
        .domain([0, 1]).nice()
        .rangeRound([margin.left + 5, width - margin.right - 5])

      let color_range = subgroupLevels.length <= 8 ? pals.okabe : pals.mpn65
      let color = d3.scaleOrdinal()
        .domain(subgroupLevels)
        .range(color_range)

      let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).ticks(1, "~p"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
        // .call(
        //   g => g.select(".tick:last-of-type text").clone()
        //     .attr("x", 15)
        //     .attr("text-anchor", "start")
        //     // .attr("font-weight", "bold")
        //     .attr("font-size", "14px")
        //     .text("cells")
        // )

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
          .data(color.domain())
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

      const svg = d3.select("#gene-bars").append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", '0px')
        .style("left", '0px');

      // background stripes
      const bg = svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
      bg.append("rect")
        .attr("fill", (d, i) => i % 2 == 0 ? "#ffffff00" : "#eee")
        .attr("x", d => x(0) - 4)
        .attr("y", d => y0(d[groupKey]) - y1.bandwidth() / 8)
        .attr("height", y0.bandwidth() + y1.bandwidth() / 4)
        .attr("width", d => x(1) - x(0) + 8)

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
          .attr("fill", d => color(d.key))
          .attr("stroke", "#000000")
          .attr("stroke-width", "0.5")

      svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        // .attr("font-style", "italic")
        // .html(`Cells with <tspan font-style="italic">${geneSym}</tspan>`)
        .html(`Cells`)

      svg.append("g")
          .call(xAxis);

      svg.append("g")
          .call(yAxis);

      // svg.append("g")
      //     .call(legend);
    }

    function draw_gene_bars_none(geneSym) {

      let groupKey = db.conf.clusterField
      let groups = get_groups(groupKey)
      let group_names = groups.map(d => d[0])

      var data = []
      var x_min = Infinity
      var x_max = -Infinity
      for (var i = 0; i < groups.length; i++) {
        let items = g_mydata.filter(d => d.cluster == groups[i][0])
        let val = items.filter(d => d.gene > 0).length / items.length
        x_min = val < x_min ? val : x_min
        x_max = val > x_max ? val : x_max
        let datum = {}
        datum[groupKey] = groups[i][0]
        datum.value = val
        data.push(datum)
      }

      var el = $("#gene-bars")
      el.html("")
      const height = Math.max(16 * groups.length, el.outerHeight())
      let width = el.outerWidth() * 0.85
      const longest_group_key = d3.greatest(
        group_names, (a, b) => d3.ascending(a.length, b.length)
      )
      let margin = {
        top: 15, right: 15, bottom: 20,
        left: getTextWidth(longest_group_key, "15px arial") + 9
      }

      let y0 = d3.scaleBand()
        .domain(data.map(d => d[groupKey]))
        // .rangeRound([margin.top, height - margin.bottom])
        .range([margin.top + 2, height - margin.bottom - 2])
        .paddingInner(0.1)
        .paddingOuter(0.0)

      let x = d3.scaleLinear()
        .domain([0, 1]).nice()
        .rangeRound([margin.left + 5, width - margin.right - 5])

      let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).ticks(1, "~p"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))

      let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y0).ticks(null, "s"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))

      const svg = d3.select("#gene-bars").append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", '0px')
        .style("left", '0px');

      // background stripes
      const bg = svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
      bg.append("rect")
        .attr("fill", (d, i) => i % 2 == 0 ? "#ffffff00" : "#eee")
        .attr("x", d => x(0) - 4)
        .attr("y", d => y0(d[groupKey]))
        .attr("height", y0.bandwidth())
        .attr("width", d => x(1) - x(0) + 8)

      let panelBorder = svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", width - margin.left - margin.right)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");

      // bars
      let color_range = data.length <= 8 ? pals.okabe : pals.mpn65
      let color = d3.scaleOrdinal()
        .domain(data.map(d => d[groupKey]))
        .range(color_range)
      //
      svg.append("g")
        .selectAll("g")
        .data(data)
        .join("rect")
          .attr("x", d => x(0))
          .attr("y", d => y0(d[groupKey]))
          .attr("height", y0.bandwidth())
          .attr("width", d => x(d.value) - x(0))
          // .attr("fill", d => pals.okabe[0])
          .attr("fill", d => color(d[groupKey]))
          .attr("stroke", "#000000")
          .attr("stroke-width", "0.5")

      svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        // .attr("font-style", "italic")
        // .html(`Cells with <tspan font-style="italic">${geneSym}</tspan>`)
        .html(`Cells`)

      svg.append("g")
          .call(xAxis);

      svg.append("g")
          .call(yAxis);

      // svg.append("g")
      //     .call(legend);
    }

    function drawBars(metaInfo) {

        if (metaInfo.type != "enum" || metaInfo.valCounts.length > pals.okabe.length) {
          return
        }

        let groupKey = db.conf.clusterField
        let groups = get_groups(groupKey)

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
            g_mydata.filter(d => d.cluster == groups[i][0]),
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

        let color_range = subgroupLevels.length <= 8 ? pals.okabe : pals.mpn65
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

      let data = g_mydata

      let canvas_scale = 2
      let radius = 1
      let legend_width = 180
      let plot_width = 360 * canvas_scale
      let plot_height = 360 * canvas_scale
      let legend_margin = {
        top: 65, right: 0, bottom: 0, left: 10
      }
      let margin = {
        top: 45, right: 10, bottom: 10, left: 10
      }

      d3.select("#gene-loading-spinner").remove()
      d3.select("#mydiv-gene-plot").remove()
      const container = d3.select("#mydiv-gene").append("div")
        .attr("id", "mydiv-gene-plot")
        .style("position", "relative")
        .style("display", "inline-block")

      const canvas = container.append('canvas')
        .attr("id", "mycanvas-gene-plot")
        .node()
      canvas.width = plot_width + legend_width * canvas_scale
      canvas.height = plot_height

      // var canvas = document.createElement('canvas')
      // canvas.id     = "mycanvas-gene-plot"
      // canvas.width  = plot_width * 2 + legend_width
      // canvas.height = plot_height * 2
      // canvas.style.width = plot_width
      // document.getElementById("mydiv-gene-plot").appendChild(canvas)

      const context = canvas.getContext('2d')

      const svg = container.append('svg')
        .attr("width", canvas.width / canvas_scale)
        .attr("height", canvas.height / canvas_scale)
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

      var n_cells = data.filter(d => d.gene > 0).length
      svg.append("text")
        .attr("x", margin.left / 2)
        .attr("y", plot_height / canvas_scale - margin.bottom / 2)
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .text(`${d3.format(",")(n_cells)} (${d3.format(".1%")(n_cells / data.length)}) cells`)

      let panelBorder = svg.append("rect")
        .attr("x", margin.left - 10)
        .attr("y", margin.top - 10)
        .attr("width", plot_width / canvas_scale)
        .attr("height", plot_height / canvas_scale - margin.top + margin.bottom)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");

      var x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([margin.left, plot_width - margin.right])

      var y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .rangeRound([plot_height - margin.bottom, margin.top])

      var hexbin = d3.hexbin()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .radius(radius * (plot_width - legend_width) / (plot_height))
        .extent([
          [margin.left, margin.top],
          [plot_width - margin.right, plot_height - margin.bottom]
        ])

      var bins = hexbin(data)

      // Number of points in the bin (works)
      // var color = d3.scaleSequential(d3.interpolateBuPu)
      //   .domain([0, d3.max(bins, bin => bin.length) / 2])
      
      // Sequential scale (works)
      var bin_max = d3.max(bins, bin => d3.mean(bin, d => d.gene))
      var color = d3.scaleSequential(d3.interpolateBuPu)
        .domain([0, bin_max])
      // var color_range = linspace(color.domain()[0], color.domain()[1], 10)
      var color_range = linspace(0, bin_max, 10)

      // // Sequential scale (works)
      // const color_range_max = d3.max(bins, bin => d3.mean(bin, d => d.gene))
      // let color_range = linspace(0, color_range_max, 10)
      // // let color_range = linspace(0, 1, 10)
      // var color = d3.scaleLinear()
      //   .domain([0, d3.max(bins, bin => d3.mean(bin, d => d.gene))])
      //   .range(color_range.map(d => d3.interpolateBuPu(d)))

//      // Quantile scale (works)
//      //var color_range = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
//      let color_range = linspace(0, 1, 10)
//      // g_bins = bins
//      // Need to filter out the zeros because genes are sparse
//      let my_domain = bins
//        .map(bin => d3.mean(bin, d => d.gene))
//        .filter(d => d > 0)
//      var color = d3.scaleQuantile()
//        .domain(my_domain)
//        .range(color_range.map(d => d3.interpolateBuPu(d)))

      context.fillStyle = "#fff";

      // context.strokeStyle = "black";
      // context.strokeRect(0, margin.top - 10, plot_width, plot_height - margin.top + margin.bottom);

      var hex = new Path2D(hexbin.hexagon());

      bins.forEach(function(bin){
        context.translate(bin.x, bin.y);
        //context.fillStyle = color(bin.length);
        context.fillStyle = color(d3.mean(bin, d => d.gene))
        context.fill(hex)
        context.strokeStyle = context.fillStyle
        context.lineWidth = 0
        context.stroke(hex)
        context.setTransform(1, 0, 0, 1, 0, 0)
      });

      svg.append("text")
        .attr("x", plot_width / canvas_scale + legend_margin.left)
        .attr("y", legend_margin.top - 20)
        .attr("font-family", "sans-serif")
        .attr("font-size", "1em")
        .attr("font-weight", "bold")
        .text("log2CP10K")

      var legend = svg.selectAll("g.legend_colorbar")
        // .data(color.range().reverse())
        .data(color_range.reverse())
        .enter()
        .append("g")
        .attr("class","legend_colorbar");

      let legend_rect_height = 25

      legend
        .append('rect')
        .attr("x", plot_width / canvas_scale + legend_margin.left)
        .attr("y", function(d, i) {
           return legend_margin.top + i * legend_rect_height;
        })
       .attr("width", 15)
       .attr("height", legend_rect_height)
       // .style("stroke", "black")
       // .style("stroke-width", 0.1)
       .style("fill", function(d){return color(d);});

      legend
        .append('text')
        .attr("x", plot_width / canvas_scale + legend_margin.left + 20)
        .attr("y", function(d, i) {
         return legend_margin.top + i * legend_rect_height;
        })
        .attr("alignment-baseline", "middle")
        .style("font-size", "14px")
        .text(function(d, i) {
          var format = d3.format(".1f");
          return `${format(+color_range[i])}`
        })
    }

    function drawGene4(geneSym, gene_groupby) {
      //
      let data = g_mydata
      var aggKey = g_donorField
      var metaInfo = null
      var subgroupKey = null
      var subgroupLevels = []
      var subgroupCounts = {}
      if (gene_groupby !== "none") {
        metaInfo = db.findMetaInfo(gene_groupby)
        if (metaInfo.type === "enum" || metaInfo.valCounts.length < 5) {
          subgroupKey = metaInfo.name
          subgroupLevels = metaInfo.valCounts.map(d => d[0]).slice().sort()
          subgroupCounts = Object.fromEntries(d3.rollup(
            data, v => [...new Set(v.map(d => d[aggKey]))].length, d => d[subgroupKey]
          ))
        }
      }
      //
      let canvas_scale = 2
      let radius = 1
      let legend_width = 90
      let plot_width = 360 * canvas_scale
      let plot_height = 360 * canvas_scale
      //
      let legend_margin = {
        top: 65, right: 0, bottom: 0, left: 5
      }
      let margin = {
        top: 65, right: 10, bottom: 10, left: 10
      }
      //
      d3.select("#gene-loading-spinner").remove()
      d3.select("#mydiv-gene")
        .html("")
        .append("div")
        .attr("class", "row")
        .attr("id", "gene-row")
      //
      const plot_total = subgroupKey ? subgroupLevels.length : 1
      if (plot_total === 1) {
        margin.top = 45
      }
      var plot_col_width = 12
      var font_size = 14
      if (plot_total > 1) {
        plot_col_width = 6
        font_size = 18
      }
      //
      var x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([margin.left * canvas_scale, plot_width - margin.right * canvas_scale])
      var y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([plot_height - margin.bottom * canvas_scale, margin.top * canvas_scale])
      var hexbin = d3.hexbin()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .radius(radius * (plot_width - legend_width * canvas_scale) / (plot_height))
        .extent([
          [margin.left, margin.top],
          [plot_width - margin.right, plot_height - margin.bottom]
        ])
      var bins = hexbin(data)
      // Sequential scale (works)
      var bin_max = d3.max(bins, bin => d3.mean(bin, d => d.gene))
      // var color = d3.scaleSequential(d3.interpolateBuPu)
      //   .domain([0, bin_max])
      var color = d3.scaleLinear()
        .domain(linspace(0, bin_max, 100))
        .range(pals.batlow)
      var color_range = linspace(0, bin_max, 10).reverse()
      var hex = new Path2D(hexbin.hexagon())
      //
      for (var plot_i = 0; plot_i < plot_total; plot_i++) {
        //
        const div_id =`mydiv-gene-plot-${plot_i}`
        const container = d3.select("#gene-row")
          .append("div")
          .attr("class", `col-${plot_col_width}`)
          .attr("id", div_id)
          .style("position", "relative")
          .style("display", "inline-block")
        //
        const canvas_id = `mycanvas-gene-plot-${plot_i}`
        d3.select(canvas_id).remove()
        const canvas = container.append('canvas')
          .attr("id", canvas_id)
          .node()
        canvas.width = plot_width + legend_width * canvas_scale
        canvas.height = plot_height
        d3.select(`#${canvas_id}`).style("width", "100%")

        const context = canvas.getContext('2d')
        context.fillStyle = "#fff"

        const svg = container.append('svg')
          .attr("viewBox",
            `0 0 ${canvas.width / canvas_scale} ${canvas.height / canvas_scale}`
          )
          .style("position", "absolute")
          // .style("top", '0px')
          // .style("left", '0px')
          .style("top", $(`#${div_id}`).css("padding-top"))
          .style("left", $(`#${div_id}`).css("padding-left"))

        if (plot_i === 0 && plot_total > 1) {
          svg.append("text")
            .attr("x", margin.left)
            .attr("y", margin.top - 35)
            .attr("font-family", "sans-serif")
            .attr("font-size", `${font_size * 1.4}px`)
            .attr("font-style", "italic")
            .text(geneSym)
        } else if (plot_i === 0 && plot_total === 1) {
          svg.append("text")
            .attr("x", margin.left)
            .attr("y", margin.top - 15)
            .attr("font-family", "sans-serif")
            .attr("font-size", `${font_size * 1.4}px`)
            .attr("font-style", "italic")
            .text(geneSym)
        }
        
        // Count the cells per subgroup
        if (plot_total === 1) {
          var n_cells = data.filter(d => d.gene > 0).length
          var total_cells = data.length
        } else {
          var n_cells = data
            .filter(
              d => d.gene > 0 && d[subgroupKey] == subgroupLevels[plot_i]
            ).length
          var total_cells = data
            .filter(d => d[subgroupKey] == subgroupLevels[plot_i])
            .length
        }

        if (plot_total > 1) {
          // var subgroup_n = subgroupCounts[subgroupLevels[plot_i]]
          svg.append("text")
            .attr("x", (plot_width / canvas_scale) / 2)
            .attr("y", margin.top - 15)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", `${font_size}px`)
            .text(`${subgroupLevels[plot_i]} (n = ${d3.format(",")(total_cells)})`)
        }

        svg.append("text")
          .attr("x", margin.left / 2)
          .attr("y", plot_height / canvas_scale - margin.bottom / 2)
          .attr("font-family", "sans-serif")
          .attr("font-size", `${font_size}px`)
          .text(`${d3.format(",")(n_cells)} (${d3.format(".1%")(n_cells / total_cells)}) cells`)

        let panelBorder = svg.append("rect")
          .attr("x", margin.left - 10)
          .attr("y", margin.top - 10)
          .attr("width", plot_width / canvas_scale)
          .attr("height", plot_height / canvas_scale - margin.top + margin.bottom)
          .style("stroke", "black")
          .style("fill", "none")
          .style("stroke-width", "1px");

        bins.forEach(function(bin) {
          var color_val = 0
          if (plot_total > 1) {
            color_val = d3.mean(
              bin.filter(d => d[subgroupKey] == subgroupLevels[plot_i]),
              d => d.gene
            )
          } else {
            color_val = d3.mean(bin, d => d.gene)
          }
          context.translate(bin.x, bin.y);
          //context.fillStyle = color(bin.length);
          context.fillStyle = color(color_val)
          context.fill(hex)
          context.strokeStyle = context.fillStyle
          context.lineWidth = 0
          context.stroke(hex)
          context.setTransform(1, 0, 0, 1, 0, 0)
        })

        if (plot_total === 1 || plot_i === plot_total - 1) {
          svg.append("text")
            .attr("x", plot_width / canvas_scale + legend_margin.left)
            .attr("y", legend_margin.top - 20)
            .attr("font-family", "sans-serif")
            .attr("font-size", `${font_size}px`)
            .attr("font-weight", "bold")
            .text("log2CPM")
          var legend = svg.selectAll("g.legend_colorbar")
            .data(color_range)
            .enter()
            .append("g")
            .attr("class","legend_colorbar");
          let legend_rect_height = 25
          legend
            .append('rect')
            .attr("x", plot_width / canvas_scale + legend_margin.left)
            .attr("y", function(d, i) {
               return legend_margin.top + i * legend_rect_height;
            })
           .attr("width", 15)
           .attr("height", legend_rect_height)
           .style("fill", function(d){return color(d);});
          legend
            .append('text')
            .attr("x", plot_width / canvas_scale + legend_margin.left + 20)
            .attr("y", function(d, i) {
             return legend_margin.top + i * legend_rect_height;
            })
            .attr("alignment-baseline", "middle")
            .style("font-size", `${font_size}px`)
            .text(function(d, i) {
              var format = d3.format(".1f");
              return `${format(+color_range[i])}`
            })
        }
      } // for plot_i
    }

    function draw_meta_boxplot(fieldName, meta_groupby) {
      if (meta_groupby === "none") {
        return draw_meta_boxplot_none()
      }
      //
      let data = g_mydata
      const groupKey = db.conf.clusterField
      const fillKey = meta_groupby // TBStatus, case/control, etc.
      const aggKey = g_donorField
      // const agg_counts = Object.fromEntries(
      //   db.conf.metaFields.filter(d => d.name == aggKey)[0].valCounts
      // )
      const agg_counts = Object.fromEntries(get_groups(aggKey))
      let metaInfo = db.findMetaInfo(fillKey)
      let subgroupLevels = metaInfo.valCounts.map(d => d[0]).slice().sort()
      let subgroupCounts = Object.fromEntries(d3.rollup(
        data, v => [...new Set(v.map(d => d[aggKey]))].length, d => d[fillKey]
      ))
      var make_bin = function(d) {
        // percent of each donor's cells in each cluster
        const values = Array.from(d3.rollup(
          d, v => v.length, d => d[aggKey]
        )).map(d => d[1] / agg_counts[d[0]])
          .sort((a, b) => a - b)
        const min = values[0]
        const max = values[values.length - 1]
        const q1 = d3.quantile(values, 0.25)
        const q2 = d3.quantile(values, 0.5)
        const q3 = d3.quantile(values, 0.75)
        const iqr = q3 - q1
        let bin = {
          min: min,
          max: max,
          q1: q1,
          q2: q2,
          q3: q3,
          iqr: q3 - q1,
          r0: Math.max(min, q1 - iqr * 1.5),
          r1: Math.min(max, q3 + iqr * 1.5)
        }
        bin.outliers = values.filter(v => v < bin.r0 || v > bin.r1)
        return bin 
      }
      //
      let bins = []
      Array.from(d3.group(data, d => d[groupKey])).map(d => {
        const m = d3.group(d[1], v => v[fillKey])
        for (const [k, v] of m.entries()) {
          var bin = {}
          bin[groupKey] = d[0]
          bin[fillKey] = k
          bin["bin"] = make_bin(v)
          bins.push(bin)
        }
      })
      bins = bins //.sort((a,b) => a[groupKey].localeCompare(b[groupKey]))
      //
      let groups = get_groups(groupKey)
      let group_names = groups.map(d => d[0])
      var el = $("#meta-boxplot")
      el.html("")
      const longest_group_key = d3.greatest(
        group_names, (a, b) => d3.ascending(a.length, b.length)
      )
      const margin = {
        top: 15, right: 165, bottom: 20,
        left: getTextWidth(longest_group_key, "15px arial") + 9
      }
      const width = el.outerWidth()
      const height = Math.max(16 * groups.length, el.outerHeight())
      d3.select("#meta-row").style("height", `${height + margin.top + margin.bottom}px`)
      //
      const svg = d3.select("#meta-boxplot").append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", '0px')
        .style("left", '0px');
      //
      var y0 = d3.scaleBand()
        .domain(group_names)
        // .domain(bins.map(d => d[groupKey]))
        // .rangeRound([margin.top, height - margin.bottom])
        .range([margin.top + 2, height - margin.bottom - 2])
        .paddingInner(0.1)
        .paddingOuter(0.0)
      //
      var y1 = d3.scaleBand()
        .domain(subgroupLevels)
        .rangeRound([0, y0.bandwidth()])
        .padding(0.05)
      //
      var x = d3.scaleLog()
      // var x = d3.scaleLinear()
        .domain([d3.min(bins, d => d.bin.min), d3.max(bins, d => d.bin.max)]).nice()
        .rangeRound([margin.left + 5, width - margin.right - 5])
      //
      var xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        // .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5, "~d"))
        .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5, "~p"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
        // .call(d3.axisBottom(x).ticks(10, [5, "~g"]))
        // .call(d3.axisBottom(x).ticks(10, [5, "~d"]))
        // .call(g => g.select(".tick:last-of-type text").clone()
        //     .attr("x", 15)
        //     .attr("y", -5)
        //     .attr("text-anchor", "start")
        //     .attr("font-weight", "bold")
        //     .attr("font-size", 14)
        //     .text("Percent"))
      //
      var yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y0).ticks(null, "s"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
        .call(g => g.selectAll(".tick text") .text(d => d))
      //
      let color_range = subgroupLevels.length <= 8 ? pals.okabe : pals.mpn65
      let color = d3.scaleOrdinal()
        .domain(subgroupLevels)
        .range(color_range)
      // background stripes
      const bg = svg.append("g")
        .selectAll("g")
        .data(groups)
        .join("g")
      bg.append("rect")
        .attr("fill", (d, i) => i % 2 == 0 ? "#ffffff00" : "#eee")
        .attr("x", margin.left)
        .attr("y", d => y0(d[0]) - y1.bandwidth() / 8)
        .attr("height", y0.bandwidth() + y1.bandwidth() / 4)
        .attr("width", width - margin.left - margin.right)
      // vertical lines
      const vLines = svg.append("g")
        .selectAll("g")
        .data([0.001, 0.01, 0.1])
        .join("g")
      vLines.append("path")
        .attr("stroke", "#ddd")
        .attr("stroke-width", "1px")
        .attr("d", d => `M${x(d)},${margin.top} V${height - margin.bottom}`);
      // let vLines = svg.append("g")
      //   .style("stroke", "#000")
      //   .style("stroke-width", "0.5px")
      //   .append("path")
      //   .attr("d", `M${x(0.1)},${margin.top} V${height - margin.bottom}`)
      //
      const g = svg.append("g")
        .selectAll("g")
        .data(bins)
        .join("g")
      // range lines
      g.append("path")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth()})`
          )
          .attr("stroke", "currentColor")
          .attr("stroke-width", "0.5")
          .attr("d", d => `
            M${x(d.bin.r0)},${-y1.bandwidth() / 2}
            H${x(d.bin.r1)}
          `)
      g.append("g")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth() / 2})`
          )
        .selectAll("circle")
        .data(d => d.bin.outliers)
        .join("circle")
          .attr("cx", d => x(d))
          .attr("r", 1)
      // boxes
      g.append("path")
          .attr("fill", "#333")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth()})`
          )
          .attr("fill", d => color(d[fillKey]))
          .attr("stroke", "#000000")
          .attr("stroke-width", "0.5")
          .attr("d", d => `
            M${x(d.bin.q3)},0
            V${-y1.bandwidth()}
            H${x(d.bin.q1)}
            V${0}
            Z
          `);
      // median lines
      g.append("path")
          .attr("stroke", "currentColor")
          .attr("stroke-width", 2)
          .attr("d", d => `
            M${x(d.bin.q2)},${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth()}
            V${y0(d[groupKey]) + y1(d[fillKey])}
          `)
      //
      var legend = svg => {
        const g = svg
            .attr("transform", `translate(${width},${margin.top})`)
            .attr("text-anchor", "end")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
          .selectAll("g")
          .data(color.domain())
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
            .text(d => `${d} (n = ${subgroupCounts[d]})`);
      }
      //
      let panelBorder = svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", width - margin.left - margin.right)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");
      //
      svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        // .attr("font-style", "italic")
        .html(`Percent of each donor's cells`)
      // draw
      svg.append("g")
          .call(xAxis);
      svg.append("g")
          .call(yAxis);
      svg.append("g")
          .call(legend);
    }

    function get_groups(groupKey) {
      return db.conf.metaFields
        .filter(d => d.name == groupKey)[0]
        .valCounts.slice()
        .sort((a, b) => a[0].localeCompare(b[0], navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true}))
    }

    function draw_meta_heatmap(groupKey, subgroupKey) {
      $("#meta-heatmap").html("")
      //
      let metaInfo = db.findMetaInfo(subgroupKey)
      let subgroupLevels = metaInfo.valCounts.map(d => d[0]).slice().sort()
      //
      const aggKey = g_donorField
      let groups = get_groups(groupKey)
      let group_names = groups.map(d => d[0])
      let data = Array.from(d3.rollup(
        g_mydata,
        v => Object.fromEntries(Array.from(
          d3.rollup(v, v => v.length, d => d[groupKey])
        )),
        d => [ d[aggKey], d[subgroupKey] ].join('\t')
        // d => d[aggKey]
      )).map(d => ({
        name: d[0],
        cells: d[1]
      }))
      var color_domain = []
      for (var i = 0; i < data.length; i++) {
        var cells = []
        for (var j = 0; j < groups.length; j++) {
          var group_name = groups[j][0]
          if (group_name in data[i].cells) {
            var val = data[i].cells[group_name]
            cells.push(val)
            color_domain.push(val)
          } else {
            cells.push(0)
            color_domain.push(0)
          }
        }
        data[i].cells = cells
      }
      var hc = hcluster()
        .distance('euclidean') // support for 'euclidean' and 'angular'
        .linkage('avg')        // support for 'avg', 'max' and 'min'
        .posKey('cells')    // 'position' by default
        .data(data)         // as an array of objects w/ array values for 'position'
      data = hc.orderedNodes()
      //
      var el = $("#meta-heatmap")
      el.html("")
      const legend_margin = {top: 50, right: 10, bottom: 10, left: 10}
      // const width = Math.min(1200, 8 * data.length)
      const width = el.outerWidth()
      const height = Math.max(20 * (groups.length + 2), el.outerHeight())
      const longest_group_key = d3.greatest(
        group_names, (a, b) => d3.ascending(a.length, b.length)
      )
      const margin = {
        top: 50, right: 160, bottom: 50,
        left: getTextWidth(longest_group_key, "15px arial") + 9
      }
      d3.select("#meta-row-2").style("height", `${height + margin.top + margin.bottom}px`)
      const svg = d3.select("#meta-heatmap").append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", '0px')
        .style("left", '0px');
      // cluster
      var y = d3.scaleBand()
        .domain(groups.map(d => d[0]))
        .range([margin.top + 2, height - margin.bottom - 2])
        .paddingInner(0.05)
        // .paddingOuter(0.0)
      // donor
      var x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.left + 2, width - margin.right - 2])
      //
      var xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(null, "s"))
        .call(g => g.select(".domain").remove())
        .call(
          g => g.selectAll(".tick text")
            .attr("font-size", "14px")
            .attr("transform", "rotate(-45) translate(-7,-8)")
            .attr("text-anchor", "end")
            .text(d => d.split('\t')[0])
        )
      //
      var yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
      //
      let color_range = linspace(0, 1, 11)
      var color = d3.scaleQuantile()
        .domain(color_domain)
        .range(color_range.map(t => d3.interpolatePuBuGn(t)))
      //
      let color_range_subgroup = subgroupLevels.length <= 8 ? pals.okabe : pals.mpn65
      let color_subgroup = d3.scaleOrdinal()
        .domain(subgroupLevels)
        .range(color_range_subgroup)
      const g = svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
          .attr("transform", (d, i) => `translate(${x(d.name)},0)`)
        .selectAll("rect")
        .data(d => d.cells)
        .join("rect")
          .attr("x", 0)
          .attr("y", (d, i) => y(group_names[i]))
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .attr("fill", d => color(d))
      // subgroup bar
      svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
          .attr("transform", (d, i) => `translate(${x(d.name)},0)`)
          .attr("x", 0)
          .attr("y", margin.top - y.bandwidth() + 1)
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth() - 3)
          .attr("fill", d => color_subgroup(d.name.split('\t')[1]))
      //
      svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top - y.bandwidth() - 1)
        .attr("height", y.bandwidth() + 1)
        .attr("width", width - margin.left - margin.right)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");
      //
      let panelBorder = svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", width - margin.left - margin.right)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");
      //
      svg.append("text")
        .attr("x", width - margin.right + legend_margin.left)
        .attr("y", margin.top - y.bandwidth() / 2)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        // .attr("alignment-baseline", "after-edge")
        .attr("alignment-baseline", "middle")
        .html(subgroupKey)
      //
      let n_agg = [...new Set(data.map(d => d.name.split('\t')[0]))].length
      svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top - y.bandwidth() - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        // .attr("font-style", "italic")
        .html(`Number of cells in each ${groupKey}, per ${aggKey} (n = ${n_agg})`)
      // draw
      if (data.length < 50) {
        svg.append("g")
            .call(xAxis)
      }
      svg.append("g")
          .call(yAxis)
      // legend
      // svg.append("text")
      //   .attr("x", width - margin.right + legend_margin.left)
      //   .attr("y", legend_margin.top)
      //   .attr("font-family", "sans-serif")
      //   .attr("font-size", "14px")
      //   .attr("font-weight", "bold")
      //   .text("Cells")
      var legend = svg.selectAll("g.legend_colorbar")
        .data(color.range().reverse())
        .enter()
        .append("g")
        .attr("class","legend_colorbar")
        .attr("transform",
          `translate(${width - margin.right + legend_margin.left},${legend_margin.top})`
        )
      const legend_rect = {width: x.bandwidth() / 1.5, height: y.bandwidth()}
      legend
        .append('rect')
        .attr("y", (d, i) => (i + 1) * legend_rect.height)
        .attr("width", legend_rect.width)
        .attr("height", legend_rect.height)
        // .style("stroke", "black")
        // .style("stroke-width", 0.1)
        .style("fill", d => d)
      legend
        .append('text')
        .attr("x", legend_rect.width + 2)
        .attr("y", (d, i) => (i + 1) * legend_rect.height)
        .attr("alignment-baseline", "middle")
        .style("font-size", "14px")
        .text(function(d, i) {
          var extent = color.invertExtent(d)
          // var format = d3.format(".2")
          return `${d3.format("d")(+extent[1])}`
        })
      legend
        .append("text")
        .attr("x", legend_rect.width + 2)
        .attr("y", (d, i) => (i + 2) * legend_rect.height)
        .attr("alignment-baseline", "middle")
        .style("font-size","14px")
        .text(function(d, i) {
          if (i == color_range.length - 1) {
            var extent = color.invertExtent(d)
            return `${d3.format("d")(+extent[0])}`
          }
        })
    }

    function draw_gene_boxplot(geneSym, gene_groupby) {
      if (gene_groupby === "none") {
        return draw_gene_boxplot_none(geneSym)
      }
      //
      let data = g_mydata
      const groupKey = db.conf.clusterField
      const fillKey = gene_groupby
      const aggKey = g_donorField
      let metaInfo = db.findMetaInfo(fillKey)
      let subgroupLevels = metaInfo.valCounts.map(d => d[0]).slice().sort()
      let subgroupCounts = Object.fromEntries(d3.rollup(
        data, v => [...new Set(v.map(d => d[aggKey]))].length, d => d[fillKey]
      ))
      var make_bin = function(d) {
        // d.sort((a, b) => a.gene - b.gene)
        // const values = d.map(d => d.gene).filter(x => x > 0).sort()
        // mean by donor
        var values = Object.values(Object.fromEntries(d3.rollup(
          d, v => d3.mean(v.map(v => v.gene)), d => d[aggKey]
        ))).sort((a,b) => a - b)
        if (values.length > 5) {
          const min = values[0]
          const max = values[values.length - 1]
          const q1 = d3.quantile(values, 0.25)
          const q2 = d3.quantile(values, 0.5)
          const q3 = d3.quantile(values, 0.75)
          const iqr = q3 - q1
          let bin = {
            min: min,
            max: max,
            q1: q1,
            q2: q2,
            q3: q3,
            iqr: q3 - q1,
            r0: Math.max(min, q1 - iqr * 1.5),
            r1: Math.min(max, q3 + iqr * 1.5)
          }
          bin["outliers"] = values.filter(v => v < bin.r0 || v > bin.r1)
          return bin 
        }
        return {
          min: 0,
          max: 0,
          q1: 0,
          q2: 0,
          q3: 0,
          iqr: 0,
          r0: 0,
          r1: 0,
          outliers: []
        }
      }
      //
      let bins = []
      Array.from(d3.group(data, d => d[groupKey])).map(d => {
        const m = d3.group(d[1], v => v[fillKey])
        for (const [k, v] of m.entries()) {
          var bin = {}
          bin[groupKey] = d[0]
          bin[fillKey] = k
          bin["bin"] = make_bin(v)
          bins.push(bin)
        }
      })
      // bins = bins.sort((a,b) => a[groupKey].localeCompare(b[groupKey]))
      //
      let groups = get_groups(groupKey)
      let group_names = groups.map(d => d[0])
      //
      var el = $("#gene-boxplot")
      el.html("")
      const width = el.outerWidth() * 1.15
      // const height = Math.max(6 * groups.length * subgroupLevels.length, el.outerHeight())
      const height = Math.min(10 * groups.length * subgroupLevels.length, el.outerHeight())
      const margin = {top: 15, right: 165, bottom: 20, left: 10}
      //
      const svg = d3.select("#gene-boxplot").append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", '0px')
        .style("left", '-45px');
      //
      var y0 = d3.scaleBand()
        .domain(group_names)
        // .domain(bins.map(d => d[groupKey]))
        // .rangeRound([margin.top, height - margin.bottom])
        .range([margin.top + 2, height - margin.bottom - 2])
        .paddingInner(0.1)
        .paddingOuter(0.0)
      //
      // console.log("boxplot")
      // console.log(subgroupLevels)
      var y1 = d3.scaleBand()
        .domain(subgroupLevels)
        .rangeRound([0, y0.bandwidth()])
        .padding(0.05)
      //
      // var x = d3.scaleLog()
      var x = d3.scaleLinear()
        // .domain([d3.min(data, d => d.gene), d3.max(data, d => d.gene)]).nice()
        .domain([d3.min(bins, d => d.bin.min), d3.max(bins, d => d.bin.max)])
        .rangeRound([margin.left + 5, width - margin.right - 5])
      //
      var xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5, "~g"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
      // x-axis label right
      svg.append("text")
        .attr("x", width - margin.right + 5)
        .attr("y", height - margin.bottom)
        .attr("alignment-baseline", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Log2CPM")
      //
      var yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y0).ticks(null, "s"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
      //
      let color_range = subgroupLevels.length <= 8 ? pals.okabe : pals.mpn65
      let color = d3.scaleOrdinal()
        .domain(subgroupLevels)
        .range(color_range)
      // background stripes
      const bg = svg.append("g")
        .selectAll("g")
        .data(groups)
        .join("g")
      bg.append("rect")
        .attr("fill", (d, i) => i % 2 == 0 ? "#ffffff00" : "#eee")
        .attr("x", margin.left)
        .attr("width", width - margin.left - margin.right)
        .attr("y", d => y0(d[0]))
        .attr("height", y0.bandwidth())
      // 
      const g = svg.append("g")
        .selectAll("g")
        .data(bins)
        .join("g")
      // range lines
      g.append("path")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth()})`
          )
          .attr("stroke", "currentColor")
          .attr("stroke-width", "0.5")
          .attr("d", d => `
            M${x(d.bin.r0)},${-y1.bandwidth() / 2}
            H${x(d.bin.r1)}
          `);
      g.append("g")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth() / 2})`
          )
        .selectAll("circle")
        .data(d => d.bin.outliers)
        .join("circle")
          .attr("cx", d => x(d))
          .attr("r", 1)
      // boxes
      g.append("path")
          .attr("fill", "#333")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth()})`
          )
          .attr("fill", d => color(d[fillKey]))
          .attr("stroke", "#000000")
          .attr("stroke-width", "0.5")
          .attr("d", d => `
            M${x(d.bin.q3)},0
            V${-y1.bandwidth()}
            H${x(d.bin.q1)}
            V${0}
            Z
          `);
      // median lines
      g.append("path")
          .attr("stroke", "currentColor")
          .attr("stroke-width", 2)
          .attr("d", d => `
            M${x(d.bin.q2)},${y0(d[groupKey]) + y1(d[fillKey]) + y1.bandwidth()}
            V${y0(d[groupKey]) + y1(d[fillKey])}
          `);
      //
      var legend = svg => {
        const g = svg
            .attr("transform", `translate(${width},${margin.top})`)
            .attr("text-anchor", "end")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
          .selectAll("g")
          .data(color.domain())
          .join("g")
            .attr("transform", (d, i) => `translate(0,${i * 20})`)
        g.append("rect")
            .attr("x", -19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color)
        g.append("text")
            .attr("x", -24)
            .attr("y", 9.5)
            .attr("dy", "0.35em")
            .text(d => `${d} (n = ${subgroupCounts[d]})`);
            // .text(d => d);
      }
      //
      let panelBorder = svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", width - margin.left - margin.right)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");
      //
      svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        // .attr("font-style", "italic")
        .html(`Mean <tspan font-style="italic">${geneSym}</tspan> by ${aggKey}`)
      // draw
      svg.append("g")
          .call(xAxis);
      // svg.append("g")
      //     .call(yAxis);
      svg.append("g")
          .call(legend);
    }

    function draw_gene_boxplot_none(geneSym) {
      let data = g_mydata
      //
      const groupKey = db.conf.clusterField
      const aggKey = g_donorField
      var make_bin = function(d) {
        // d.sort((a, b) => a.gene - b.gene)
        // const values = d.map(d => d.gene)
        //   .filter(x => x > 0)
        //   .sort((a, b) => a - b)
        // mean by donor
        var values = Object.values(Object.fromEntries(d3.rollup(
          d, v => d3.mean(v.map(v => v.gene)), d => d[aggKey]
        ))).sort((a,b) => a - b)
        if (values.length > 5) {
          const min = values[0]
          const max = values[values.length - 1]
          const q1 = d3.quantile(values, 0.25)
          const q2 = d3.quantile(values, 0.5)
          const q3 = d3.quantile(values, 0.75)
          const iqr = q3 - q1
          let bin = {
            min: min,
            max: max,
            q1: q1,
            q2: q2,
            q3: q3,
            iqr: q3 - q1,
            r0: Math.max(min, q1 - iqr * 1.5),
            r1: Math.min(max, q3 + iqr * 1.5)
          }
          bin["outliers"] = values.filter(v => v < bin.r0 || v > bin.r1)
          return bin 
        }
        return {
          min: 0,
          max: 0,
          q1: 0,
          q2: 0,
          q3: 0,
          iqr: 0,
          r0: 0,
          r1: 0,
          outliers: []
        }
      }
      //
      let bins = []
      Array.from(d3.group(data, d => d[groupKey])).map(d => {
        var bin = {}
        bin[groupKey] = d[0]
        bin["bin"] = make_bin(d[1])
        bins.push(bin)
      })
      bins = bins.sort((a, b) => a[groupKey].localeCompare(b[groupKey], navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true}))
      //
      let groups = get_groups(groupKey)
      let group_names = groups.map(d => d[0])
      //
      var el = $("#gene-boxplot")
      el.html("")
      const width = el.outerWidth() * 1.15
      const height = Math.max(16 * groups.length, el.outerHeight())
      const margin = {top: 15, right: 140, bottom: 20, left: 10}
      //
      const svg = d3.select("#gene-boxplot").append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", '0px')
        .style("left", '-45px');
      //
      var y0 = d3.scaleBand()
        .domain(group_names)
        .range([margin.top + 2, height - margin.bottom - 2])
        .paddingInner(0.1)
        .paddingOuter(0.0)
      //
      // var x = d3.scaleLog()
      var x = d3.scaleLinear()
        // .domain([d3.min(data, d => d.gene), d3.max(data, d => d.gene)]).nice()
        .domain([d3.min(bins, d => d.bin.min), d3.max(bins, d => d.bin.max)])
        .rangeRound([margin.left + 5, width - margin.right - 5])
      //
      var xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5, "~g"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
      // x-axis label right
      svg.append("text")
        .attr("x", width - margin.right + 5)
        .attr("y", height - margin.bottom)
        .attr("alignment-baseline", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Log2CPM")
      //
      var yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y0).ticks(null, "s"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", "14px"))
      // background stripes
      const bg = svg.append("g")
        .selectAll("g")
        .data(groups)
        .join("g")
      bg.append("rect")
        .attr("fill", (d, i) => i % 2 == 0 ? "#ffffff00" : "#eee")
        .attr("x", margin.left)
        .attr("width", width - margin.left - margin.right)
        .attr("y", d => y0(d[0]))
        .attr("height", y0.bandwidth())
      // 
      const g = svg.append("g")
        .selectAll("g")
        .data(bins)
        .join("g")
      // range lines
      g.append("path")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey])})`
          )
          .attr("stroke", "currentColor")
          .attr("stroke-width", "0.5")
          .attr("d", d => `
            M${x(d.bin.r0)},${y0.bandwidth() / 2}
            H${x(d.bin.r1)}
          `);
      g.append("g")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey]) + y0.bandwidth() / 2})`
          )
        .selectAll("circle")
        .data(d => d.bin.outliers)
        .join("circle")
          .attr("cx", d => x(d))
          .attr("r", 1)
      // boxes
      let color_range = bins.length <= 8 ? pals.okabe : pals.mpn65
      let color = d3.scaleOrdinal()
        .domain(bins.map(d => d[groupKey]))
        .range(color_range)
      //
      g.append("path")
          .attr("fill", "#333")
          .attr("transform",
            d => `translate(0,${y0(d[groupKey])})`
          )
          // .attr("fill", d => pals.okabe[0])
          .attr("fill", d => color(d[groupKey]))
          .attr("stroke", "#000000")
          .attr("stroke-width", "0.5")
          .attr("d", d => `
            M${x(d.bin.q3)},0
            V${y0.bandwidth()}
            H${x(d.bin.q1)}
            V${0}
            Z
          `);
      // median lines
      g.append("path")
          .attr("stroke", "currentColor")
          .attr("stroke-width", 2)
          .attr("transform",
            d => `translate(0,${y0(d[groupKey])})`
          )
          .attr("d", d => `
            M${x(d.bin.q2)},0
            V${y0.bandwidth()}
          `);
      //
      let panelBorder = svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", width - margin.left - margin.right)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px");
      //
      svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        // .attr("font-style", "italic")
        .html(`Mean <tspan font-style="italic">${geneSym}</tspan> by ${aggKey}`)
      // draw
      svg.append("g")
          .call(xAxis);
      // svg.append("g")
      //     .call(yAxis);
    }

    // Use d3 to draw a binhex plot
    function drawGene2(geneSym) {
      console.log("d3 drawGene()");

      var radius = 2
      var width = 800
      var height = 600
      var margin = ({top: 20, right: 20, bottom: 30, left: 40})

      var x = d3.scaleLinear()
        .domain(d3.extent(g_mydata, d => d.x))
        .range([margin.left, width - margin.right])

      var y = d3.scaleLinear()
        .domain(d3.extent(g_mydata, d => d.y))
        .rangeRound([height - margin.bottom, margin.top])

      hexbin = d3.hexbin()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .radius(radius * width / height)
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])

      bins = hexbin(g_mydata)

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
      //       .text(g_mydata.x))
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
      //       .text(g_mydata.y))
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
      "drawGene": drawGene4,
      "drawMetaHex": drawMetaHex,
      "drawMetaBoxplot": draw_meta_boxplot,
      "drawMetaHeatmap": draw_meta_heatmap,
      "drawBars": drawBars,
      "drawGeneBars": draw_gene_bars,
      "drawGeneBoxplot": draw_gene_boxplot
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

    if (g_donorField in g_mydata[0] && g_healthField in g_mydata[0]) {
      // renderer.drawMetaBoxplot(colorBy, state.gene_groupby)
      renderer.drawMetaBoxplot(colorBy, g_healthField)
      renderer.drawMetaHeatmap(colorBy, g_healthField)
    }

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

    // if (g_mydata === null) {
    //   for (var i = 0; i < coords.length; i += 2) {
    //     g_mydata.push({x: coords[i], y: coords[i + 1]});
    //   }
    // } else {
    //   for (var i = 0; i < n_cells; i++) {
    //     g_mydata[i].x = coords[i * 2];
    //     g_mydata[i].y = coords[i * 2 + 1];
    //   }
    // }

    g_mydata = []
    for (var i = 0; i < coords.length; i += 2) {
      g_mydata.push({ x: coords[i], y: coords[i + 1] });
    }

    function gotMetaArr(metaArr, metaInfo, funcVal) {
      var fieldName = metaInfo.name;
      for (var i = 0; i < metaArr.length; i++) {
        g_mydata[i][fieldName] = metaInfo.valCounts[metaArr[i]][0];
      }
      colorByDefaultField()
    }

    // Set the title of the page
    setTitle(db.conf.shortLabel)

    var metaInfo = db.findMetaInfo(db.conf.clusterField)
    db.loadMetaVec(metaInfo, gotMetaArr, onProgressConsole)
    
    var meta_fields = db.conf.metaFields
      .filter(
        d => d.type == "enum" &&
        (d.valCounts.length <= 8 && d.name != "custom") |
        (d.name == g_donorField)
      )
    for (const meta_field of meta_fields) {
      db.loadMetaVec(db.findMetaInfo(meta_field.name), gotMetaArr, onProgressConsole)
    }
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
    var metaInfo = db.findMetaInfo(db.conf.clusterField)
    var clusterNames = metaInfo.valCounts.map(d => d[0]).slice().sort()
    buildMarkerTables()
    onClusterNameClick(0, clusterNames[0])

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
    if (state.gene === geneSym) {
      return
    }
    state.gene = geneSym
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
        // if (state.gene != geneSym) {
        //   state.gene = geneSym
          renderer.drawGene(geneSym, state.gene_groupby)
          renderer.drawGeneBars(geneSym, state.gene_groupby)
          renderer.drawGeneBoxplot(geneSym, state.gene_groupby)
        // }
      }
    }

    function gotGeneVec(exprArr, decArr, geneSym, geneDesc, binInfo) {

      g_exprArr = exprArr;
      g_decArr = decArr;
      g_geneSym = geneSym;
      g_geneDesc = geneDesc;
      g_binInfo = binInfo;

      if (g_mydata === null) {
        for (var i = 0; i < exprArr.length; i++) {
          g_mydata.push({gene: exprArr[i]});
        }
      } else {
        for (var i = 0; i < exprArr.length; i++) {
          g_mydata[i]['gene'] = exprArr[i];
        }
      }
      
      /* called when the expression vector has been loaded and binning is done */
      if (decArr===null)
        return;
      console.log("Received expression vector, gene "+geneSym+", geneId "+geneDesc)
      // _dump(binInfo);
      // makeLegendExpr(geneSym, geneDesc, binInfo, exprArr, decArr);

      // renderer.setColors(legendGetColors(gLegend.rows));
      // renderer.setColorArr(decArr);
      // buildLegendBar();
      onDone()

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
    var metaInfo = db.findMetaInfo(db.conf.clusterField)

    var clusterNames = metaInfo.valCounts.map(d => d[0]).slice().sort((a, b) => a.localeCompare(b, navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true}))

    var htmls = [];

    // htmls.push(`<div class="row">`)

    htmls.push(`<div class="col-3">
      <input type="checkbox" id="show-cluster-labels" checked>
      <label for="show-cluster-labels">Show cluster labels</label>
    </div>`)

    // htmls.push(`<div class="col-6"><div style="display: block;"><p>Metadata</p>`)
    // htmls.push(`<nav> <div class="nav nav-pills" id="nav-metadata" role="tablist"> `)
    // for (var i = 0; i < db.conf.metaFields.length; i++) {
    //   var fieldLabel = db.conf.metaFields[i].label
    //   var fieldName = db.conf.metaFields[i].name
    //   if (fieldName.startsWith("custom") || fieldName.toLowerCase().startsWith("cell")) {
    //     continue
    //   }
    //   var selected = fieldName == db.conf.clusterField
    //   htmls.push(
    //     `<a class="nav-metadata nav-item nav-link ${selected ? 'active' : ''}"
    //     id="nav-metadata-${fieldName}"
    //     data-name="${fieldName}" data-toggle="tab"
    //     href="#metadata-${fieldName}" role="tab"
    //     aria-controls="metadata-${fieldName}"
    //     aria-selected="${selected ? true : false}">${fieldLabel}</a>`
    //   )
    // }
    // htmls.push(`</div> </nav>`)
    // htmls.push(`</div> </div>`) // Metadata

    var div_colorby = [
      `<div class="col-2>
        <div class="form-group">
          <label for="meta-colorby">Color by</label>
          <select class="form-control" id="meta-colorby">
      `
    ]
    for (var i = 0; i < db.conf.metaFields.length; i++) {
      var fieldLabel = db.conf.metaFields[i].label
      var fieldName = db.conf.metaFields[i].name
      if (fieldName.startsWith("custom") || fieldName.toLowerCase().startsWith("cell")) {
        continue
      }
      if (fieldName === db.conf.clusterField) {
        div_colorby.push(`<option selected="selected" value="${fieldName}">${fieldLabel}</option>`)
      } else {
        div_colorby.push(`<option value="${fieldName}">${fieldLabel}</option>`)
      }
    }
    div_colorby.push(`
          </select>
        </div>
      </div>
    `)
    div_colorby = div_colorby.join("")
    htmls.push(div_colorby)

    $("#mycontrols").html(htmls.join(""))

    htmls = []

    var div_groupby = [
      `<div class="col-2>
        <div class="form-group">
          <label for="gene-groupby">Group by</label>
          <select class="form-control" id="gene-groupby" onchange="mybrowser.onGeneGroupbyClick()">
      `
    ]
    var meta_fields = db.conf.metaFields
      .filter(d => d.type == "enum" && d.valCounts.length <= 8 && d.name != "custom")
    div_groupby.push(`<option value="none">None</option>`)
    for (let meta_field of meta_fields) {
      div_groupby.push(`<option value="${meta_field.name}">${meta_field.label}</option>`)
    }
    div_groupby.push(`
          </select>
        </div>
      </div>
    `)
    div_groupby = div_groupby.join("")

    // Gene expression controls
    htmls.push(`<div class="mb-4">
      <div class="row">
        <div class="col-5">
          <label for="gene-search">Gene</label>
          <select style="width:200px" id="gene-search" placeholder="search for a gene..." class="tpCombo"></select>
          <div class="" id="recent-genes">
          </div>
        </div>
        ${div_groupby}
      </div>
    </div>`); // Genes


    htmls.push(`<div><h4>Clusters</h4></div>`)
    htmls.push(`<nav> <div class="nav nav-pills" id="nav-cluster-tables" role="tablist"> `)
    for (var clusterIndex = 0; clusterIndex < clusterNames.length; clusterIndex++) {
      var clusterName = clusterNames[clusterIndex]
      htmls.push(`<a class="nav-item nav-link ${clusterIndex == 0 ? 'active' : ''}" id="nav-cluster-table-${clusterIndex}" data-toggle="tab" href="#cluster-table-${clusterIndex}" role="tab" aria-controls="cluster-table-${clusterIndex}" aria-selected="${clusterIndex == 0 ? true : false}" onclick="mybrowser.onClusterNameClick(${clusterIndex}, '${clusterName}')">${clusterName}</a>`)
    }
    htmls.push(`</div> </nav>`)

    htmls.push("<div id='tpPaneHeader' style='padding:0.4em 1em'>");
    // htmls.push("Click a gene to plot it, or click a column name to sort the table.<br>");
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
        htmls.push("Click a cluster name to load the table.");
        htmls.push("</div>");
        // loadClusterTsv(markerTsvUrl, loadMarkersFromTsv, divName, clusterName, clusterIndex);
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

  function onGeneGroupbyClick() {
    var x = document.getElementById("gene-groupby").value
    state.gene_groupby = x
    renderer.drawGene(state.gene, state.gene_groupby)
    renderer.drawGeneBars(state.gene, state.gene_groupby)
    renderer.drawGeneBoxplot(state.gene, state.gene_groupby)
    console.log("changed to " + x)
  }

  function onClusterNameClick(clusterIndex, clusterName) {
    var metaInfo = db.findMetaInfo(db.conf.clusterField)

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
      htmls.push("Click a gene to plot it, or click a column name to sort the table.<br>");
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

    // for (let tabIdx = 0; tabIdx < tabInfo.length; tabIdx++) {
    //   var divName = "tabs-"+tabIdx;
    //   var tabDir = tabInfo[tabIdx].name;
    //   var sanName = sanitizeName(clusterName);
    //   var markerTsvUrl = cbUtil.joinPaths([db.name, "markers", tabDir, sanName+".tsv.gz"]);
    //   htmls.push("<div id='"+divName+"'>");
    //   htmls.push("Loading...");
    //   htmls.push("</div>");
    //   loadClusterTsv(markerTsvUrl, loadMarkersFromTsv, divName, clusterName);
    // }

    for (let tabIdx = 0; tabIdx < tabInfo.length; tabIdx++) {
      var divName = `tabs-${tabIdx}-cluster-${clusterIndex}`
      var tabDir = tabInfo[tabIdx].name
      var sanName = sanitizeName(clusterName)
      var markerTsvUrl = cbUtil.joinPaths([
        db.name, "markers", tabDir, `${sanName}.tsv.gz`
      ])
      htmls.push(`<div id="${divName}" style="height:500px; overflow-y: scroll;">`)
      htmls.push("Loading...")
      htmls.push("</div>")
      loadClusterTsv(markerTsvUrl, loadMarkersFromTsv, divName, clusterName, clusterIndex)
    }

    htmls.push("</div>"); // tabs

    var winWidth = window.innerWidth - 0.10*window.innerWidth;
    var winHeight = window.innerHeight - 0.10*window.innerHeight;
    var title = "Cluster markers for &quot;"+clusterName+"&quot;";
    
    $(`#cluster-table-${clusterIndex}`).html(htmls.join(""));
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
    var pval_labels = [
      'P_value', 'p_val', 'pVal', 'Chisq_P', 'auc'
    ]
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

      var i_pval = pval_labels.indexOf(colLabel)

      var width = null;
      if (colLabel==="_geneLists") {
        colLabel = "Gene Lists";
        geneListCol = i;
      }
      else if (i_pval != -1) {
        // colLabel = "P-value"
        colLabel = pval_labels[i_pval]
        pValCol = i
        isNumber = true
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

    var n_rows = Math.min(2000, rows.length)
    htmls.push("<tbody>");
    for (let i = 1; i < n_rows; i++) {
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
          // htmls.push(parseFloat(val).toPrecision(5)); // five digits ought to be enough for everyone
          htmls.push(parseFloat(val).toPrecision(3))
          // htmls.push(+val);
        } else {
          // htmls.push(+val);
          htmls.push(parseFloat(val).toPrecision(3))
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
    // $(".nav-metadata").unbind("click")
    // $(".nav-metadata").on("click", onMetaClick);
    $("#meta-colorby").unbind("change")
    $("#meta-colorby").on("change", on_meta_colorby);

    var ttOpt = {"html": true, "animation": false, "delay":{"show":100, "hide":100} };
    // $(".tpPlots").bsTooltip(ttOpt);
  }

  function onMarkerGeneClick(ev) {
    /* user clicks onto a gene in the table of the marker gene dialog window */
    var geneSym = ev.target.getAttribute("data-gene");
    loadGeneAndColor(geneSym);
  }

  function on_meta_colorby() {
    var x = document.getElementById("meta-colorby").value
    state.meta_colorby = x
    console.log("meta_colorby changed to " + x)
    renderer.drawMetaHex(state.meta_colorby);
  }

  function onMetaClick(ev) {
    /* user clicks onto a gene in the table of the marker gene dialog window */
    var fieldName = ev.target.getAttribute("data-name");
    renderer.drawMetaHex(fieldName);
    // renderer.drawMetaBoxplot(fieldName, state.gene_groupby)
    renderer.drawMetaBoxplot(fieldName, g_healthField)
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

  /**
   * Uses canvas.measureText to compute and return the width of the given text
   * of given font in pixels.
   * 
   * @param {String} text The text to be rendered.
   * @param {String} font The css font descriptor that text is to be rendered
   * with (e.g. "bold 14px verdana").
   * 
   * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
   */
  function getTextWidth(text, font) {
      // re-use canvas object for better performance
      var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
      var context = canvas.getContext("2d");
      context.font = font;
      var metrics = context.measureText(text);
      return metrics.width;
  }

  function max_length(xs) {
    var retval = 0
    var ret_i = 0
    for (var i = 0; i < xs.length; i++) {
      retval = xs[i].length > retval ? xs[i].length : retval
    }
    return retval
  }

  function ramp(color, n = 256) {
    // const canvas = DOM.canvas(1, n);
    var canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = n
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(0, n-i, 1, 1);
    }
    return canvas;
  }

  function vertical_legend({
    svg,
    color,
    title,
    tickSize = 3,
    width = 26 + tickSize,
    height = 320,
    offsetLeft = 0,
    offsetTop = 0,
    marginTop = 10,
    marginRight = 10 + tickSize,
    marginBottom = 10,
    marginLeft = 5,
    ticks = height / 64,
    tickFormat,
    tickValues
  } = {}) {

    // let tickAdjust = g => g.selectAll(".tick line")
      // .attr("x1", marginLeft - width + marginRight);
    let tickAdjust = g => g.selectAll(".tick text")
      .attr("font-size", "14px")
      .attr("font-family", "sans-serif")
      .attr("dx", 3)
    let x;

    // Continuous
    if (color.interpolate) {
      const n = Math.min(color.domain().length, color.range().length);

      x = color.copy().rangeRound(d3.quantize(d3.interpolate(height - marginBottom, marginTop), n));

      svg.append("image")
          .attr("x", offsetLeft + marginLeft)
          .attr("y", offsetTop + marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
    }

    // Sequential
    else if (color.interpolator) {
      x = Object.assign(color.copy()
          .interpolator(d3.interpolateRound(height - marginBottom, marginTop)),
          {range() { return [height - marginBottom, marginTop]; }});

      svg.append("image")
          .attr("x", offsetLeft + marginLeft)
          .attr("y", offsetTop + marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.interpolator()).toDataURL());

      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    }

    // Threshold
    else if (color.invertExtent) {
      const thresholds
          = color.thresholds ? color.thresholds() // scaleQuantize
          : color.quantiles ? color.quantiles() // scaleQuantile
          : color.domain(); // scaleThreshold

      const thresholdFormat
          = tickFormat === undefined ? d => d
          : typeof tickFormat === "string" ? d3.format(tickFormat)
          : tickFormat;

      x = d3.scaleLinear()
          .domain([-1, color.range().length - 1])
          .rangeRound([height - marginBottom, marginTop]);

      svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
          .attr("y", (d, i) => x(i))
          .attr("x", offsetLeft + marginLeft)
          .attr("height", (d, i) => x(i - 1) - x(i))
          .attr("width", width - marginRight - marginLeft)
          .attr("fill", d => d);

      tickValues = d3.range(thresholds.length);
      tickFormat = i => thresholdFormat(thresholds[i], i);
    }

    // Ordinal
    else {
      x = d3.scaleBand()
          .domain(color.domain())
          .rangeRound([height - marginBottom, marginTop]);

      svg.append("g")
        .selectAll("rect")
        .data(color.domain())
        .join("rect")
          .attr("y", x)
          .attr("x", offsetLeft + marginLeft)
          .attr("height", Math.max(0, x.bandwidth() - 1))
          .attr("width", width - marginLeft - marginRight)
          .attr("fill", color);

      tickAdjust = () => {};
    }

    svg.append("g")
        .attr("transform", `translate(${offsetLeft + width - marginRight},${offsetTop})`)
        .call(d3.axisRight(x)
          .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(tickValues))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
          .attr("x", marginLeft - width + marginRight)
          .attr("y", 0)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .attr("class", "title")
          .attr("font-family", "sans-serif")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(title));

    return svg.node();
  }


  // Only export these functions
  return {
    "main": main,
    "onClusterNameClick": onClusterNameClick,
    "onGeneGroupbyClick": onGeneGroupbyClick,
    "renderer": renderer,
    "state": state
  }


}();
