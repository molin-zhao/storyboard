FROM node:12.18.1-alpine

RUN mkdir -p /home/app/storyboard-api

WORKDIR /home/app

COPY ./package.json ./

COPY ./common ./common

COPY ./models/ ./models

COPY ./config ./config

COPY ./storyboard-api ./storyboard-api

RUN npm install --production

EXPOSE 3000

CMD [ "node", "storyboard-api/app.js"]