"use strict";
const merge = require("webpack-merge");
const prodEnv = require("./prod.env");

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_HOST: '"http://localhost:3030"',
  PASSPORT_HOST: '"http://localhost:3030"',
  DFS_HOST: '"http://localhost:3030"',
  SOCKER_HOST: '"http://localhost:3030"'
});
