FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install socket.io --save
RUN npm install @fastify/cors@^8 --save

RUN npm install

COPY . .

EXPOSE 3008

CMD ["npm", "run", "dev"]