const { REDIS_PROXY } = require("../config/pm2.config");
module.exports = {
  apps: [
    {
      name: "redis-proxy",
      script: "storyboard-redis-proxy/app.js",

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
      host: REDIS_PROXY,
      ref: "origin/master",
      repo: "https://github.com/RayMoore/storyboard.git",
      path: "/home/ubuntu/app/storyboard",
      "post-deploy":
        "cd Storyboard-server/ && cnpm install && pm2 reload storyboard-redis-proxy/ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production"
      }
    }
  }
};
