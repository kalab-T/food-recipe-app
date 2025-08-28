FROM golang:1.23.9

WORKDIR /app

# Copy go.mod, go.sum, and vendor folder
COPY backend/go-app/go.mod backend/go-app/go.sum backend/go-app/vendor/ ./backend/go-app/

# Copy the rest of the backend source code
COPY backend/go-app/ ./backend/go-app/

WORKDIR /app/backend/go-app

RUN go build -mod=vendor -o main .

EXPOSE 8080

CMD ["./main"]
