#!/bin/bash

# Configurări
REGISTRY="myregistry"
TAG="latest"

# Build imaginile Docker
echo "Building CMS image..."
docker build -t ${REGISTRY}/cms:${TAG} ./apps/cms
echo "Building Chat Backend image..."
docker build -t ${REGISTRY}/chat-backend:${TAG} ./apps/chat-backend
echo "Building Chat Frontend image..."
docker build -t ${REGISTRY}/chat-frontend:${TAG} ./apps/chat-frontend
echo "Building AI Frontend image..."
docker build -t ${REGISTRY}/ai-frontend:${TAG} ./apps/ai-frontend

# Push imaginile către registry
docker push ${REGISTRY}/cms:${TAG}
docker push ${REGISTRY}/chat-backend:${TAG}
docker push ${REGISTRY}/chat-frontend:${TAG}
docker push ${REGISTRY}/ai-frontend:${TAG}

# Aplică resursele Kubernetes
echo "Applying Kubernetes resources..."
kubectl apply -f ./kubernetes/all-in-one.yaml