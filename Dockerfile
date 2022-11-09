FROM node:18-alpine
# Create app directory
WORKDIR /usr/src/app/

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "npm", "start" ]