import { Component, OnInit, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { PropertiesService, Property, CreatePropertyDto, KmlUploadResponse } from '../../../../core/services/properties.service';
import { LeadsService, Lead } from '../../../../core/services/leads.service';
import { KmlUploadComponent } from '../../../../shared/components/kml-upload/kml-upload.component';

@Component({
  selector: 'app-properties-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    TooltipModule,
    ChipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    KmlUploadComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './properties-list.component.html',
  styleUrls: ['./properties-list.component.scss']
})
export class PropertiesListComponent implements OnInit {
  @ViewChild(KmlUploadComponent) kmlUploadComponent!: KmlUploadComponent;
  
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  loading = true;
  searchTerm = '';

  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  displayDialog = false;
  newProperty: CreatePropertyDto = this.getEmptyProperty();
  leads: Lead[] = [];
  loadingLeads = false;

  cropOptions = [
    { label: 'Soja', value: 'soja' },
    { label: 'Milho', value: 'milho' },
    { label: 'Algodão', value: 'algodao' },
  ];

  constructor(
    private propertiesService: PropertiesService,
    private leadsService: LeadsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProperties();
    }
  }

  loadProperties() {
    this.loading = true;
    this.propertiesService.findAll({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
    }).subscribe({
      next: (response) => {
        this.properties = response.data;
        this.filteredProperties = response.data;
        this.totalRecords = response.meta.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar propriedades:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar propriedades. Verifique se o backend está rodando.'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadProperties();
  }

  onPageChange(event: any) {
    this.currentPage = (event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadProperties();
  }

  showNewPropertyDialog() {
    this.newProperty = this.getEmptyProperty();
    this.loadLeads();
    this.displayDialog = true;
  }

  loadLeads() {
    this.loadingLeads = true;
    this.leadsService.findAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.leads = response.data;
        this.loadingLeads = false;
      },
      error: (error) => {
        console.error('Erro ao carregar leads:', error);
        this.loadingLeads = false;
      }
    });
  }

  saveProperty() {
    if (!this.validateProperty()) {
      return;
    }

    this.propertiesService.create(this.newProperty).subscribe({
      next: (property) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Propriedade criada com sucesso!'
        });
        this.displayDialog = false;
        if (this.kmlUploadComponent) {
          this.kmlUploadComponent.reset();
        }
        this.loadProperties();
      },
      error: (error) => {
        console.error('Erro ao criar propriedade:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao criar propriedade'
        });
      }
    });
  }

  deleteProperty(property: Property) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir esta propriedade?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.propertiesService.remove(property.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Propriedade excluída com sucesso!'
            });
            this.loadProperties();
          },
          error: (error) => {
            console.error('Erro ao excluir propriedade:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir propriedade'
            });
          }
        });
      }
    });
  }

  viewProperty(property: Property) {
    // TODO: Implementar visualização detalhada
    this.messageService.add({
      severity: 'info',
      summary: 'Em Desenvolvimento',
      detail: 'Visualização detalhada em desenvolvimento'
    });
  }

  editProperty(property: Property) {
    // TODO: Implementar edição
    this.messageService.add({
      severity: 'info',
      summary: 'Em Desenvolvimento',
      detail: 'Funcionalidade de edição em desenvolvimento'
    });
  }

  private validateProperty(): boolean {
    if (!this.newProperty.leadId || !this.newProperty.crop || 
        !this.newProperty.areaHectares || !this.newProperty.city || 
        !this.newProperty.state) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return false;
    }
    return true;
  }

  private getEmptyProperty(): CreatePropertyDto {
    return {
      leadId: '',
      crop: 'soja',
      areaHectares: 0,
      city: '',
      state: 'MG',
    };
  }

  getCropLabel(crop: string): string {
    const labels: { [key: string]: string } = {
      soja: 'Soja',
      milho: 'Milho',
      algodao: 'Algodão',
    };
    return labels[crop] || crop;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  onKmlProcessed(result: KmlUploadResponse) {
    this.newProperty.areaHectares = result.areaHectares;
    this.newProperty.geometry = result.geojsonString;
  }
}
