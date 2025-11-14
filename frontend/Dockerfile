# FROM node:20

# WORKDIR /frontend
# COPY . .
# RUN npm install -g serve
# CMD ["serve", ".", "-l", "3000"]

FROM nginx:alpine

# Удаляем дефолтный конфиг (чтобы не было конфликтов)
RUN rm -rf /usr/share/nginx/html/*

# Копируем весь фронт
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

CMD ["nginx", "-g", "daemon off;"]