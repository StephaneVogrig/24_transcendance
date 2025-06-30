FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN apk add --no-cache python3 make g++ sqlite
RUN npm install

COPY . .

EXPOSE 3003

CMD ["npm", "run", "dev"]