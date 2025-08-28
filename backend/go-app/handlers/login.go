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

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginRequest struct {
	Input LoginInput `json:"input" binding:"required"`
}

type LoginResponse struct {
	Token  string `json:"token"`
	UserID string `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
}

func LoginHandler(c *gin.Context) {
	if config.HasuraURL() == "" || config.HasuraAdminSecret() == "" {
		log.Println("❌ Hasura config missing")
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server config error"})
		return
	}

	// Read body
	rawBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("❌ Could not read request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(rawBody))

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ Invalid login request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input: " + err.Error()})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Input.Email))
	password := strings.TrimSpace(req.Input.Password)

	// Query Hasura for the user by email
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
		"variables": map[string]interface{}{"email": email},
	})

	httpReq, _ := http.NewRequest("POST", config.HasuraURL(), bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-hasura-admin-secret", config.HasuraAdminSecret())

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		log.Printf("❌ Hasura connection failed: %v", err)
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": "Service unavailable"})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Printf("📨 Hasura response: %s", string(bodyBytes))

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
		log.Printf("❌ Failed to parse Hasura response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid server response"})
		return
	}

	if len(result.Errors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"message": result.Errors[0].Message})
		return
	}

	if len(result.Data.Users) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		return
	}

	user := result.Data.Users[0]

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		return
	}

	// Generate JWT
	token, err := auth.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("❌ JWT generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:  token,
		UserID: user.ID,
		Name:   user.Name,
		Email:  user.Email,
	})
}
