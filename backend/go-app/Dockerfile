FROM golang:1.23.9

WORKDIR /app

# Copy backend dependency files and vendor
COPY backend/go-app/go.mod backend/go-app/go.sum backend/go-app/vendor/ ./backend/go-app/

# Copy the rest of the backend source code
COPY backend/go-app/ ./backend/go-app/

WORKDIR /app/backend/go-app

# Build using vendor
RUN go build -mod=vendor -o main .

EXPOSE 8080

CMD ["./main"]
