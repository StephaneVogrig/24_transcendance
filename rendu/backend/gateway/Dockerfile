FROM node:20-alpine

RUN apk update \
	&& apk upgrade \
	&& apk add --no-cache \
		openssl \
    && rm -rf /var/cache/apk/*

# RUN mkdir -p /app/ssl/ \
#     && openssl req \
#         -x509 \
#         -nodes \
#         -newkey rsa:4096 \
#         -out /app/ssl/cert.pem \
#         -keyout /app/ssl/key.pem \
#         -subj "/C=FR/ST=NA/L=Angouleme/O=Transcendence/CN=localhost" \
#         -addext "subjectAltName=DNS:localhost,DNS:gateway,IP:127.0.0.1,IP:0.0.0.0"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src/ ./src/

EXPOSE 3000
# EXPOSE 3443

CMD ["node", "src/server.js"]
