package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"strings"

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

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	// Load Hasura config from environment
	hasuraURL := os.Getenv("HASURA_URL")
	hasuraAdminSecret := os.Getenv("HASURA_GRAPHQL_ADMIN_SECRET")

	if hasuraURL == "" || hasuraAdminSecret == "" {
		http.Error(w, "Hasura configuration not set", http.StatusInternalServerError)
		return
	}

	var gqlReq GraphQLRequest
	if err := json.NewDecoder(r.Body).Decode(&gqlReq); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Extract variables
	input := gqlReq.Variables

	// Validate fields
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Password) == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// GraphQL mutation to insert user into Hasura
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
		http.Error(w, "Failed to create Hasura request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-hasura-admin-secret", hasuraAdminSecret)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to send request to Hasura", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		http.Error(w, "Failed to parse Hasura response", http.StatusInternalServerError)
		return
	}

	// Simulate JWT token creation (replace with real JWT logic later)
	token := "dummy-jwt-token"

	// Build GraphQL-style response
	response := map[string]interface{}{
		"data": map[string]interface{}{
			"signup": map[string]interface{}{
				"user":  result["data"], // inserted user info
				"token": token,
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
