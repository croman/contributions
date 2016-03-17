"use strict";

let https = require("https");

module.exports = makeRequest;

/**
 * Make a request to an external service and return the results.
 *
 * @param {Object} options - the request options
 * @param {String} bodyData - the optional body data
 * @returns {Promise} - resolved with an Object with "data", "statusCode" and "headers" keys
 */
function makeRequest(options, bodyData) {
  return new Promise((resolve, reject) => {
    let req = https.request(options, res => {
      let content = "";

      res.setEncoding("utf8");

      res.on("data", chunk => {
        content += chunk;
      });

      res.on("end", () => {
        try {
          let data = JSON.parse(content);
          resolve({
            data: data,
            statusCode: res.statusCode,
            headers: res.headers
          });
        } catch (err) {
          reject(new Error(`Data received has incorrect JSON format: ${err}`));
        }
      });
    });

    req.on("error", err => {
      reject(new Error(`Error during request: ${err}`));
    });

    if (bodyData) {
      req.write(bodyData);
    }

    req.end();
  });
}
