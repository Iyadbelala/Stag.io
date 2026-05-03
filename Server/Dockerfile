FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY dist/index.js ./
EXPOSE 5000
CMD ["node", "index.js"]
