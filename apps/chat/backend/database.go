// package main 

// // apartine de main 
// // pot apela in "main.go" direct InitDB(), SaveMessage() etc

// import (
// 	"database/sql"
// 	"log"
// 	_"github.com/go-sql-driver/mysql"
// 	"time" 
// )


// var db *sql.DB

// func InitDB() {
// 	var err error

// 	// string de conectare  [username[:password]@][protocol[(address)]]/dbname[?param1=value1&param2=value2&...]
// 	// parseTime=true -> convert MySQL TIME/DATE values to Go's native time 
// 	dsn := "chat_user:chat_pass@tcp(mysql:3306)/chat_db?parseTime=true"
	

// 	for i := 0; i < 20; i++ {
// 		db, err = sql.Open("mysql", dsn)

// 		if err == nil {
// 			err = db.Ping()

// 			if err == nil {
// 				log.Println("Conectare la DB realizată cu succes.")
// 				return
// 			}
// 		}

// 		log.Printf("DB inaccesibilă (încercare %d/20): %v. Reîncerc în 3 sec...", i+1, err)
// 		time.Sleep(3 * time.Second)
// 	}
// }

// func SaveMessage(msg Message) error {
// 	stmt, err := db.Prepare("INSERT INTO messages(username, Message, timestamp) VALUES (?, ?, ?)")
// 	if err != nil {
// 		return err
// 	}
// 	defer stmt.Close()

// 	_, err = stmt.Exec(msg.Username, msg.Message, msg.Timestamp)
// 	return err
// }

// func GetMessages() ([]Message, error) {
// 	rows, err := db.Query("SELECT username, Message, timestamp FROM messages ORDER BY timestamp ASC")
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var messages []Message
// 	for rows.Next() {
// 		var msg Message
// 		err := rows.Scan(&msg.Username, &msg.Message, &msg.Timestamp)
// 		if err != nil {
// 			return nil, err
// 		}
// 		messages = append(messages, msg)
// 	}
// 	return messages, nil
// }


package main

import (
	"database/sql"
	"log"
	_ "github.com/go-sql-driver/mysql"
	"time"
)

var db *sql.DB

func InitDB() {
	var err error
	// string de conectare [username[:password]@][protocol[(address)]]/dbname[?param1=value1&param2=value2&...]
	// parseTime=true -> convert MySQL TIME/DATE values to Go's native time
	dsn := "chat_user:chat_pass@tcp(mysql:3306)/chat_db?parseTime=true"
	for i := 0; i < 20; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Conectare la DB realizată cu succes.")
				// Asigură-te că tabelul există
				createTable()
				return
			}
		}
		log.Printf("DB inaccesibilă (încercare %d/20): %v. Reîncerc în 3 sec...", i+1, err)
		time.Sleep(3 * time.Second)
	}
	log.Fatal("Nu s-a putut realiza conexiunea la baza de date după 20 de încercări")
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