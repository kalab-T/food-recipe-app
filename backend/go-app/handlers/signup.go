package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type GraphQLRequest struct {
	OperationName string          `json:"operationName"`
	Query         string          `json:"query"`
	Variables     SignupInputVars `json:"variables"`
}

type SignupInputVars struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func SignupHandler(c *gin.Context) {
	// Load Hasura config from environment
	hasuraURL := os.Getenv("HASURA_URL")
	hasuraAdminSecret := os.Getenv("HASURA_GRAPHQL_ADMIN_SECRET")

	if hasuraURL == "" || hasuraAdminSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hasura configuration not set"})
		return
	}

	var gqlReq GraphQLRequest
	if err := c.BindJSON(&gqlReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	input := gqlReq.Variables

	// Validate fields
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	// GraphQL mutation
	mutation := `
		mutation($name: String!, $email: String!, $password: String!) {
			insert_users_one(object: {name: $name, email: $email, password: $password}) {
				id
				name
				email
			}
		}
	`

	payload := map[string]interface{}{
		"query": mutation,
		"variables": map[string]interface{}{
			"name":     input.Name,
			"email":    input.Email,
			"password": string(hashedPassword),
		},
	}

	payloadBytes, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", hasuraURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Hasura request"})
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", hasuraAdminSecret)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request to Hasura"})
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse Hasura response"})
		return
	}

	// Dummy JWT token
	token := "dummy-jwt-token"

	// GraphQL-style response
	response := map[string]interface{}{
		"data": map[string]interface{}{
			"signup": map[string]interface{}{
				"user":  result["data"],
				"token": token,
			},
		},
	}

	c.JSON(http.StatusOK, response)
}
