package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go-app/handlers"
	"go-app/upload"
)

func main() {
	// Load PORT from environment or fallback to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Println("⚠️ PORT env not set, defaulting to 8080")
	}

	hasuraURL := os.Getenv("HASURA_URL")
	hasuraAdminSecret := os.Getenv("HASURA_GRAPHQL_ADMIN_SECRET")
	if hasuraURL == "" || hasuraAdminSecret == "" {
		log.Println("⚠️ Hasura config missing")
	} else {
		log.Printf("✅ Hasura URL: %s", hasuraURL)
	}

	frontendOrigin := os.Getenv("FRONTEND_URL")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:3000"
	}

	r := gin.Default()

	// CORS middleware config
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "x-hasura-admin-secret"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Serve static image files
	r.Static("/images", "./static/images")

	// API Routes
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)
	r.POST("/upload", upload.UploadHandler)

	// Start server
	log.Printf("🚀 Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
