package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type Message struct {
	Username  string    `json:"username"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Permite conexiuni din orice origine (ex: localhost:4200 cu Angular)
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)

func main() {
	InitDB()

	http.HandleFunc("/ws", handleConnections)
	http.HandleFunc("/messages", handleGetMessages)

	go handleMessages()

	log.Println("Serverul rulează pe portul 88...")
	err := http.ListenAndServe(":88", nil)
	if err != nil {
		log.Fatal("Eroare la pornire:", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Eroare WebSocket:", err)
		return
	}
	defer ws.Close()

	clients[ws] = true
	log.Println("Client nou conectat prin WebSocket.")

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Eroare citire mesaj: %v", err)
			delete(clients, ws)
			break
		}

		msg.Timestamp = time.Now().UTC()
		log.Printf("Mesaj primit de la %s: %s", msg.Username, msg.Message)

		// Salvăm mesajul în baza de date și tratăm eroarea
		if err := SaveMessage(msg); err != nil {
			log.Printf("Eroare la salvarea mesajului în DB: %v", err)
		}

		// Trimitem mesajul către toți clienții conectați
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Eroare trimitere către client: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func handleGetMessages(w http.ResponseWriter, r *http.Request) {
	messages, err := GetMessages()
	if err != nil {
		http.Error(w, "Eroare la extragerea mesajelor din DB", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
