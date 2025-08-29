package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"go-app/config"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type SignupRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func SignupHandler(c *gin.Context) {
	if config.HasuraURL() == "" || config.HasuraAdminSecret() == "" {
		log.Println("❌ Hasura config missing")
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server configuration error"})
		return
	}

	var payload struct {
		Input SignupRequest `json:"input"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input: " + err.Error()})
		return
	}

	input := payload.Input
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to secure password"})
		return
	}

	mutation := `
	mutation($name: String!, $email: String!, $password: String!) {
		insert_users_one(object: {name: $name, email: $email, password: $password}) {
			id
			name
			email
		}
	}`

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
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": "Service unavailable"})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Registration failed",
			"detail":  string(bodyBytes),
		})
		return
	}

	var result struct {
		Data struct {
			InsertUser struct {
				ID    string `json:"id"`
				Name  string `json:"name"`
				Email string `json:"email"`
			} `json:"insert_users_one"`
		} `json:"data"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
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

	user := result.Data.InsertUser

	c.JSON(http.StatusCreated, gin.H{
		"user_id": user.ID,
		"name":    user.Name,
		"email":   user.Email,
	})
}
