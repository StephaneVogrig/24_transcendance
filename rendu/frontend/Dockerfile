FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install @babel/core --save-dev
RUN npm i --save @types/node

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
