FROM node:18-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY . .
RUN npm install
RUN mkdir -p uploads
CMD ["node", "server.js"]
