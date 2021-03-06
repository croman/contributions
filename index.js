"use strict";

/* eslint-disable no-process-exit,no-process-env */

let path = require("path");

let debug = require("debug")("contributions:main");

let github = require("./lib/github");
let git = require("./lib/git");
let fonts = require("./lib/fonts");
let messages = require("./lib/messages");

const DEFAULT_REPOSITORY_NAME = "fake-contributions";
const DEFAULT_FONT = "height7";

main();

function main() {
  let config;
  try {
    config = getConfig();
  } catch (err) {
    debug(err);
    process.exit(1);
  }

  github.repository.get(config.github)
  .then(
    response => {
      if (response.statusCode === 200) {
        debug(`Repository '${config.github.repository}' already exists, no need to create it`);
        return Promise.resolve(true);
      }

      if (response.statusCode === 404) {
        debug(`Repository '${config.github.repository}' doesn't exist, we'll have to create it`);
        return Promise.resolve(false);
      }

      logAndExit(`Invalid response received from Github API: ${response.data.message}`);
    },
    err => {
      logAndExit(err);
    }
  )
  .then(
    repositoryExists => {
      if (repositoryExists) {
        return Promise.resolve();
      }

      return github.repository.create(config.github).then(
        response => {
          if (response.statusCode === 201) {
            debug(`Repository '${config.github.repository}' was successfully created`);
            return Promise.resolve();
          }

          logAndExit(`Invalid response received from Github API: ${JSON.stringify(response.data)}`);
        },
        err => {
          logAndExit(err);
        }
      );
    }
  )
  .then(git.clone.bind(null, config.github))
  .then(() => {
    let fontDefinition = fonts.read(config.font);
    let characterDates = messages.getCharactersStartDates(fontDefinition, config.message);

    let commitPromises = [];

    for (let i = 0; i < characterDates.length; i++) {
      let characterDefinition = fontDefinition[characterDates[i].character];
      let dates = fonts.generateCommitDates(characterDefinition, characterDates[i].date);

      for (let j = 0; j < dates.length; j++) {
        commitPromises.push(git.commit.bind(null, config.github, dates[j]));
      }
    }

    return commitPromises.reduce((p, fn) => p.then(fn), Promise.resolve());
  })
  .then(git.push.bind(null, config.github))
  .catch(err => logAndExit(`Error performing operations: ${err}`));
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

  return {
    message: message,
    font: font,
    github: getGithubConfig()
  };
}

function getGithubConfig() {
  let organisation = process.env.GITHUB_ORGANISATION;
  let user = process.env.GITHUB_USER;

  if (!organisation && !user) {
    throw new Error("You need to specify at least one of GITHUB_ORGANISATION or GITHUB_USER");
  }

  if (!organisation) {
    organisation = user;
  }

  let repository = process.env.GITHUB_CONTRIBUTIONS_REPOSITORY;
  if (!repository) {
    repository = DEFAULT_REPOSITORY_NAME;
  }

  let password = process.env.GITHUB_PASSWORD;
  let token = process.env.GITHUB_TOKEN;

  if (!password && !token) {
    throw new Error("You need to specify at least one authentication method (GITHUB_PASSWORD or GITHUB_TOKEN)");
  }

  let usePrivateRepository = process.env.GITHUB_REPOSITORY_TYPE === "private";

  return {
    organisation: organisation,
    repository: repository,
    user: user,
    password: password,
    token: token,
    usePrivateRepository: usePrivateRepository,
    path: path.join(__dirname, "..", repository)
  };
}

function logAndExit(err) {
  debug(err);
  process.exit(1);
}
