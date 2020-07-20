FROM node:12.18.1-alpine

RUN mkdir -p /home/app/storyboard-passport

WORKDIR /home/app

COPY ./package.json ./

COPY ./common ./common

COPY ./models/ ./models

COPY ./config ./config

COPY ./storyboard-passport ./storyboard-passport

RUN npm install --production

EXPOSE 3030

CMD [ "node", "storyboard-passport/app.js"]