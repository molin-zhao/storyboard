FROM node:12.18.1-alpine

RUN mkdir -p /home/app/storyboard-socket

WORKDIR /home/app

COPY ./package.json ./

COPY ./common ./common

COPY ./models/ ./models

COPY ./config ./config

COPY ./storyboard-socket ./storyboard-socket

RUN npm install --production

EXPOSE 3010

CMD [ "node", "storyboard-socket/app.js"]