FROM node:12.18.1-alpine

RUN mkdir -p /home/app/storyboard-dfs

WORKDIR /home/app

COPY ./package.json ./

COPY ./common ./common

COPY ./models/ ./models

COPY ./config ./config

COPY ./storyboard-dfs ./storyboard-dfs

RUN npm install --production

EXPOSE 3020

CMD [ "node", "storyboard-dfs/app.js"]