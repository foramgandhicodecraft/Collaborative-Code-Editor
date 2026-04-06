FROM node:18-slim
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN mkdir -p /app/uploads
CMD ["node", "index.js"]
