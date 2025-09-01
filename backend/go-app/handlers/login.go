package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

// LoginRequest defines the structure for login input
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse defines the structure for login response
type LoginResponse struct {
	Token string `json:"token"`
}

// HasuraUserQueryResponse represents the Hasura GraphQL response
type HasuraUserQueryResponse struct {
	Data struct {
		Users []struct {
			ID       string `json:"id"`
			Email    string `json:"email"`
			Password string `json:"password"`
		} `json:"users"`
	} `json:"data"`
}

// LoginHandler verifies user credentials and returns JWT
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Prepare GraphQL query
	query := `
	query GetUserByEmail($email: String!) {
		users(where: {email: {_eq: $email}}) {
			id
			email
			password
		}
	}`
	vars := map[string]interface{}{
		"email": req.Email,
	}

	// Send request to Hasura
	resp, err := sendHasuraRequest(query, vars)
	if err != nil {
		http.Error(w, fmt.Sprintf("Hasura request failed: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var result HasuraUserQueryResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		http.Error(w, "Failed to decode response", http.StatusInternalServerError)
		return
	}

	// Check if user exists
	if len(result.Data.Users) == 0 {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	user := result.Data.Users[0]

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   user.ID,
		"email":     user.Email,
		"exp":       time.Now().Add(time.Hour * 72).Unix(),
		"hasura_claims": map[string]interface{}{
			"x-hasura-allowed-roles": []string{"user"},
			"x-hasura-default-role":  "user",
			"x-hasura-user-id":       user.ID,
		},
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Send back response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LoginResponse{Token: tokenString})
}
