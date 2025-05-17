# Builder - compilare cu golang oficial (Debian based)
FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o chat-backend

# Imagine finală cu Debian Bullseye Slim (are glibc 2.31, deci poți testa sau să mergi la bookworm pentru 2.34)
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/chat-backend /chat-backend

EXPOSE 88

ENTRYPOINT ["/chat-backend"]
