// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DocumentService } from './services/document.service';

interface Recipe {
  id: string;
  name: string;
  date: string;
  status: string;
  filename?: string;
  ingredients?: string[];
  steps?: string[];
  prepTime?: string;
  servings?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Document Processing';
  recipes: Recipe[] = [
    { 
      id: '1',
      name: 'Ciorbă de legume', 
      date: '19 Mai 2025, 14:30', 
      status: 'completed',
      filename: 'ciorba_de_legume.jpg',
      ingredients: [
        '2 morcovi',
        '1 ceapă mare',
        '2 cartofi',
        '1 ardei gras',
        '2 roșii',
        'sare și piper după gust'
      ],
      steps: [
        'Se curăță și se taie legumele cubulețe.',
        'Se adaugă 2 litri de apă și se fierbe la foc mic.',
        'Se adaugă sare și piper după gust.'
      ],
      prepTime: '15 minute',
      servings: 4
    },
    { 
      id: '2',
      name: 'Plăcintă cu brânză', 
      date: '17 Mai 2025, 10:15', 
      status: 'completed',
      filename: 'placinta_cu_branza.jpg',
      ingredients: [
        '500g aluat foietaj',
        '300g brânză de vaci',
        '2 ouă',
        '100g zahăr',
        'esență de vanilie'
      ],
      steps: [
        'Se întinde aluatul și se așează într-o tavă.',
        'Se amestecă brânza cu ouăle, zahărul și vanilia.',
        'Se toarnă compoziția peste aluat și se coace 35-40 minute la 180°C.'
      ],
      prepTime: '20 minute',
      servings: 8
    },
    { 
      id: '3',
      name: 'reteta_paste.png', 
      date: '15 Mai 2025, 09:22', 
      status: 'processing' 
    }
  ];
  selectedFile: File | null = null;
  processingResult: any = null;
  history: any[] = [];
  loading = false;
  error: string | null = null;
  activeTab = 'upload';
  selectedRecipe: Recipe | null = null;
  isDragover = false;

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.loadHistory();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.error = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;

    if (event.dataTransfer?.files) {
      this.selectedFile = event.dataTransfer.files[0];
      this.error = null;
    }
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const result = await this.documentService.uploadDocument(this.selectedFile).toPromise();
      this.processingResult = result;
      this.loadHistory();
    } catch (err) {
      this.error = 'Error processing file. Please try again.';
      console.error('Upload error:', err);
    } finally {
      this.loading = false;
    }
  }

  loadHistory(): void {
    this.documentService.getHistory().subscribe({
      next: (data) => {
        this.history = data;
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.error = 'Error loading history';
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.selectedRecipe = null;
  }

  showRecipeDetails(recipe: Recipe): void {
    this.selectedRecipe = recipe;
  }

  goBack(): void {
    this.selectedRecipe = null;
  }
}