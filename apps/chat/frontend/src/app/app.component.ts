import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DatePipe]
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  title = 'frontend';
  username: string = '';
  message: string = '';
  messages: ChatMessage[] = [];
  usernameSet: boolean = false;
  private ws: WebSocket | null = null;
  private shouldScrollToBottom = false;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    // Try to get username from localStorage
    const savedUsername = localStorage.getItem('chat-username');
    if (savedUsername) {
      this.username = savedUsername;
      this.usernameSet = true;
      this.connectWebSocket();
    }
    
    this.loadMessages();
    
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  setUsername() {
    if (this.username.trim()) {
      this.usernameSet = true;
      localStorage.setItem('chat-username', this.username);
      this.connectWebSocket();
    }
  }

  connectWebSocket() {
    // Use window.location to dynamically determine the WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//74.225.186.15:30001/ws`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Verificăm dacă primim un array (istoric) sau un singur mesaj
      if (Array.isArray(data)) {
        // Este istoricul mesajelor
        this.messages = data;
      } else {
        // Este un mesaj nou
        this.messages.push(data);
      }
      this.shouldScrollToBottom = true;
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Try to reconnect after a short delay
      setTimeout(() => {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          this.connectWebSocket();
        }
      }, 3000);
    };
  }

  loadMessages() {
    // Use window.location to dynamically determine the API URL
    const baseUrl = `${window.location.protocol}//74.225.186.15:30001`;
    
    this.http.get<ChatMessage[]>(`${baseUrl}/messages`).subscribe({
      next: (data) => {
        this.messages = data;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  sendMessage() {
    if (this.message.trim() && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = {
        username: this.username,
        message: this.message
      };
      
      this.ws.send(JSON.stringify(msg));
      this.message = ''; // Clear message input after sending
      this.shouldScrollToBottom = true;
    }
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // Today: show only time
    if (date.toDateString() === now.toDateString()) {
      return this.datePipe.transform(date, 'h:mm a') || '';
    }
    // Yesterday: show "Yesterday" and time
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + (this.datePipe.transform(date, 'h:mm a') || '');
    }
    // This year: show month, day and time
    else if (date.getFullYear() === now.getFullYear()) {
      return this.datePipe.transform(date, 'MMM d, h:mm a') || '';
    }
    // Different year: show full date
    else {
      return this.datePipe.transform(date, 'MMM d, y, h:mm a') || '';
    }
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
