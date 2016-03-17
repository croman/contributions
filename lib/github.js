"use strict";

let request = require("./request");

module.exports = {
  repository: {
    get: getRepository,
    create: createRepository,
    delete: deleteRepository
  }
};

function getRepository(githubConfig) {
  let options = {
    hostname: "api.github.com",
    path: `/repos/${githubConfig.organisation}/${githubConfig.repository}`,
    method: "GET",
    headers: {
      Authorization: getAuthorization(githubConfig),
      "User-Agent": githubConfig.user
    }
  };

  return request(options);
}

function createRepository() {}

function deleteRepository() {}

function getAuthorization(githubConfig) {
  if (githubConfig.token) {
    return `token ${githubConfig.token}`;
  }

  let credentials = new Buffer(`${githubConfig.user}:${githubConfig.password}`).toString("base64");
  return `Basic ${credentials}`;
}
