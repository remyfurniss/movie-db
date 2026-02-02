FROM node:20-alpine

WORKDIR /app

RUN npm install -g npm@latest

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
