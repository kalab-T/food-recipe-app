package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"go-app/auth"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func LoginHandler(c *gin.Context) {
	// 1. Read Hasura env like signup
	hasuraURL := os.Getenv("HASURA_URL")
	hasuraAdminSecret := os.Getenv("HASURA_GRAPHQL_ADMIN_SECRET")
	if hasuraURL == "" || hasuraAdminSecret == "" {
		log.Println("❌ Hasura config missing")
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server configuration error"})
		return
	}

	// 2. Parse input
	var payload struct {
		Input LoginRequest `json:"input"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input: " + err.Error()})
		return
	}

	input := payload.Input
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	// 3. Query user from Hasura
	query := `
	query($email: String!) {
		users(where: {email: {_eq: $email}}) {
			id
			name
			email
			password
		}
	}`

	reqBody, _ := json.Marshal(map[string]interface{}{
		"query":     query,
		"variables": map[string]interface{}{"email": input.Email},
	})

	req, _ := http.NewRequest("POST", hasuraURL, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", hasuraAdminSecret)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Hasura request failed: %v", err)
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": "Service unavailable"})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database service error", "detail": string(bodyBytes)})
		return
	}

	var result struct {
		Data struct {
			Users []struct {
				ID       string `json:"id"`
				Name     string `json:"name"`
				Email    string `json:"email"`
				Password string `json:"password"`
			} `json:"users"`
		} `json:"data"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Data processing error"})
		return
	}

	if len(result.Errors) > 0 || len(result.Data.Users) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		return
	}

	user := result.Data.Users[0]

	// 4. Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		return
	}

	// 5. Generate JWT
	token, err := auth.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not generate token"})
		return
	}

	// 6. Return response
	c.JSON(http.StatusOK, gin.H{
		"user_id": user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"token":   token,
	})
}
