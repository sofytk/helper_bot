git add .
git commit -m "debug for server"
git push origin main

cd helper_bot
git init
git pull origin main

docker-compose down
docker-compose up -d --build

apt install docker.io
apt install podman-docker