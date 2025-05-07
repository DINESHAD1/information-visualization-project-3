let scatterplotsMargins = { top: 90, right: 100, bottom: 30, left: 70 };
let scatterplotsWidth = 960 - scatterplotsMargins.left - scatterplotsMargins.right;
let scatterplotsHeight = 600 - scatterplotsMargins.top - scatterplotsMargins.bottom;

const scatterPlotSVG = d3
  .select("#scatterplot")
  .append("svg")
  .attr("width", scatterplotsWidth + scatterplotsMargins.left + scatterplotsMargins.right)
  .attr("height", scatterplotsHeight + scatterplotsMargins.top + scatterplotsMargins.bottom)
  .append("g")
  .attr("transform", `translate(${scatterplotsMargins.left},${scatterplotsMargins.top})`);

scatterPlotSVG
  .append("text")
  .attr("text-anchor", "end")
  .attr("x", scatterplotsWidth / 2 + scatterplotsMargins.left)
  .attr("y", scatterplotsHeight + scatterplotsMargins.top + -10)
  .text("Horsepower")
  .style("font-weight", "bold");

scatterPlotSVG
  .append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -scatterplotsMargins.left + 20)
  .attr("x", -scatterplotsHeight / 2)
  .text("Acceleration")
  .style("font-weight", "bold");

scatterPlotSVG
  .append("text")
  .attr("x", scatterplotsWidth / 2)
  .attr("y", -20)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .text("Scatter Plot of Acceleration vs Horsepower")
  .style("font-weight", "bold");

scatterPlotSVG.append("svg");

const barMargin = { top: 40, right: 20, bottom: 100, left: 70 },
  barWidth = 6200 - barMargin.left - barMargin.right,
  barHeight = 500 - barMargin.top - barMargin.bottom;

const barSvg = d3
  .select("#barchart")
  .append("svg")
  .attr("width", barWidth + barMargin.left + barMargin.right)
  .attr("height", barHeight + barMargin.top + barMargin.bottom)
  .append("g")
  .attr("transform", `translate(${barMargin.left},${barMargin.top})`);

barSvg
  .append("text")
  .attr("class", "x axis-label")
  .attr("text-anchor", "start")
  .attr("x", 0)
  .attr("y", barHeight + barMargin.top + 60)
  .text("Car Names")
  .style("font-weight", "bold");

barSvg
  .append("text")
  .attr("class", "y axis-label")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -barMargin.left + 20)
  .attr("x", -barHeight / 2)
  .style("font-size", "14px")
  .text("Horsepower")
  .style("font-weight", "bold");

barSvg
  .append("text")
  .attr("class", "chart-title")
  .attr("x", 0)
  .attr("y", -barMargin.top + 20)
  .attr("text-anchor", "start")
  .style("font-size", "16px")
  .text("Distribution of Car Horsepower based on Acceleration");

const tooltip = d3.select("#tooltip");

