"use strict";

let moment = require("moment");

const COLUMNS_BETWEEN_CHARACTERS = 1;

module.exports = {
  getCharactersStartDates: getCharactersStartDates
};

function getCharactersStartDates(fontDefinition, message) {
  let startDates = [];

  let startDate = moment().subtract(1, "years");
  if (startDate.day() !== 0) {
    startDate.add(7, "days").day("Sunday");
  }

  let characters = getCharacters(fontDefinition, message);
  for (let i = 0; i < characters.length; i++) {
    startDates.push({
      character: characters[i],
      date: startDate
    });
    let characterColumns = fontDefinition[characters[i]].size.columns;
    startDate = moment(startDate).add(7 * (characterColumns + COLUMNS_BETWEEN_CHARACTERS), "days");
  }

  return startDates;
}

function getCharacters(fontDefinition, message) {
  let characters = [];

  for (let i = 0, len = message.length; i < len;) {
    let item = message[i];
    if (item !== "<") {
      if (item in fontDefinition) {
        characters.push(item);
      }
      i++;
    } else {
      if (i < len - 1 && message[i + 1] === "<") {
        if ("<" in fontDefinition) {
          characters.push(item);
        }

        i += 2;
        continue;
      }

      let endIndex = message.indexOf(">", i);
      if (endIndex > 0 && endIndex !== (i + 1)) {
        characters.push(message.substring(i + 1, endIndex));
        i = endIndex + 1;
      } else {
        break;
      }
    }
  }

  return characters;
}
