"use strict";

/* eslint-disable no-process-exit,no-process-env */

let fs = require("fs");
let path = require("path");

let debug = require("debug")("contributions:main");

let github = require("./lib/github");

const DEFAULT_REPOSITORY_NAME = "fake-contributions";
const DEFAULT_FONT = "height5";

main();

function main() {
  let config;
  try {
    config = getConfig();
  } catch (err) {
    debug(err);
    process.exit(1);
  }

  github.repository.get(config.github).then(
    results => {
      debug(results);
    },
    err => {
      debug(err);
    }
  );
}

function getConfig() {
  let message = process.env.MESSAGE;
  if (!message) {
    throw new Error("Variable MESSAGE is missing");
  }

  let font = process.env.FONT;
  if (!font) {
    font = DEFAULT_FONT;
  }

  if (!validateFont(font)) {
    throw new Error(`Invalid font ${font}`);
  }

  return {
    message: message,
    github: getGithubConfig()
  };
}

function getGithubConfig() {
  let organisation = process.env.GITHUB_ORGANISATION;
  if (!organisation) {
    throw new Error("Variable GITHUB_ORGANISATION is missing");
  }

  let repository = process.env.GITHUB_CONTRIBUTIONS_REPOSITORY;
  if (!repository) {
    repository = DEFAULT_REPOSITORY_NAME;
  }

  let user = process.env.GITHUB_USER;
  if (!user) {
    user = organisation;
  }

  let password = process.env.GITHUB_PASSWORD;
  let token = process.env.GITHUB_TOKEN;

  if (!password && !token) {
    throw new Error("You need to specify at least one authentication method (GITHUB_PASSWORD or GITHUB_TOKEN)");
  }

  return {
    organisation: organisation,
    repository: repository,
    user: user,
    password: password,
    token: token
  };
}

function validateFont(font) {
  try {
    let stat = fs.statSync(path.join(__dirname, "fonts", font));
    if (!stat.isFile()) {
      return false;
    }
  } catch (err) {
    return false;
  }

  return true;
}
