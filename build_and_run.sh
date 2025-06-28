#!/bin/bash
set -e

IMAGE_NAME="aws-uploader"

# Build Docker image
docker build -t "$IMAGE_NAME" .

# Run container mounting AWS credentials
docker run --rm -p 8000:8000 -v "$HOME/.aws":/root/.aws:ro "$IMAGE_NAME"
