Proiect CookFlow
Blog culinar CookFlow cu:

CMS (Joomla): Cu tema Gourmand, extensia JoomRecipe, și Apache.
Upload rețete: Fișiere (PDF/poze) procesate cu Azure Form Recognizer via iframe.
Chat real-time: WebSocket via iframe.
Chat Backend: API Go.
Chat Frontend: Angular pentru chat.
AI Frontend: Angular pentru upload.

Cerințe

Docker
kubectl
Cluster Kubernetes (ex. Minikube, AKS)
Registry Docker
Tema Gourmand (gourmand.zip) în apps/cms/config/themes/
Extensia JoomRecipe (joomrecipe.zip) în apps/cms/config/extensions/

Configurare

Descarcă Gourmand: https://www.joomshaper.com/joomla-templates/gourmand

Descarcă JoomRecipe: https://www.joomboost.com/joomla-components/joomrecipe

Plasează fișierele în apps/cms/config/themes/ și apps/cms/config/extensions/.

Clonează repository-ul:
git clone <repo-url>
cd proiect


Configurează REGISTRY în scripts/deploy.sh.


Testare locală

Rulează:
docker-compose up --build


Accesează http://localhost:8080.

Configurează Joomla (DB: cms-mysql, user: root, parolă: password).

Instalează JoomRecipe și activează Gourmand.


Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh

Acces

CMS: http://<cluster-ip>:80
Chat: http://<cluster-ip>:80/chat (iframe)
Upload: http://<cluster-ip>:80/upload (iframe)

Personalizare

Editează apps/cms/Dockerfile pentru alte teme/extensii.
Ajustează all-in-one.yaml pentru Kubernetes.

