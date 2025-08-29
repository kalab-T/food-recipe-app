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
	var payload LoginRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(payload.Email))

	// Query user by email using admin-secret
	query := `
	query($email: String!) {
		users(where: {email: {_eq: $email}}) {
			id
			password
			name
			email
		}
	}`

	reqBody, _ := json.Marshal(map[string]interface{}{
		"query":     query,
		"variables": map[string]interface{}{"email": email},
	})

	req, _ := http.NewRequest("POST", config.HasuraURL(), bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", config.HasuraAdminSecret())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": "Service unavailable"})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	var result struct {
		Data struct {
			Users []struct {
				ID       string `json:"id"`
				Password string `json:"password"`
				Name     string `json:"name"`
				Email    string `json:"email"`
			} `json:"users"`
		} `json:"data"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil || len(result.Data.Users) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	user := result.Data.Users[0]

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	// Generate JWT
	token, err := auth.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id": user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"token":   token,
	})
}
