package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"go-app/auth"
)

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hasuraURL := os.Getenv("HASURA_URL")
	adminSecret := os.Getenv("HASURA_ADMIN_SECRET")

	query := map[string]interface{}{
		"query": `query ($email: String!, $password: String!) {
			users(where: {email: {_eq: $email}, password: {_eq: $password}}) {
				id
			}
		}`,
		"variables": map[string]string{
			"email":    input.Email,
			"password": input.Password,
		},
	}

	body, _ := json.Marshal(query)
	req, _ := http.NewRequest("POST", hasuraURL, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", adminSecret) // 🔑 Important

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to contact Hasura"})
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid Hasura response"})
		return
	}

	users := result["data"].(map[string]interface{})["users"].([]interface{})
	if len(users) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	userID := users[0].(map[string]interface{})["id"].(string)

	// Generate JWT
	token, err := auth.GenerateJWT(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   token,
		"user_id": userID,
	})
}
