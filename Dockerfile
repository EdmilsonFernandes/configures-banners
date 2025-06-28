FROM node:20 AS frontend
WORKDIR /frontend
COPY aws-uploader-frontend/package.json aws-uploader-frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm \
    && pnpm install
COPY aws-uploader-frontend/ ./
RUN pnpm run build

FROM python:3.11-slim AS backend
WORKDIR /app
COPY aws-image-uploader/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY aws-image-uploader/ ./
COPY --from=frontend /frontend/dist ./src/static
EXPOSE 8000
CMD ["python", "src/main.py"]
