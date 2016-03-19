"use strict";

let fs = require("fs");
let path = require("path");

let moment = require("moment");

const DATE_FORMAT = "ddd MMM DD HH:mm YYYY ZZ";

module.exports = {
  read: read,
  generateCommitDates: generateCommitDates
};

function read(font) {
  if (!validateFont(font)) {
    throw new Error(`Invalid font: ${font}`);
  }

  let content;
  try {
    content = fs.readFileSync(path.join(__dirname, "..", "fonts", font), "utf8");
  } catch (err) {
    throw new Error(`Error reading the font file '${font}': ${err}`);
  }

  let fontDefinition;
  try {
    fontDefinition = parseFont(content);
  } catch (err) {
    throw new Error(`Error parsing font file '${font}: ${err}'`);
  }

  return fontDefinition;
}

function validateFont(font) {
  try {
    let stat = fs.statSync(path.join(__dirname, "..", "fonts", font));
    if (!stat.isFile()) {
      return false;
    }
  } catch (err) {
    return false;
  }

  return true;
}

function parseFont(content) {
  let lines = content.split(/\r?\n/);

  let fontDefinition = {};

  let identifier = null;
  let startMatrix = false;
  let matrix = [];
  let columns = 0;

  for (let i = 0, len = lines.length; i < len; i++) {
    let line = lines[i];
    if (line.startsWith("//")) {
      continue;
    }

    if (identifier === null) {
      if (line) {
        identifier = line;
      }
    } else if (!startMatrix && line.length === 0) {
      startMatrix = true;
    } else if (startMatrix && line.length > 0) {
      let row = line.split(" ").map(x => parseInt(x, 10));
      columns = Math.max(columns, row.length);
      matrix.push(row);
    } else if (startMatrix && line.length === 0) {
      fontDefinition[identifier] = {
        matrix: matrix,
        size: {
          rows: matrix.length,
          columns: columns
        }
      };

      identifier = null;
      startMatrix = false;
      matrix = [];
      columns = 0;
    }
  }

  return fontDefinition;
}

function generateCommitDates(characterDefinition, startDate) {
  let dates = [];

  let matrix = characterDefinition.matrix;
  let n = characterDefinition.size.rows;
  let m = characterDefinition.size.columns;

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
