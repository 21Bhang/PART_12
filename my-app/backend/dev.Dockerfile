FROM node:24

WORKDIR /usr/src/app

COPY . .

RUN npm install --legacy-peer-deps

RUN npm install -g nodemon

CMD ["nodemon", "--legacy-watch", "--ext", "ts,js,mjs,cjs,json", "--exec", "node --experimental-transform-types src/index.ts"]
