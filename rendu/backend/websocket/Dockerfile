FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./

RUN npm install socket.io@4.6.1 --save
RUN npm install

COPY . .

EXPOSE 3008

CMD ["npm", "run", "dev"]