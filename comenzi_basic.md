# Build all service images defined in docker-compose.yml
docker-compose build

# Build specific services only
docker-compose build frontend backend

# Build without using cache (forces complete rebuild)
docker-compose build --no-cache

# Build with specific arguments
docker-compose build --build-arg NODE_ENV=production frontend

# ===============================================================
# STARTING SERVICES
# ===============================================================

# Create and start containers (shows logs in terminal)
docker-compose up

# Create and start containers in detached mode (background)
docker-compose up -d

# Create and start containers after rebuilding images
docker-compose up --build

# Start only specific services
docker-compose up backend mysql

# Create and start containers with scale (multiple instances)
docker-compose up -d --scale frontend=2

# ===============================================================
# STOPPING SERVICES
# ===============================================================

# Stop running containers (preserves containers for restart)
docker-compose stop

# Stop specific services
docker-compose stop frontend

# Stop and remove containers, networks (preserves volumes)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v

# Stop services with timeout (seconds)
docker-compose stop --timeout 30

# ===============================================================
# RESTARTING SERVICES
# ===============================================================

# Restart all services
docker-compose restart

# Restart specific services
docker-compose restart frontend

# ===============================================================
# SERVICE MANAGEMENT
# ===============================================================

# Start existing containers (won't create new ones)
docker-compose start

# Pause services (freeze containers without stopping)
docker-compose pause

# Unpause services
docker-compose unpause

# ===============================================================
# INFORMATION & LOGS
# ===============================================================

# View running services
docker-compose ps

# View all services (including stopped)
docker-compose ps -a

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines of logs
docker-compose logs --tail 100

# ===============================================================
# EXECUTING COMMANDS
# ===============================================================

# Run a command in a running container
docker-compose exec backend sh

# Run a command in a new container
docker-compose run --rm frontend npm test

# ===============================================================
# CLEANUP COMMANDS
# ===============================================================

# Remove stopped service containers
docker-compose rm

# Remove orphaned containers (not in compose file)
docker-compose down --remove-orphans

# Clear unused images after build
docker image prune -f

# Clear all unused objects (including volumes)
docker system prune -a

# ===============================================================
# PRACTICAL WORKFLOWS FOR YOUR CHAT APPLICATION
# ===============================================================

# WORKFLOW 1: FIRST TIME SETUP
# Build and start everything fresh
export DOCKER_BUILDKIT=1  # Enable BuildKit to reduce intermediate images
export COMPOSE_DOCKER_CLI_BUILD=1
docker-compose build
docker-compose up -d
docker image prune -f  # Clean up intermediate images

# WORKFLOW 2: DAILY DEVELOPMENT
# Start all services in background
docker-compose up -d
# View logs of backend while working
docker-compose logs -f backend
# When done for the day
docker-compose stop

# WORKFLOW 3: CODE CHANGES
# When you change frontend/backend code
docker-compose build frontend  # Only rebuild what changed
docker-compose up -d  # Update running containers
docker image prune -f  # Clean up

# WORKFLOW 4: RESET EVERYTHING
# Complete reset (fresh start)
docker-compose down -v
docker-compose up --build -d
docker image prune -f

# WORKFLOW 5: DEBUGGING
# Access MySQL shell
docker-compose exec mysql mysql -uchat_user -pchat_pass chat_db
# Check backend logs
docker-compose logs backend
# Get a shell in the backend container
docker-compose exec backend sh

# ===============================================================
# PRODUCTION DEPLOYMENT COMMANDS
# ===============================================================

# Run in production mode with specific compose file
docker-compose -f docker-compose.prod.yml up -d

# Deploy to a swarm (if using swarm mode)
docker stack deploy -c docker-compose.yml chat-app

## pornire deployment fara docker-compsoe

docker network create chat-network


# MYSQL 
# pornire mysql, deja avem imag 
docker run -d \
  --name mysql-chat \
  --network chat-network \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=chat_db \
  -e MYSQL_USER=chat_user \
  -e MYSQL_PASSWORD=chat_pass \
  -p 3306:3306 \
  -v "$(pwd)/init:/docker-entrypoint-initdb.d" \
  -v mysql-data:/var/lib/mysql \
  --restart always \
  mysql:8

# BECKEND
docker build -t chat-backend:latest ./apps/chat/backend

# run chat
docker run -d \
  --name chat-backend \
  --network chat-network \
  -e DB_HOST=mysql-chat \
  -e DB_PORT=3306 \
  -e DB_USER=chat_user \
  -e DB_PASS=chat_pass \
  -e DB_NAME=chat_db \
  -p 88:88 \
  --restart always \
  chat-backend:latest

  # FRONTEND
  docker build -t chat-frontend:latest ./apps/chat/frontend

  docker run -d \
  --name chat-frontend \
  --network chat-network \
  -p 90:90 \
  --restart always \
  chat-frontend:latest


  docker logs -f chat-backend
  docker exec -it mysql-chat mysql -uchat_user -pchat_pass chat_db
  docker rm -f chat-frontend

  