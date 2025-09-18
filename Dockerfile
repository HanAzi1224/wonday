FROM keymetrics/pm2:18-alpine
# FROM node:7.8

RUN apk add --no-cache curl
# RUN apt-get update && apt-get install -y build-essential python

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

EXPOSE 4001:4001

WORKDIR /app

COPY ./package*.json ./
RUN npm i --production
# RUN sudo apt-get update
# RUN sudo apt-get install -y build-essential python
# RUN npm i --development

COPY ./ ./

CMD ["sh", "-c", "NODE_ENV=$NODE_ENV pm2-runtime --json pm2Server.json"]
