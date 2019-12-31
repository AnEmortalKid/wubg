var fs = require("fs");
var xmlserializer = require("xmlserializer");
var svg2img = require("svg2img");

// TODO pull from env
const baseOutputPath = "out/charts";

export default class BaseChart {
  constructor(typeDirectory) {
    this.typeDirectory = typeDirectory;
  }

  /**
   * Writes the chart to the configured output path
   * @param {String} fileName name of the file
   * @param {SVG} svgCanvas a d3 svg element that holds the chart
   */
  writeChart(fileName, svgCanvas) {
    var source = xmlserializer.serializeToString(svgCanvas.node());
    const typeOutputDir = baseOutputPath + "/" + this.typeDirectory + "/";
    const filePath = typeOutputDir + fileName;

    fs.mkdir(typeOutputDir, { recursive: true }, err => {
      if (err) throw err;
    });

    fs.writeFileSync(`${filePath}.svg`, source);

    svg2img(source, function(error, buffer) {
      //returns a Buffer
      fs.writeFileSync(`${filePath}.png`, buffer);
      if (error) {
        console.log(error);
      }
    });
  }
}