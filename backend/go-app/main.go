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
	// Load environment variables from .env (located in same folder)
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found (proceeding with system env vars)")
	} else {
		log.Println("✅ .env file loaded successfully")
	}

	// Log loaded config values to verify
	log.Printf("HASURA_URL=%q\n", config.HasuraURL())
	log.Printf("HASURA_ADMIN_SECRET=%q\n", config.HasuraAdminSecret())
	log.Printf("PORT=%q\n", config.BackendPort())

	port := config.BackendPort()

	// Read upload directory from env or default
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./static/images"
	}

	r := gin.Default()

	// ✅ CORS middleware config (allow local + Vercel frontend)
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://food-recipe-app-m7dv.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "x-hasura-admin-secret"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ✅ Serve static image files
	r.Static("/images", uploadDir)

	// API Routes
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)

	// ✅ Upload route (no extra args needed)
	r.POST("/upload", upload.UploadHandler)

	// Start server
	log.Printf("🚀 Server running on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
