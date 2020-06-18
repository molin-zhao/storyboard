const { REDIS_PROXY } = require("../config/pm2.config");
module.exports = {
  apps: [
    {
      name: "redis-proxy",
      script: "app.js",
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
      user: "ubuntu",
      host: REDIS_PROXY,
      ref: "origin/master",
      repo: "https://github.com/RayMoore/storyboard.git",
      path: "/home/ubuntu/app/storyboard",
      "post-deploy":
        "cd storyboard-redis-proxy && cnpm install && pm2 reload ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
