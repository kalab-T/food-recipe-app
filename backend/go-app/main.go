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

	r := gin.Default()

	// CORS middleware config
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000", // local dev
			"https://food-recipe-kit0a86s8-kalabs-projects-1e20c180.vercel.app", // live Vercel frontend
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "x-hasura-admin-secret"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Serve images via route (reliable on Render)
	r.GET("/images/:filename", func(c *gin.Context) {
		file := c.Param("filename")
		wd, err := os.Getwd()
		if err != nil {
			log.Printf("❌ Failed to get working directory: %v", err)
			c.Status(500)
			return
		}
		c.File(wd + "/static/images/" + file)
	})

	// API Routes
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)
	r.POST("/upload", upload.UploadHandler)

	// Start server
	log.Printf("🚀 Server running on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
