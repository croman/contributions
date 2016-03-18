"use strict";

let debug = require("debug")("contributions:github");

let request = require("./request");

const GITHUB_API_HOSTNAME = "api.github.com";

module.exports = {
  repository: {
    get: getRepository,
    create: createRepository,
    delete: deleteRepository
  }
};

function getRepository(githubConfig) {
  debug("Check if the repository exists");

  let options = {
    hostname: GITHUB_API_HOSTNAME,
    path: `/repos/${githubConfig.organisation}/${githubConfig.repository}`,
    method: "GET",
    headers: {
      Authorization: getAuthorization(githubConfig),
      "User-Agent": githubConfig.user
    }
  };

  return request(options);
}

function createRepository(githubConfig) {
  debug("Ready to create a new repository");

  let path;
  if (githubConfig.organisation === githubConfig.user) {
    path = "/user/repos";
  } else {
    path = `/orgs/${githubConfig.organisation}/repos`;
  }

  let options = {
    hostname: GITHUB_API_HOSTNAME,
    path: path,
    method: "POST",
    headers: {
      Authorization: getAuthorization(githubConfig),
      "User-Agent": githubConfig.user
    }
  };

  let postData = JSON.stringify({
    name: githubConfig.repository,
    description: "My fake contributions repo",
    private: githubConfig.usePrivateRepository
  });

  return request(options, postData);
}

function deleteRepository() {}

function getAuthorization(githubConfig) {
  if (githubConfig.token) {
    return `token ${githubConfig.token}`;
  }

  let credentials = new Buffer(`${githubConfig.user}:${githubConfig.password}`).toString("base64");
  return `Basic ${credentials}`;
}
