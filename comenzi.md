docker-compose config
docker-compose up --build -d
docker-compose ps

modif fisiere sursa -> reconstruire
docker-compose up --build -d

#oprire + eliminare containere
docker-compose down

#+stergere volume
docker-compose down -v 

![alt text](image.png)

Containerul oficial Joomla are anumite limitări - unele versiuni necesită completarea formularului web chiar dacă variabilele de mediu sunt prezente.

in chat/frontend:
sudo npm install -g @angular/cli
ng version -> >17 nu am nevoie de module
ng new frontend --directory . --skip-git --style=css --routing=false --standalone
npm install
ng serve

// stergere containere pornite
odcker-compose down --remove-orphans


// stergere volume
docker volume prune -f

// stergere tuturor imaginilor docker
docker rmi $(docker images -q) -f

docker images -q => afiseaza id urile locale ale imaginilor
rmi -> cand stergem 1/ mai mult img

docker build -t myapp:1.0 .

// contruiesti ce e acolo
docker-compose build

+ pornire
docker-compose up --build


BACKEND


// creare automata go.mod go.sum
go mod init chat-backend
go get github.com/gorilla/websocket
go get github.com/go-sql-driver/mysql
go mod tidy

docker exec -it mysql-chat  mysql -u root -p

USE chat_db;
SHOW TABLES;
SELECT * FROM messages;
