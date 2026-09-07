import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../environments/environment';

interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly http = inject(HttpClient);

  protected readonly loading = signal(true);
  protected readonly health = signal<HealthResponse | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.http.get<HealthResponse>(`${environment.apiUrl}/health`).subscribe({
      next: (response) => {
        this.health.set(response);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof Error ? err.message : 'No se pudo contactar al backend');
        this.loading.set(false);
      },
    });
  }
}
