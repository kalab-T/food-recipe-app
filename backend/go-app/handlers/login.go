package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"go-app/auth"
	"go-app/config"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func LoginHandler(c *gin.Context) {
	if config.HasuraURL() == "" || config.HasuraAdminSecret() == "" {
		log.Println("❌ Hasura config missing")
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server configuration error"})
		return
	}

	var payload struct {
		Input LoginRequest `json:"input"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("❌ Invalid login request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input: " + err.Error()})
		return
	}

	input := payload.Input
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	query := `
		query($email: String!) {
			users(where: {email: {_eq: $email}}) {
				id
				name
				email
				password
			}
		}
	`

	reqBody, _ := json.Marshal(map[string]interface{}{
		"query":     query,
		"variables": map[string]interface{}{"email": input.Email},
	})

	req, _ := http.NewRequest("POST", config.HasuraURL(), bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", config.HasuraAdminSecret())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Hasura connection failed: %v", err)
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": "Service unavailable"})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Printf("🔍 Hasura login response: %s", string(bodyBytes))

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
		log.Printf("❌ Failed to parse response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Data processing error"})
		return
	}

	if len(result.Data.Users) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		return
	}

	user := result.Data.Users[0]
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		return
	}

	token, err := auth.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("❌ Failed to generate token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id": user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"token":   token,
	})
}
