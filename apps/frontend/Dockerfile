FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts ./
COPY index.html ./
COPY src ./src
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

