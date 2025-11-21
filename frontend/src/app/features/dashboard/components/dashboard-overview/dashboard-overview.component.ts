import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DashboardService } from '../../../../core/services/dashboard.service';
import {
  DashboardOverview,
  FunnelMetrics,
} from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    SkeletonModule,
    MessageModule,
    ButtonModule,
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
})
export class DashboardOverviewComponent implements OnInit {
  overview: DashboardOverview | null = null;
  funnel: FunnelMetrics | null = null;
  loading = true;
  error: string | null = null;

  statusChartData: any;
  statusChartOptions: any;

  originChartData: any;
  originChartOptions: any;

  segmentChartData: any;
  segmentChartOptions: any;

  funnelChartData: any;
  funnelChartOptions: any;

  stateChartData: any;
  stateChartOptions: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.dashboardService.getOverview().toPromise(),
      this.dashboardService.getFunnelMetrics().toPromise(),
    ])
      .then(([overview, funnel]) => {
        this.overview = overview || null;
        this.funnel = funnel || null;
        this.initializeCharts();
        this.loading = false;
      })
      .catch((err) => {
        this.error = 'Erro ao carregar dados do dashboard';
        console.error('Dashboard error:', err);
        this.loading = false;
      });
  }

  initializeCharts(): void {
    if (!this.overview) return;

    const statusData = this.overview.leadsByStatus;
    const statusArray = Array.isArray(statusData) 
      ? statusData 
      : Object.entries(statusData).map(([status, count]) => ({ status, count: count as number }));

    this.statusChartData = {
      labels: statusArray.map((item) => this.getStatusLabel(item.status)),
      datasets: [
        {
          data: statusArray.map((item) => item.count),
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#22C55E',
            '#EF4444',
            '#6B7280',
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };

    this.statusChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    };

    this.originChartData = {
      labels: this.overview.leadsByOrigin.map((item) => this.getOriginLabel(item.origin)),
      datasets: [
        {
          label: 'Leads por Origem',
          data: this.overview.leadsByOrigin.map((item) => item.count),
          backgroundColor: '#2d6a4f',
          borderColor: '#1b4332',
          borderWidth: 1,
        },
      ],
    };

    this.originChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };

    this.segmentChartData = {
      labels: this.overview.leadsBySegment.map((item) => this.getSegmentLabel(item.segment)),
      datasets: [
        {
          data: this.overview.leadsBySegment.map((item) => item.count),
          backgroundColor: ['#f77f00', '#2d6a4f', '#52b788'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };

    this.segmentChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
      },
    };

    if (this.funnel && this.funnel.funnel.length > 0) {
      const funnelStages = this.funnel.funnel;
      this.funnelChartData = {
        labels: funnelStages.map((stage) => this.getStatusLabel(stage.stage)),
        datasets: [
          {
            label: 'Leads no Funil',
            data: funnelStages.map((stage) => stage.count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
              'rgb(139, 92, 246)',
              'rgb(34, 197, 94)',
            ],
            borderWidth: 2,
          },
        ],
      };

      this.funnelChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              afterLabel: (context: any) => {
                const stage = funnelStages[context.dataIndex];
                if (stage.conversionRate !== null) {
                  return `Taxa de conversão: ${stage.conversionRate.toFixed(2)}%`;
                }
                return '';
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      };
    }

    const topStates = this.overview.leadsByState.slice(0, 5);
    this.stateChartData = {
      labels: topStates.map((item) => item.state),
      datasets: [
        {
          label: 'Leads por Estado',
          data: topStates.map((item) => item.count),
          backgroundColor: '#52b788',
          borderColor: '#2d6a4f',
          borderWidth: 1,
        },
      ],
    };

    this.stateChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      novo: 'Novo',
      contato_inicial: 'Contato Inicial',
      qualificacao: 'Qualificação',
      proposta: 'Proposta',
      negociacao: 'Negociação',
      ganho: 'Ganho',
      perdido: 'Perdido',
      arquivado: 'Arquivado',
    };
    return labels[status] || status;
  }

  getOriginLabel(origin: string): string {
    const labels: { [key: string]: string } = {
      website: 'Website',
      indicacao: 'Indicação',
      linkedin: 'LinkedIn',
      evento: 'Evento',
      email: 'E-mail',
      telefone: 'Telefone',
      redes_sociais: 'Redes Sociais',
      outros: 'Outros',
    };
    return labels[origin] || origin;
  }

  getSegmentLabel(segment: string): string {
    const labels: { [key: string]: string } = {
      pequeno_produtor: 'Pequeno Produtor',
      medio_produtor: 'Médio Produtor',
      grande_produtor: 'Grande Produtor',
    };
    return labels[segment] || segment;
  }

  getStatusSeverity(status: string): string {
    const severities: { [key: string]: string } = {
      novo: 'info',
      contato_inicial: 'success',
      qualificacao: 'warning',
      proposta: 'primary',
      negociacao: 'secondary',
      ganho: 'success',
      perdido: 'danger',
      arquivado: 'secondary',
    };
    return severities[status] || 'info';
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  formatDecimal(value: number | undefined): string {
    if (value === undefined || value === null) return '0,00';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null) return '0%';
    return `${this.formatDecimal(value)}%`;
  }
}
