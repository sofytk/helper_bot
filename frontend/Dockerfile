# # FROM node:20

# # WORKDIR /frontend
# # COPY . .
# # RUN npm install -g serve
# # CMD ["serve", ".", "-l", "3000"]

FROM docker.io/library/nginx:alpine
# RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html

# CMD ["nginx", "-g", "daemon off;"]