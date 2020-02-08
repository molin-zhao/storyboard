const { NODES } = require("../config");
module.exports = {
  apps: [
    {
      name: "redis-proxy",
      script: "Storyboard-server/storyboard-redis-proxy/app.js",

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
      user: "ubuntu",
      host: NODES.CHENGDU,
      ref: "origin/master",
      repo: "https://github.com/RayMoore/storyboard.git",
      path: "/home/ubuntu/app",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production"
      }
    }
  }
};
