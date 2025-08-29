package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go-app/config"
	"go-app/handlers"
	"go-app/upload"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found (proceeding with system env vars)")
	} else {
		log.Println("✅ .env file loaded")
	}

	port := config.BackendPort()
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./static/images"
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://food-recipe-app-m7dv.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "x-hasura-admin-secret"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Static("/images", uploadDir)

	// API routes
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)

	// Upload route
	r.POST("/upload", upload.UploadHandler)

	log.Printf("🚀 Server running on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
