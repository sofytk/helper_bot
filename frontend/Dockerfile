FROM node:20-slim

WORKDIR /frontend

# Копирование файлов
COPY . .

# Установка serve глобально
RUN npm install -g serve

# Запуск сервера
CMD ["serve", ".", "-l", "3000", "--host", "0.0.0.0"]
