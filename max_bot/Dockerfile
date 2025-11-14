FROM node:18-alpine

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm install --omit=dev --production

# Копирование кода приложения
COPY . .

# Запуск приложения
CMD ["npm", "start"]
