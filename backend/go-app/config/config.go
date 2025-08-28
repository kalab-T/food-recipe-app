package config

import "os"

// HasuraURL returns the Hasura GraphQL endpoint URL for the backend.
// Reads from HASURA_URL env var, fallback to localhost (Docker Compose uses "http://hasura:8080/v1/graphql").
func HasuraURL() string {
    return getEnv("HASURA_URL", "http://localhost:8081/v1/graphql")
}

// HasuraAdminSecret returns the admin secret for Hasura.
func HasuraAdminSecret() string {
    return getEnv("HASURA_ADMIN_SECRET", "adminsecret")
}

// JWTSecret returns the JWT secret key.
func JWTSecret() string {
    return getEnv("HASURA_JWT_SECRET", "")
}

// BackendPort returns the port the backend listens on.
func BackendPort() string {
    return getEnv("PORT", "8080")
}

// getEnv fetches environment variable or returns fallback if not set.
func getEnv(key, fallback string) string {
    if value, exists := os.LookupEnv(key); exists {
        return value
    }
    return fallback
}
