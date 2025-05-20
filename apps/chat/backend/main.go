
package main

import (
	//"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/websocket"
)

type Message struct {
	Username  string    `json:"username"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Permite conexiuni din orice origine
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)

func main() {
	InitDB()
	
	// Adaugă un endpoint de health pentru verificări de status
	// http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
	// 	w.WriteHeader(http.StatusOK)
	// 	w.Write([]byte("OK"))
	// })
	
	http.HandleFunc("/ws", handleConnections)
	
	// Adaugă un endpoint HTTP pentru a obține mesajele
	http.HandleFunc("/messages", getMessagesHandler)
	
	go handleMessages()
	
	log.Println("Serverul rulează pe portul 8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Eroare la pornire:", err)
	}
}

func getMessagesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	
	messages, err := GetMessages()
	if err != nil {
		log.Printf("Eroare la extragerea mesajelor: %v", err)
		http.Error(w, "Eroare la obținerea mesajelor", http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(messages)
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Eroare WebSocket:", err)
		return
	}
	defer ws.Close()
	
	// Adaugă ping/pong handlers pentru a detecta mai rapid deconectările
	ws.SetPingHandler(func(string) error {
		ws.WriteControl(websocket.PongMessage, []byte{}, time.Now().Add(time.Second))
		return nil
	})
	
	// Pornește un ticker pentru ping-uri periodice
	pingTicker := time.NewTicker(30 * time.Second)
	defer pingTicker.Stop()
	
	go func() {
		for range pingTicker.C {
			if err := ws.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(5*time.Second)); err != nil {
				return
			}
		}
	}()
	
	clients[ws] = true
	log.Println("Client nou conectat prin WebSocket.")
	
	// Trimitem istoricul mesajelor imediat la conectare
	messages, err := GetMessages()
	if err != nil {
		log.Printf("Eroare la extragerea mesajelor din DB: %v", err)
	} else {
		for _, msg := range messages {
			if err := ws.WriteJSON(msg); err != nil {
				log.Printf("Eroare la trimiterea mesajelor vechi către client: %v", err)
				break
			}
			// Adăugăm o mică pauză pentru a preveni supraîncărcarea
			time.Sleep(5 * time.Millisecond)
		}
	}
	
	// Ascultăm mesaje noi de la client
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
		
		// Salvăm mesajul în baza de date
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