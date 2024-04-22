FROM nikolaik/python-nodejs:python3.10-nodejs18
WORKDIR /app
COPY package.json ./

RUN npm install

COPY . .

RUN npm run build
ENTRYPOINT ["npm", "start"]
