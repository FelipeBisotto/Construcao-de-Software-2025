FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund --silent
COPY tsconfig.json vite.config.ts ./
COPY index.html ./
COPY src ./src
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
