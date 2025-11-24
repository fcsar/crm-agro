import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PropertiesService, KmlUploadResponse } from '../../../core/services/properties.service';

@Component({
  selector: 'app-kml-upload',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="kml-upload-container">
      <label class="kml-label">📍 Upload KML (Google Earth)</label>
      <div class="kml-upload-area">
        <input 
          type="file" 
          #kmlInput 
          accept=".kml" 
          (change)="onFileSelected($event)" 
          style="display: none;" />
        <button 
          pButton 
          type="button"
          [label]="uploading ? 'Processando...' : 'Escolher arquivo KML'"
          icon="pi pi-upload" 
          class="p-button-outlined p-button-secondary"
          (click)="kmlInput.click()"
          [disabled]="uploading">
        </button>
        <small class="field-hint" *ngIf="!fileName">Calcula área automaticamente do contorno da fazenda</small>
        <small class="field-hint success" *ngIf="fileName">✓ {{ fileName }} - {{ calculatedArea }} ha</small>
      </div>
    </div>
  `,
  styles: [`
    .kml-upload-container {
      margin-bottom: 1rem;
    }

    .kml-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .kml-upload-area {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      button {
        width: 100%;
      }

      .field-hint {
        font-size: 0.875rem;
        color: var(--text-secondary);

        &.success {
          color: #16a34a;
          font-weight: 500;
        }
      }
    }
  `]
})
export class KmlUploadComponent {
  @Output() kmlProcessed = new EventEmitter<KmlUploadResponse>();
  @Output() uploadingChange = new EventEmitter<boolean>();
  @Input() disabled = false;

  uploading = false;
  fileName = '';
  calculatedArea = 0;

  constructor(
    private propertiesService: PropertiesService,
    private messageService: MessageService
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    
    if (!file.name.toLowerCase().endsWith('.kml')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, selecione um arquivo .kml'
      });
      return;
    }

    this.uploading = true;
    this.uploadingChange.emit(true);
    this.fileName = file.name;

    this.propertiesService.uploadKml(file).subscribe({
      next: (result) => {
        this.calculatedArea = result.areaHectares;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Área calculada: ${result.areaHectares} hectares`
        });
        
        this.uploading = false;
        this.uploadingChange.emit(false);
        this.kmlProcessed.emit(result);
      },
      error: (error) => {
        console.error('Erro ao processar KML:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao processar KML',
          detail: error.error?.message || 'Arquivo KML inválido'
        });
        this.uploading = false;
        this.uploadingChange.emit(false);
        this.fileName = '';
        this.calculatedArea = 0;
        input.value = '';
      }
    });
  }

  reset() {
    this.fileName = '';
    this.calculatedArea = 0;
    this.uploading = false;
  }
}
