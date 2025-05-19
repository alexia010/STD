package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func InitDB() {
	var err error

	// Obținem credențialele din variabilele de mediu
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")

	// Verificăm dacă toate variabilele necesare sunt setate
	if dbHost == "" || dbPort == "" || dbUser == "" || dbPass == "" || dbName == "" {
		log.Fatal("Variabilele de mediu pentru baza de date nu sunt setate corect")
	}

	// Construim string-ul de conexiune
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		dbUser, dbPass, dbHost, dbPort, dbName)

	for i := 0; i < 20; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Conectare la DB realizată cu succes.")
				createTable()
				return
			}
		}
		log.Printf("DB inaccesibilă (încercare %d/20): %v. Reîncerc în 3 sec...", i+1, err)
		time.Sleep(3 * time.Second)
	}
	log.Fatal("Nu s-a putut realiza conexiunea la baza de date după 20 de încercări")
}

// Helper function to get environment variable with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func createTable() {
	// Creează tabelul messages dacă nu există
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS messages (
			id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(255) NOT NULL,
			message TEXT NOT NULL,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatalf("Eroare la crearea tabelului messages: %v", err)
	}
}

func SaveMessage(msg Message) error {
	stmt, err := db.Prepare("INSERT INTO messages(username, message, timestamp) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(msg.Username, msg.Message, msg.Timestamp)
	return err
}

func GetMessages() ([]Message, error) {
	rows, err := db.Query("SELECT username, message, timestamp FROM messages ORDER BY timestamp ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var messages []Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(&msg.Username, &msg.Message, &msg.Timestamp)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}
