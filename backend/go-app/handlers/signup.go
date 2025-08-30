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

// SignupHandler handles Hasura signup action
func SignupHandler(c *gin.Context) {
	if config.HasuraURL() == "" || config.HasuraAdminSecret() == "" {
		log.Println("❌ Hasura config missing")
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server configuration error"})
		return
	}

	// Hasura sends top-level input
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input: " + err.Error()})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	if err != nil {
		log.Printf("❌ Hashing failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to secure password"})
		return
	}

	// Insert user into Hasura
	mutation := `
	mutation ($name: String!, $email: String!, $password: String!) {
		insert_users_one(object: {name: $name, email: $email, password: $password}) {
			id
		}
	}
	`

	reqBody, _ := json.Marshal(map[string]interface{}{
		"query": mutation,
		"variables": map[string]interface{}{
			"name":     input.Name,
			"email":    input.Email,
			"password": string(hashedPassword),
		},
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
	log.Printf("🔍 Hasura signup response: %s", string(bodyBytes))

	var result struct {
		Data struct {
			InsertUser struct {
				ID string `json:"id"`
			} `json:"insert_users_one"`
		} `json:"data"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		log.Printf("❌ Parse error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Data processing error"})
		return
	}

	if len(result.Errors) > 0 {
		errorMsg := result.Errors[0].Message
		if strings.Contains(strings.ToLower(errorMsg), "duplicate") {
			errorMsg = "Email already registered"
		}
		c.JSON(http.StatusConflict, gin.H{"message": errorMsg})
		return
	}

	userID := result.Data.InsertUser.ID

	// Generate JWT
	token, err := auth.GenerateJWT(userID)
	if err != nil {
		log.Printf("❌ Failed to generate token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not generate token"})
		return
	}

	// Respond with Hasura action format
	c.JSON(http.StatusOK, gin.H{
		"user_id": userID,
		"token":   token,
	})
}
