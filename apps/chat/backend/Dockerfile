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
RUN apt-get update && apt-get install -y ca-certificates nginx && rm -rf /var/lib/apt/lists/*

# Copiază binarul Go
COPY --from=builder /app/chat-backend /usr/local/bin/chat-backend

# Copiază configurația Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expune portul 88
EXPOSE 88

# Punct de intrare care pornește Nginx în background și apoi aplicația Go
ENTRYPOINT ["sh", "-c", "nginx && exec /usr/local/bin/chat-backend"]