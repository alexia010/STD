# # Builder - compilare cu golang oficial 
# FROM golang:1.24 AS builder

# WORKDIR /app

# COPY go.mod go.sum ./
# RUN go mod download

# COPY . .

# RUN go build -o chat-backend  
# #binar go - foloseste glibc  (biblioteca runtime)

# # Imagine finală cu Debian Bullseye Slim (are glibc 2.31, deci poți testa sau să mergi la bookworm pentru 2.34)
# FROM debian:bookworm-slim

# RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# COPY --from=builder /app/chat-backend /chat-backend

# EXPOSE 88

# ENTRYPOINT ["/chat-backend"]

# # debian:bookworm-slim asigura compatibilitatea cu binarul compilat 


# Builder - compilare cu golang oficial
FROM golang:1.24 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o chat-backend

# Imagine finală cu Debian
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates nginx dnsutils iputils-ping curl && rm -rf /var/lib/apt/lists/*

# Copiază binarul Go
COPY --from=builder /app/chat-backend /usr/local/bin/chat-backend

# Copiază configurația Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Creează un script de startup
RUN echo '#!/bin/sh\n\
echo "Environment variables:"\n\
env | grep DB_\n\
echo "\nDNS resolution test:"\n\
nslookup chat-mysql\n\
echo "\nPing test:"\n\
ping -c 1 chat-mysql\n\
echo "\nStarting services..."\n\
nginx && exec /usr/local/bin/chat-backend' > /start.sh && \
chmod +x /start.sh

# Expune portul 88
EXPOSE 88

# Folosește scriptul de startup
ENTRYPOINT ["/start.sh"]