"use strict";

const spawn = require("child_process").spawn;

let debug = require("debug")("contributions:git");

module.exports = {
  clone: clone
};

function clone(githubConfig) {
  let cloneUrl = `git@github.com:${githubConfig.organisation}/${githubConfig.repository}.git`;

  return new Promise((resolve, reject) => {
    const ls = spawn("git", ["clone", cloneUrl, `../${githubConfig.repository}`]);

    let stdout = "";
    let stderr = "";

    ls.stdout.on("data", data => stdout += data);
    ls.stderr.on("data", data => stderr += data);

    ls.on("close", code => {
      if (stdout) {
        debug(`Clone stdout messages: ${stdout}`);
      }

      if (stderr) {
        debug(`Clone stderr messages: ${stderr}`);
      }

      if (code === 0) {
        debug("Successfully cloned the repository");
        resolve();
      } else {
        debug(`Error cloning the repository, exit code = ${code}`);
        reject();
      }
    });
  });
}
