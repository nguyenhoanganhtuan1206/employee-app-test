FROM node:lts as dist
COPY package.json yarn.lock ./

RUN yarn install 

COPY . ./

RUN yarn build:prod

FROM node:lts as node_modules
COPY package.json yarn.lock ./

RUN yarn install

FROM node:lts as base
COPY package.json ./

FROM node:lts
WORKDIR /app

COPY --from=dist dist /app/dist
COPY --from=node_modules node_modules /app/node_modules
COPY --from=base package.json /app/package.json

CMD ["yarn", "start:prod"]
