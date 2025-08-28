package main

import (
	"log"
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

	// ✅ Serve static image files from ./static/images
	r.Static("/images", "./static/images")

	// API Routes
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)

	// ✅ Make sure uploads go into ./static/images
	r.POST("/upload", func(c *gin.Context) {
		upload.UploadHandler(c, "./static/images")
	})

	// Start server
	log.Printf("🚀 Server running on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
