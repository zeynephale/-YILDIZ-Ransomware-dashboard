FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM golang:1.25-alpine AS backend
WORKDIR /src
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server .

FROM alpine:3.20
WORKDIR /app
RUN adduser -D -u 10001 cti

COPY --from=backend  /server        /app/server
COPY --from=frontend /app/dist      /app/web
COPY data.csv                       /app/data.csv

ENV STATIC_DIR=/app/web \
    DATA_CSV=/app/data.csv \
    PORT=8080

USER cti
EXPOSE 8080
CMD ["/app/server"]
