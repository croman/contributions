"use strict";

let fs = require("fs");
let path = require("path");

let moment = require("moment");

const DATE_FORMAT = "ddd MMM DD HH:mm YYYY ZZ";

module.exports = {
  readFile: readFile,
  generateCommitDates: generateCommitDates
};

function readFile(font) {
  let content = fs.readFileSync(path.join(__dirname, "..", "fonts", font), "utf8");
  let lines = content.split(/\r?\n/);

  let fontDefinition = {};

  let identifier = null;
  let startMatrix = false;
  let matrix = [];

  for (let i = 0, len = lines.length; i < len; i++) {
    let line = lines[i];
    if (identifier === null) {
      identifier = line;
    } else if (!startMatrix && line.length === 0) {
      startMatrix = true;
    } else if (startMatrix && line.length > 0) {
      matrix.push(line.split(" ").map(x => parseInt(x, 10)));
    } else if (startMatrix && line.length === 0) {
      fontDefinition[identifier] = matrix;
    }
  }

  return fontDefinition;
}

function generateCommitDates(matrix, startDate) {
  let dates = [];

  let n = matrix.length;
  let m = matrix[0].length;

  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) {
      let val = matrix[i][j];
      let dayMoment = moment(startDate).add(7 * j + i, "days");
      for (let k = 0; k < val; k++) {
        dates.push(dayMoment.add(30, "minutes").format(DATE_FORMAT));
      }
    }
  }

  return dates;
}
