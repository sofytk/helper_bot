FROM nginx:alpine

# Копирование статических файлов в nginx html директорию
COPY . /usr/share/nginx/html

# Nginx по умолчанию слушает на порту 80, но нам нужен 3000
# Создаем кастомный конфиг для порта 3000
RUN echo 'server { \
    listen 3000; \
    listen [::]:3000; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$ { \
        expires 7d; \
        add_header Cache-Control "public, max-age=604800, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
