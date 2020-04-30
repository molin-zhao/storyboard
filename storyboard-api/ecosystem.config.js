const { API } = require("../config/pm2.config");
module.exports = {
  apps: [
    {
      name: "storyboard-api",
      script: "storyboard-api/app.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    production: {
      user: "root",
      host: API,
      ref: "origin/master",
      repo: "https://github.com/RayMoore/storyboard.git",
      path: "/home/root/app/storyboard",
      "post-deploy":
        "cnpm install && pm2 reload storyboard-api/ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
