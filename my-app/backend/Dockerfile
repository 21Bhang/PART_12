FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

COPY . .

CMD ["node", "--experimental-transform-types", "src/index.ts"]
