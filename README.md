git add .
git commit -m "debug for server"
git push origin main

cd helper_bot
git init
git pull origin main

cd $HOME
docker-compose down -v
docker-compose up -d --build
