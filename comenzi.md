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

