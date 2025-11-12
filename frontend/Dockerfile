FROM node:20

WORKDIR /frontend
COPY . .
RUN npm install -g serve
CMD ["serve", ".", "-l", "3000"]