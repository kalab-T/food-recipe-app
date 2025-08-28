FROM golang:1.23.9

WORKDIR /app

# Copy dependency files and vendor folder
COPY go.mod go.sum vendor/ ./

# Copy the rest of the backend source code
COPY . .

# Build using vendor folder
RUN go build -mod=vendor -o main .

EXPOSE 8080

CMD ["./main"]
