FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install @babel/core --save-dev
RUN npm i --save @types/node
RUN npm install @babylonjs/core

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
