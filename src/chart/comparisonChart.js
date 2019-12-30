import BaseChart from "./baseChart";

import { squadPlayerColors } from "../styling/styler";

var d3 = require("d3");
var jsdom = require("jsdom");

const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;

// turn for debug or not
const debug = false;

function getAllPoints(dataSet) {
  const allPoints = [];
  for (const data of dataSet) {
    data.points.map(x => x.value).forEach(x => allPoints.push(x));
  }

  return allPoints;
}

const keyBoxSize = 15;
const keyEntryPadding = 5;

const colorSet = [
  squadPlayerColors.yellow,
  squadPlayerColors.orange,
  squadPlayerColors.blue,
  squadPlayerColors.green,
  squadPlayerColors.darkRed,
  squadPlayerColors.pink,
  squadPlayerColors.darkBlue,
  squadPlayerColors.teal
];

function plotDataPoints(plotCanvas, dataSet, dataPointOptions) {
  const pointsRadius = dataPointOptions.radius;
  const lineThickness = dataPointOptions.connectionThickness;
  const xScale = dataPointOptions.xScale;
  const yScale = dataPointOptions.yScale;

  var colorIndex = 0;
  for (const dataEntry of dataSet) {
    const color = colorSet[colorIndex];
    colorIndex++;

    const dataPoints = dataEntry.points;
    const dataValues = dataPoints.map(x => x.value);

    // connect the points with a line
    plotCanvas
      .append("path")
      .datum(dataValues)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", lineThickness)
      .attr(
        "d",
        d3
          .line()
          .x(function(d, i) {
            return xScale(i + 1);
          })
          .y(function(d) {
            return yScale(d);
          })
      );

    // Add the points
    plotCanvas
      .append("g")
      .selectAll("dot")
      .data(dataValues)
      .enter()
      .append("circle")
      .attr("cx", function(d, i) {
        return xScale(i + 1);
      })
      .attr("cy", function(d) {
        return yScale(d);
      })
      .attr("r", pointsRadius)
      .attr("fill", color);
  }
}

function addKey(svgCanvas, dataSet, keyOptions) {
  const margin = keyOptions.margin;
  const canvasWidth = keyOptions.canvasWidth;

  // create a key on the left
  const keyBoxX = margin.left / 4;
  const keyBoxY = margin.top / 4;

  var keyCount = 0;

  // if more than 4, split left and right
  const keyBoxRightX = (canvasWidth * 3) / 4;

  for (const dataEntry of dataSet) {
    const color = colorSet[keyCount];

    const rowNumber = keyCount < 4 ? keyCount : keyCount - 4;

    // shift by number of entries
    const padAmount = rowNumber > 0 ? keyEntryPadding : 0;
    const lineShift = rowNumber * (keyBoxSize + padAmount);

    // if there's more than 4, place the column on the right side of the graph
    const xShift = keyCount < 4 ? 0 : keyBoxRightX;

    svgCanvas
      .append("rect")
      .attr("x", keyBoxX + xShift)
      .attr("y", keyBoxY + lineShift)
      .attr("width", keyBoxSize)
      .attr("height", keyBoxSize)
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", color);

    svgCanvas
      .append("text")
      .attr("x", keyBoxX + xShift + keyBoxSize * 1.5)
      .attr("y", keyBoxY + keyBoxSize * 0.75 + lineShift)
      .attr("font-size", "12px")
      .text(dataEntry.label);

    keyCount++;
  }
}

export class ComparisonChart extends BaseChart {
  constructor(chartOptions) {
    super("comparison");
    this.chartOptions = chartOptions;
  }

