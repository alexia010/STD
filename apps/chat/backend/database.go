package main // pot apela in "main.go" direct InitDB(), SaveMessage() etc
import (
	"database/sql"
	"log"
	_"github.com/go-sql-driver/mysql"
	"time" 
)

var db *sql.DB

func InitDB() {
	var err error

	// Conexiune către MySQL (ajustează user, password și ip după caz)
	dsn := "chat_user:chat_pass@tcp(mysql:3306)/chat_db?parseTime=true"
	// db, err = sql.Open("mysql", dsn)
	// if err != nil {
	// 	log.Fatal("Eroare conectare DB:", err)
	// }

	// err = db.Ping()
	// if err != nil {
	// 	log.Fatal("DB inaccesibilă:", err)
	// }

	for i := 0; i < 10; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Conectare la DB realizată cu succes.")
				return
			}
		}

		log.Printf("DB inaccesibilă (încercare %d/10): %v. Reîncerc în 3 sec...", i+1, err)
		time.Sleep(3 * time.Second)
	}
}

func SaveMessage(msg Message) error {
	stmt, err := db.Prepare("INSERT INTO messages(username, Message, timestamp) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(msg.Username, msg.Message, msg.Timestamp)
	return err
}

func GetMessages() ([]Message, error) {
	rows, err := db.Query("SELECT username, Message, timestamp FROM messages ORDER BY timestamp ASC")
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
