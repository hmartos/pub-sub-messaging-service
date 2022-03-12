# First step of multistep build - Install dependencies
FROM node:14-alpine as build

WORKDIR /pub-sub-messaging-service

COPY package*.json ./

RUN npm install --production

# Last step of multistep build - Copy dependencies and files
FROM node:14-alpine

WORKDIR /pub-sub-messaging-service

USER node

COPY --chown=node:node --from=build /pub-sub-messaging-service/node_modules ./node_modules
COPY --chown=node:node ./src .

EXPOSE 3000

CMD ["node", "./bin/www"]

#TODO SIGINT SIGNAL