  /**
   * Creates a canvas with the chart data
   * @return SVG Canvas
   */
  create() {
    const title = this.chartOptions.title;
    const subTitle = this.chartOptions.subTitle;

    const dataSet = this.chartOptions.dataSet;
    if (dataSet.length > colorSet.length) {
      throw new Error("Can only handle " + colorSet.length + " comparisons!");
    }

    const canvasWidth = 800;
    const canvasHeight = 600;

    var margin = { top: 50, right: 60, bottom: 50, left: 60 };

    // reduce graph height based on the legend box bounds
    const keyRowHeight = keyBoxSize + keyEntryPadding;
    // shift graph up to 4 legend rows, since rows 5-8 get placed on the right
    const dataSetCount = dataSet.length < 4 ? dataSet.length : 4;
    const keyBoxHeight = keyRowHeight * dataSetCount;
    const keyBoxYBound = margin.top / 4 + keyBoxHeight;

    const width = canvasWidth - margin.left - margin.right;
    const height = canvasHeight - keyBoxYBound - margin.bottom;

    const lineThickness = 2;
    const pointsRadius = 5;

    // scale should be the same across datasets, so take the first one
    const firstDataPoints = dataSet[0].points;
    var dataPointCount = firstDataPoints.length;
    var xScale = d3
      .scaleLinear()
      .domain([1, dataPointCount])
      .range([0, width]);

    // y scale is across all of them
    var yPoints = getAllPoints(dataSet);

    var minYPoint = d3.min(yPoints);
    const maxYPoint = d3.max(yPoints);

    var yScale = d3
      .scaleLinear()
      .domain([minYPoint, maxYPoint])
      // add a little bit of padding so the last grid line isn't on the edge of the key
      .range([height, keyRowHeight]);

    // create svg element
    var svgCanvas = d3
      .select(document.body)
      .append("svg")
      .attr("width", canvasWidth)
      .attr("height", canvasHeight);

    // set a background jic things are black on the image?
    svgCanvas
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("stroke", "black")
      .attr("fill", "white");

    // create a border on the area that would be the draw area for debugging
    if (debug) {
      svgCanvas
        .append("rect")
        .attr("x", margin.left)
        .attr("y", keyBoxYBound)
        .attr("width", width)
        .attr("height", height)
        .attr("stroke", "black")
        .attr("fill", "none");
    }

    // Add Main Title
    svgCanvas
      .append("text")
      .attr("x", canvasWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text(title);

    svgCanvas
      .append("text")
      .attr("x", canvasWidth / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text(subTitle);

    // add the legend box
    addKey(svgCanvas, dataSet, { margin: margin, canvasWidth: canvasWidth });

    // canvas for the plot elements
    var plotCanvas = svgCanvas
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + keyBoxYBound + ")");

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(dataPointCount)
      .tickFormat(function(d, i) {
        return firstDataPoints[i].name;
      });

    // position axis in the middle of the allowable margin
    const xAxis_yPositioning = height + margin.bottom / 2;
    plotCanvas
      .append("g")
      .attr("transform", "translate(0," + xAxis_yPositioning + ")")
      .style("stroke", "#383838")
      .style("font-size", "12px")
      .call(xAxis)
      // hide connection only show values
      .call(g => g.select(".domain").remove());

    // position y axis a little bit to the left
    const yAxis_xPositioning = margin.left / 4;
    const yAxis = d3.axisLeft(yScale);

    // Add the y Axis
    plotCanvas
      .append("g")
      // shift to the left
      .attr("transform", "translate(-" + yAxis_xPositioning, ",0)")
      .style("stroke", "#383838")
      .style("font-size", "12px")
      .call(yAxis);

    // add grid lines for y axis
    const yGridLines = d3.axisLeft(yScale);
    plotCanvas
      .append("g")
      .attr("class", "grid")
      // shift to the left
      .attr("transform", "translate(-" + yAxis_xPositioning, ",0)")
      .style("stroke", "#D0D0D0")
      .call(yGridLines.tickSize(-width - yAxis_xPositioning).tickFormat(""));

    // add the data
    const dataPointOptions = {
      radius: pointsRadius,
      connectionThickness: lineThickness,
      xScale: xScale,
      yScale: yScale
    };
    plotDataPoints(plotCanvas, dataSet, dataPointOptions);

    return svgCanvas;
  }
}
