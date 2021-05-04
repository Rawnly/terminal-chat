FROM node:10-alpine as base

COPY . .

RUN npm install
RUN npm build

# Release
FROM base as release

WORKDIR /app

COPY ./dist /app
COPY package*.json .

RUN npm install --only=production

EXPOSE 8080
CMD ["node", "index.js"]