d3.csv("a1-cars.csv")
  .then((data) => {
    data.forEach((d) => {
      d.Horsepower = +d.Horsepower;
      d.Acceleration = +d.Acceleration;
    });

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.Horsepower))
      .range([0, scatterplotsWidth]);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.Acceleration))
      .range([scatterplotsHeight, 0]);
    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(data.map((d) => d.Origin))
      .range(["#032cfc", "#ffb303","#ed051c"]);

    const xBarScale = d3
      .scaleBand()
      .domain(data.map((d) => d.Car))
      .range([0, barWidth])
      .paddingInner(0.9)
      .paddingOuter(0.9);
    let selectedAttribute = "Horsepower";
    const yBarScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[selectedAttribute])])
      .range([barHeight, 0]);

    scatterPlotSVG
      .append("g")
      .attr("transform", `translate(0,${scatterplotsHeight})`)
      .call(d3.axisBottom(xScale));
    scatterPlotSVG.append("g").call(d3.axisLeft(yScale));

    barSvg
      .append("g")
      .attr("transform", `translate(0,${barHeight})`)
      .call(d3.axisBottom(xBarScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-1em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)");

    barSvg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xBarScale(d.Car))
      .attr("y", (d) => yBarScale(d[selectedAttribute]))
      .attr("width", xBarScale.bandwidth() * 1.8)
      .attr("height", (d) => barHeight - yBarScale(d[selectedAttribute]))
      .attr("fill", (d) => {
        if (d.Origin === "American") return "#032cfc";
        else if (d.Origin === "European") return "#ffb303";
        else if (d.Origin === "Japanese") return "#ed051c";
        else return "#878383";
      })
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `Car: ${d.Car}<br>${selectedAttribute}: ${d[selectedAttribute]}`
          )
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    barSvg.append("g").call(d3.axisLeft(yBarScale));

    scatterPlotSVG
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.Horsepower))
      .attr("cy", (d) => yScale(d.Acceleration))
      .attr("r", 5)
      .style("fill", (d) => colorScale(d.Origin))
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Car: ${d.Car}<br>Acceleration: ${d.Acceleration}<br>Horsepower: ${d.Horsepower}<br>Origin: ${d.Origin}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    barSvg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xBarScale(d.Car))
      .attr("y", (d) => yBarScale(d[selectedAttribute]))
      .attr("width", xBarScale.bandwidth())
      .attr("height", (d) => barHeight - yBarScale(d[selectedAttribute]))
      .attr("fill", "steelblue");

    window.updateBarChart = function (newAttribute) {
      selectedAttribute = newAttribute;

      barSvg
        .select(".y.axis-label")
        .text(selectedAttribute)
        .style("font-weight", "bold");

      barSvg
        .select(".chart-title")
        .text(`Distribution of ${selectedAttribute}`)
        .style("font-weight", "bold");

      yBarScale.domain([0, d3.max(data, (d) => d[selectedAttribute])]);

      barSvg
        .selectAll(".bar")
        .data(data)
        .transition()
        .duration(750)
        .attr("y", (d) => yBarScale(d[selectedAttribute]))
        .attr("height", (d) => barHeight - yBarScale(d[selectedAttribute]));

      barSvg
        .select(".y-axis")
        .transition()
        .duration(750)
        .call(d3.axisLeft(yBarScale));
    };

    document
      .getElementById("attributeSelector")
      .addEventListener("change", function () {
        updateBarChart(this.value);
      });

    const scatterBrush = d3
      .brush()
      .extent([
        [0, 0],
        [scatterplotsWidth, scatterplotsHeight + 100],
      ])
      .on("brush end", brushed);

    const barchartBrush = d3
      .brush()
      .extent([
        [0, 0],
        [barWidth, barHeight + 100],
      ])
      .on("brush end", brushedBarChart);

    function brushedBarChart(event) {
      const selection = event.selection;
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        const filteredData = data.filter(
          (d) =>
            xScale(d.Horsepower) >= x0 &&
            xScale(d.Horsepower) <= x1 &&
            yScale(d.Acceleration) >= y0 &&
            yScale(d.Acceleration) <= y1
        );

        updateScatterPlotWithData(filteredData);
        updateLineChartWithData(filteredData);
      } else {
        updateScatterPlotWithData(data);
        window.location.reload();
      }
    }

    function brushed(event) {
      const selection = event.selection;
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        const filteredData = data.filter(
          (d) =>
            xScale(d.Horsepower) >= x0 &&
            xScale(d.Horsepower) <= x1 &&
            yScale(d.Acceleration) >= y0 &&
            yScale(d.Acceleration) <= y1
        );

        updateBarChartWithData(filteredData);
        updateLineChartWithData(filteredData);
      } else {
        updateBarChartWithData(data);
        window.location.reload();
      }
    }

    function updateLineChartWithData(filteredData) {
      lineSvg.selectAll(".line").remove();
      const line = d3
        .line()
        .x((d) => xaxislinechartScale(d["Model Year"]))
        .y((d) => yaxislinechartScale(d.Acceleration));

      lineSvg
        .append("path")
        .datum(filteredData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    function updateBarChartWithData(filteredData) {
      const bars = barSvg.selectAll(".bar").data(filteredData, (d) => d.Car);

      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xBarScale(d.Car))
        .attr("width", xBarScale.bandwidth())
        .attr("y", barHeight)
        .attr("height", 0)
        .attr("fill", "steelblue")
        .merge(bars)
        .transition()
        .duration(750)
        .attr("y", (d) => yBarScale(d[selectedAttribute]))
        .attr("height", (d) => barHeight - yBarScale(d[selectedAttribute]));

      bars
        .exit()
        .transition()
        .duration(750)
        .attr("y", barHeight)
        .attr("height", 0)
        .remove();
    }
    function updateScatterPlotWithData(filteredData) {
      const dots = barSvg.selectAll(".dot").data(filteredData, (d) => d.Car);
      dots
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 0)
        .attr("cx", (d) => xScale(d.Acceleration))
        .attr("cy", yScale(0))
        .style("fill", (d) => colorScale(d.Origin))
        .merge(dots)
        .transition()
        .duration(750)
        .attr("cy", (d) => yScale(d.MPG))
        .attr("r", 5);

      dots.exit().transition().duration(750).attr("r", 0).remove();
    }

    document
      .getElementById("toggleBrush")
      .addEventListener("change", function () {
        if (this.checked) {
          scatterPlotSVG.append("g").attr("class", "brush").call(scatterBrush);
        } else {
          scatterPlotSVG.select(".brush").remove();
          updateBarChartWithData(data);
          updateLineChartWithData(data);
        }
      });

    document
      .getElementById("toggleBrushBar")
      .addEventListener("change", function () {
        if (this.checked) {
          barSvg.append("g").attr("class", "brush").call(barchartBrush);
        } else {
          barSvg.selectAll(".brush").remove();
          updateScatterPlotWithData(data);
          updateLineChartWithData(data);
        }
      });

    const legend = scatterPlotSVG
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${scatterplotsWidth - 120}, 20)`)
      .style("font-size", "12px");

    colorScale.domain().forEach(function (d, i) {
      let legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(d));

      legendRow
        .append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .text(d);
    });

    //LINE CHART

    const lineCHARTMargin = { top: 40, right: 20, bottom: 70, left: 70 },
      lineCHARTWidth = 960 - lineCHARTMargin.left - lineCHARTMargin.right,
      lineCHARTHeight = 300 - lineCHARTMargin.top - lineCHARTMargin.bottom;

    const lineSvg = d3
      .select("#linechart")
      .append("svg")
      .attr("width", lineCHARTWidth + lineCHARTMargin.left + lineCHARTMargin.right)
      .attr("height", lineCHARTHeight + lineCHARTMargin.top + lineCHARTMargin.bottom)
      .append("g")
      .attr("transform", `translate(${lineCHARTMargin.left},${lineCHARTMargin.top})`);

    lineSvg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", lineCHARTWidth / 2 + lineCHARTMargin.left)
      .attr("y", lineCHARTHeight + lineCHARTMargin.top + 30)
      .style("font-weight", "bold")
      .text("Model Year");

    lineSvg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -lineCHARTMargin.left + 20)
      .attr("x", -lineCHARTHeight / 2)
      .text("Acceleration")
      .style("font-weight", "bold");

    lineSvg
      .append("text")
      .attr("x", lineCHARTWidth / 2)
      .attr("y", -lineCHARTMargin.top + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Trends in Acceleration Over Years")
      .style("font-weight", "bold");

    const xaxislinechartScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d["Model Year"]))
      .range([0, lineCHARTWidth]);
    const yaxislinechartScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.Acceleration))
      .range([lineCHARTHeight, 0]);

    const line = d3
      .line()
      .x((d) => xaxislinechartScale(d["Model Year"]))
      .y((d) => yaxislinechartScale(d.Acceleration));

    lineSvg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    lineSvg
      .append("g")
      .attr("transform", `translate(0, ${lineCHARTHeight})`)
      .call(d3.axisBottom(xaxislinechartScale));

    lineSvg.append("g").call(d3.axisLeft(yaxislinechartScale));

    const tooltip = d3.select("#tooltip");

    lineSvg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xaxislinechartScale(d["Model Year"]))
      .attr("cy", (d) => yaxislinechartScale(d.Acceleration))
      .attr("r", 4)
      .style("fill", (d) => {
        if (d.Origin === "American") return "#032cfc";
        else if (d.Origin === "European") return "#ffb303";
        else if (d.Origin === "Japanese") return "#ed051c";
        else return "#878383";
      })
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `Car: ${d.Car}<br>Acceleration: ${d.Acceleration}<br>Model Year: ${d["Model Year"]}`
          )
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  })
  .catch((error) => {
    console.error("Error loading the data: ", error);
  });

const zoom = d3.zoom().scaleExtent([0.5, 4]).on("zoom", zooming);

d3.select("#linechart svg").call(zoom);

function zooming(event) {
  scatterPlotSVG.attr("transform", event.transform);
  barSvg.attr("transform", event.transform);
  lineSvg.attr("transform", event.transform);
}
