const { PM2_NODES } = require("../config");
module.exports = {
  apps: [
    {
      name: "storyboard-passport",
      script: "storyboard-passport/app.js",

      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "root",
      host: PM2_NODES.PASSPORT,
      ref: "origin/master",
      repo: "https://github.com/RayMoore/storyboard.git",
      path: "/home/root/app/storyboard",
      "post-deploy":
        "cd Storyboard-server/ && npm install && pm2 reload storyboard-passport/ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production"
      }
    }
  }
};
