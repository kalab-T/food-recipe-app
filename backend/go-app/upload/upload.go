package upload

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func UploadHandler(c *gin.Context) {
	// Parse the uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		fmt.Println("❌ Failed to parse uploaded file:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upload file"})
		return
	}

	// Define upload directory (inside backend static/images)
	uploadDir := "./static/images"

	// Create the directory if it doesn't exist
	err = os.MkdirAll(uploadDir, os.ModePerm)
	if err != nil {
		fmt.Println("❌ Failed to create directory:", uploadDir, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image directory"})
		return
	}

	// Destination file path
	dst := filepath.Join(uploadDir, file.Filename)
	fmt.Println("📂 Saving uploaded file to:", dst)

	// Save the uploaded file
	if err := c.SaveUploadedFile(file, dst); err != nil {
		fmt.Println("❌ Failed to save file:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Construct public URL to return
	publicURL := fmt.Sprintf("/images/%s", file.Filename)
	fmt.Println("✅ Upload successful:", publicURL)

	// Respond with the URL
	c.JSON(http.StatusOK, gin.H{"url": publicURL})
}
