package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"go-app/auth"
)

type SignupInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func SignupHandler(c *gin.Context) {
	var input SignupInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Build Hasura mutation
	hasuraURL := os.Getenv("HASURA_URL")
	adminSecret := os.Getenv("HASURA_ADMIN_SECRET")

	mutation := map[string]interface{}{
		"query": `mutation ($name: String!, $email: String!, $password: String!) {
			insert_users_one(object: {name: $name, email: $email, password: $password}) {
				id
			}
		}`,
		"variables": map[string]string{
			"name":     input.Name,
			"email":    input.Email,
			"password": input.Password,
		},
	}

	body, _ := json.Marshal(mutation)
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

	userData := result["data"].(map[string]interface{})["insert_users_one"]
	if userData == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User insert failed"})
		return
	}
	userID := userData.(map[string]interface{})["id"].(string)

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
