FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install vector2d
RUN npm install

COPY . .

EXPOSE 3004

CMD ["npm", "run", "dev"]