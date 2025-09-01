package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

// LoginRequest represents login input
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents login output
type LoginResponse struct {
	Token string `json:"token"`
}

// HasuraQueryResponse represents the GraphQL response from Hasura
type HasuraQueryResponse struct {
	Data struct {
		Users []struct {
			ID       string `json:"id"`
			Email    string `json:"email"`
			Password string `json:"password"`
		} `json:"users"`
	} `json:"data"`
}

// LoginHandler handles login
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Query Hasura for the user
	query := fmt.Sprintf(`{
		users(where: {email: {_eq: "%s"}}) {
			id
			email
			password
		}
	}`, req.Email)

	hasuraReq := map[string]string{"query": query}
	reqBody, _ := json.Marshal(hasuraReq)

	hasuraURL := os.Getenv("HASURA_GRAPHQL_ENDPOINT")
	reqGraph, _ := http.NewRequest("POST", hasuraURL, bytes.NewBuffer(reqBody))
	reqGraph.Header.Set("Content-Type", "application/json")
	reqGraph.Header.Set("x-hasura-admin-secret", os.Getenv("HASURA_ADMIN_SECRET"))

	client := &http.Client{}
	resp, err := client.Do(reqGraph)
	if err != nil {
		http.Error(w, "Failed to query Hasura", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	var hasuraResp HasuraQueryResponse
	if err := json.Unmarshal(body, &hasuraResp); err != nil {
		http.Error(w, "Failed to parse Hasura response", http.StatusInternalServerError)
		return
	}

	if len(hasuraResp.Data.Users) == 0 {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	user := hasuraResp.Data.Users[0]

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
		"iat":   time.Now().Unix(),
		"https://hasura.io/jwt/claims": map[string]interface{}{
			"x-hasura-allowed-roles": []string{"user"},
			"x-hasura-default-role":  "user",
			"x-hasura-user-id":       user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(LoginResponse{Token: tokenString})
}
