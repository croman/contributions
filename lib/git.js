"use strict";

let fs = require("fs");
let path = require("path");
let spawn = require("child_process").spawn;

let debug = require("debug")("contributions:git");

const CHANGES_FILE = "changes.txt";

module.exports = {
  clone: clone,
  commit: commit,
  push: push
};

function clone(githubConfig) {
  try {
    let stats = fs.statSync(githubConfig.path);
    if (stats.isDirectory()) {
      debug("Repository is already cloned");
      return Promise.resolve();
    }
  } catch (err) {
    debug("Cloning the fake repository");
  }

  let cloneUrl = `git@github.com:${githubConfig.organisation}/${githubConfig.repository}.git`;
  return runCommand("clone", "git", ["clone", cloneUrl, githubConfig.path]);
}

function runCommand(commandName, command, params, options) {
  return new Promise((resolve, reject) => {
    const ls = spawn(command, params, options);

    let stdout = "";
    let stderr = "";

    ls.stdout.on("data", data => stdout += data);
    ls.stderr.on("data", data => stderr += data);

    ls.on("close", code => {
      if (stdout) {
        debug(`'${commandName}' stdout messages: ${stdout.replace(/\n/g, " ")}`);
      }

      if (stderr) {
        debug(`'${commandName}' stderr messages: ${stderr.replace(/\n/g, " ")}`);
      }

      if (code === 0) {
        debug(`Successfully ran '${commandName}'`);
        resolve();
      } else {
        debug(`Error running '${commandName}', exit code = ${code}`);
        reject();
      }
    });
  });
}

function commit(githubConfig, commitDate) {
  let err = generateChange(githubConfig.path, "Initial commit");
  if (err) {
    return Promise.reject(err);
  }

  return runCommand("git add", "git", ["add", CHANGES_FILE], { cwd: githubConfig.path })
    .then(runCommand.bind(null, "git commit", "git", ["commit", "--date", `"${commitDate}"`, "-m", "\"Change\""],
      { cwd: githubConfig.path }));
}

function generateChange(repositoryPath, message) {
  let filePath = path.join(repositoryPath, CHANGES_FILE);
  try {
    fs.appendFileSync(filePath, message, "utf8");
  } catch (err) {
    return err;
  }
}

function push(githubConfig) {
  return runCommand("git push", "git", ["push", "origin", "master"], { cwd: githubConfig.path });
}
