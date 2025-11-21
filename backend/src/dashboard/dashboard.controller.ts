import { Controller, Get, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Visão geral do dashboard',
    description:
      'Retorna métricas agregadas de toda a base de leads: totais, distribuições por status/cidade/origem, taxa de conversão',
  })
  @ApiOkResponse({
    description: 'Dashboard gerado com sucesso',
    type: DashboardOverviewDto,
    example: {
      totalLeads: 42,
      prioritarios: 9,
      totalAreaHectares: 5420.75,
      averagePriorityScore: 127.5,
      conversionRate: 16.67,
      leadsByStatus: {
        novo: 10,
        contatado: 8,
        qualificado: 6,
        proposta: 5,
        negociacao: 4,
        ganho: 7,
        perdido: 2,
      },
      leadsByCity: [
        { city: 'Uberlândia', count: 15 },
        { city: 'Patos de Minas', count: 9 },
        { city: 'Uberaba', count: 5 },
      ],
      leadsByState: [
        { state: 'MG', count: 30 },
        { state: 'SP', count: 12 },
      ],
      leadsByOrigin: [
        { origin: 'feira', count: 12 },
        { origin: 'indicacao', count: 10 },
      ],
      leadsBySegment: [
        { segment: 'grande', count: 9 },
        { segment: 'medio', count: 15 },
        { segment: 'pequeno', count: 18 },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao gerar dashboard',
  })
  async getOverview(): Promise<DashboardOverviewDto> {
    this.logger.log('GET /dashboard/overview');
    return this.dashboardService.getOverview();
  }

  @Get('funnel')
  @ApiOperation({
    summary: 'Funil de vendas detalhado',
    description:
      'Retorna contagem e taxa de conversão entre cada etapa do funil (novo → contatado → qualificado → proposta → negociação → ganho)',
  })
  @ApiOkResponse({
    description: 'Funil gerado com sucesso',
    example: {
      funnel: [
        { stage: 'novo', count: 10, conversionRate: null },
        { stage: 'contatado', count: 8, conversionRate: 80 },
        { stage: 'qualificado', count: 6, conversionRate: 75 },
        { stage: 'proposta', count: 5, conversionRate: 83.33 },
        { stage: 'negociacao', count: 4, conversionRate: 80 },
        { stage: 'ganho', count: 7, conversionRate: 175 },
      ],
      totalInFunnel: 40,
    },
  })
  async getFunnelMetrics() {
    this.logger.log('GET /dashboard/funnel');
    return this.dashboardService.getFunnelMetrics();
  }
}
