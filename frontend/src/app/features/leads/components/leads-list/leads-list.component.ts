import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { LeadsService, Lead, CreateLeadDto, UpdateLeadStatusDto } from '../../../../core/services/leads.service';
import { PropertiesService, CreatePropertyDto } from '../../../../core/services/properties.service';
import { EstadosBrasilService, Estado } from '../../../../core/services/estados-brasil.service';

@Component({
  selector: 'app-leads-list',
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
    BadgeModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.scss']
})
export class LeadsListComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  loading = true;
  
  searchTerm = '';
  selectedStatus = '';
  
  // Paginação
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  // Dialog de novo lead
  displayDialog = false;
  newLead: CreateLeadDto = this.getEmptyLead();
  
  // Multi-step: propriedades
  dialogStep: 'lead' | 'properties' = 'lead';
  createdLeadId: string | null = null;
  newProperty: any = this.getEmptyProperty();
  tempProperties: any[] = [];

  // Estados brasileiros
  estados: Estado[] = [];

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Novo', value: 'novo' },
    { label: 'Contatado', value: 'contatado' },
    { label: 'Qualificado', value: 'qualificado' },
    { label: 'Proposta', value: 'proposta' },
    { label: 'Negociação', value: 'negociacao' },
    { label: 'Ganho', value: 'ganho' },
    { label: 'Perdido', value: 'perdido' },
  ];

  origemOptions = [
    { label: 'Site', value: 'site' },
    { label: 'Indicação', value: 'indicacao' },
    { label: 'Feira', value: 'feira' },
    { label: 'Telefone', value: 'telefone' },
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Rede Social', value: 'rede_social' },
    { label: 'Visita Campo', value: 'visita_campo' },
    { label: 'Outros', value: 'outros' },
  ];

  segmentoOptions = [
    { label: 'Pequeno Produtor', value: 'pequeno' },
    { label: 'Médio Produtor', value: 'medio' },
    { label: 'Grande Produtor', value: 'grande' },
  ];

  constructor(
    private leadsService: LeadsService,
    private propertiesService: PropertiesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private estadosService: EstadosBrasilService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.estados = this.estadosService.getEstados();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeads();
    }
  }

  loadLeads() {
    this.loading = true;
    this.leadsService.findAll({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe({
      next: (response) => {
        this.leads = response.data;
        this.filteredLeads = response.data;
        this.totalRecords = response.meta.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar leads:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar leads. Verifique se o backend está rodando.'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadLeads();
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadLeads();
  }

  showNewLeadDialog() {
    this.newLead = this.getEmptyLead();
    this.dialogStep = 'lead';
    this.createdLeadId = null;
    this.tempProperties = [];
    this.displayDialog = true;
  }

  saveLead() {
    if (!this.validateLead()) {
      return;
    }

    this.leadsService.create(this.newLead).subscribe({
      next: (lead) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Lead criado com sucesso!'
        });
        this.createdLeadId = lead.id;
        this.tempProperties = [];
        this.newProperty = this.getEmptyProperty();
        
        // Vai para o step de propriedades
        this.dialogStep = 'properties';
      },
      error: (error) => {
        console.error('Erro ao criar lead:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao criar lead'
        });
      }
    });
  }

  deleteLead(lead: Lead) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir o lead ${lead.name}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.leadsService.remove(lead.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Lead excluído com sucesso!'
            });
            this.loadLeads();
          },
          error: (error) => {
            console.error('Erro ao excluir lead:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir lead'
            });
          }
        });
      }
    });
  }

  viewLead(lead: Lead) {
    this.router.navigate(['/leads', lead.id]);
  }

  editLead(lead: Lead) {
    // TODO: Implementar edição
    this.messageService.add({
      severity: 'info',
      summary: 'Em Desenvolvimento',
      detail: 'Funcionalidade de edição em desenvolvimento'
    });
  }

  private validateLead(): boolean {
    if (!this.newLead.name || !this.newLead.email || !this.newLead.phone) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return false;
    }
    return true;
  }

  private getEmptyLead(): CreateLeadDto {
    return {
      name: '',
      email: '',
      phone: '',
      origin: 'site',
      segment: 'medio',
      city: '',
      state: '',
    };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      novo: 'Novo',
      contatado: 'Contatado',
      qualificado: 'Qualificado',
      proposta: 'Proposta',
      negociacao: 'Negociação',
      ganho: 'Ganho',
      perdido: 'Perdido',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): any {
    const severities: { [key: string]: string } = {
      novo: 'info',
      contatado: 'secondary',
      qualificado: 'warn',
      proposta: 'info',
      negociacao: 'warn',
      ganho: 'success',
      perdido: 'danger',
    };
    return severities[status] || 'secondary';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  updateLeadStatus(lead: Lead, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as any;
    const oldStatus = lead.status;
    
    const updateDto: UpdateLeadStatusDto = { status: newStatus };
    
    this.leadsService.updateStatus(lead.id, updateDto).subscribe({
      next: (updatedLead) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Status atualizado para ${this.getStatusLabel(newStatus)}`
        });
        // Recarrega a lista completa para garantir dados atualizados
        this.loadLeads();
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar status'
        });
        // Reverte o select
        select.value = oldStatus;
      }
    });
  }

  getMainCrops(mainCropsJson: any): string[] {
    if (!mainCropsJson) return [];
    try {
      if (typeof mainCropsJson === 'string') {
        return JSON.parse(mainCropsJson);
      }
      return Array.isArray(mainCropsJson) ? mainCropsJson : [];
    } catch {
      return [];
    }
  }

  getOrigemLabel(origin: string): string {
    const opt = this.origemOptions.find(o => o.value === origin);
    return opt ? opt.label : origin;
  }

  getScoreSeverity(score: number): 'success' | 'warn' | 'info' | 'secondary' | 'danger' {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warn';
    if (score >= 30) return 'info';
    return 'secondary';
  }
  
  // Métodos para propriedades
  getEmptyProperty(): any {
    return {
      crop: 'soja',
      areaHectares: 0,
      city: this.newLead.city || '',
      state: this.newLead.state || ''
    };
  }
  
  addProperty() {
    if (!this.newProperty.areaHectares || this.newProperty.areaHectares <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Área da propriedade deve ser maior que zero'
      });
      return;
    }
    
    const propertyDto: CreatePropertyDto = {
      leadId: this.createdLeadId!,
      crop: this.newProperty.crop,
      areaHectares: this.newProperty.areaHectares,
      city: this.newProperty.city || this.newLead.city!,
      state: this.newProperty.state || this.newLead.state!
    };
    
    this.propertiesService.create(propertyDto).subscribe({
      next: (property) => {
        this.tempProperties.push(property);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Propriedade adicionada!'
        });
        this.newProperty = this.getEmptyProperty();
      },
      error: (error) => {
        console.error('Erro ao adicionar propriedade:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao adicionar propriedade'
        });
      }
    });
  }
  
  removeProperty(index: number) {
    const property = this.tempProperties[index];
    this.propertiesService.remove(property.id).subscribe({
      next: () => {
        this.tempProperties.splice(index, 1);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Propriedade removida'
        });
      },
      error: (error) => {
        console.error('Erro ao remover propriedade:', error);
      }
    });
  }
  
  finishLeadCreation() {
    this.loadLeads();
    this.displayDialog = false;
    this.dialogStep = 'lead';
    this.createdLeadId = null;
    this.tempProperties = [];
    this.newLead = this.getEmptyLead();
  }
  
  cancelPropertyStep() {
    this.confirmationService.confirm({
      message: 'Deseja cancelar? As propriedades já adicionadas serão mantidas.',
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.finishLeadCreation();
      }
    });
  }
  
  getTotalArea(): number {
    return this.tempProperties.reduce((sum, p) => sum + Number(p.areaHectares), 0);
  }
  
  getEstimatedScore(): number {
    const totalArea = this.getTotalArea();
    let score = 0;
    
    // Pontos por área (mesmo cálculo do backend)
    if (totalArea > 100) score += 50;
    else if (totalArea > 50) score += 30;
    else if (totalArea > 0) score += 10;
    
    // Pontos por origem
    if (this.newLead.origin === 'indicacao') score += 20;
    else if (this.newLead.origin === 'feira') score += 15;
    
    // Status (sempre novo no cadastro)
    score += 0;
    
    // Sem vendedor atribuído
    score += 5;
    
    return score;
  }
  
  getCropLabel(crop: string): string {
    const labels: {[key: string]: string} = {
      'soja': '🌱 Soja',
      'milho': '🌽 Milho',
      'algodao': '☁️ Algodão'
    };
    return labels[crop] || crop;
  }
}
