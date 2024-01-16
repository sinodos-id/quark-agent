FROM nikolaik/python-nodejs:python3.10-nodejs18
WORKDIR /app
COPY . .
RUN yarn && yarn build
ENTRYPOINT ["yarn", "start:prod"]
