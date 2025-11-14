# FROM node:20

# WORKDIR /frontend
# COPY . .
# RUN npm install -g serve
# CMD ["serve", ".", "-l", "3000"]

FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]