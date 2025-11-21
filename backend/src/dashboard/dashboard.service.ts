import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/lead.entity';
import {
  DashboardOverviewDto,
  LeadsByCityItem,
  LeadsByOriginItem,
  LeadsBySegmentItem,
  LeadsByStateItem,
} from './dto/dashboard-overview.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async getOverview(): Promise<DashboardOverviewDto> {
    this.logger.log('Gerando overview do dashboard');

    const generalMetrics = await this.leadRepository
      .createQueryBuilder('lead')
      .select('COUNT(*)', 'totalLeads')
      .addSelect(
        'COUNT(CASE WHEN lead.is_prioritario = true THEN 1 END)',
        'prioritarios',
      )
      .addSelect('SUM(lead.total_area_hectares)', 'totalAreaHectares')
      .addSelect('AVG(lead.priority_score)', 'averagePriorityScore')
      .addSelect(
        "COUNT(CASE WHEN lead.status = 'ganho' THEN 1 END)",
        'totalGanhos',
      )
      .getRawOne();

    const statusDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    const cityDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('lead.city IS NOT NULL')
      .groupBy('lead.city')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const stateDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.state')
      .orderBy('count', 'DESC')
      .getRawMany();

    const originDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.origin', 'origin')
      .addSelect('COUNT(*)', 'count')
      .where('lead.origin IS NOT NULL')
      .groupBy('lead.origin')
      .orderBy('count', 'DESC')
      .getRawMany();

    const segmentDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.segment', 'segment')
      .addSelect('COUNT(*)', 'count')
      .where('lead.segment IS NOT NULL')
      .groupBy('lead.segment')
      .orderBy('count', 'DESC')
      .getRawMany();

    const totalLeads = parseInt(generalMetrics.totalLeads) || 0;
    const totalGanhos = parseInt(generalMetrics.totalGanhos) || 0;

    const overview: DashboardOverviewDto = {
      totalLeads,
      prioritarios: parseInt(generalMetrics.prioritarios) || 0,
      totalAreaHectares: generalMetrics.totalAreaHectares
        ? parseFloat(generalMetrics.totalAreaHectares)
        : null,
      averagePriorityScore: generalMetrics.averagePriorityScore
        ? parseFloat(generalMetrics.averagePriorityScore)
        : 0,
      conversionRate: totalLeads > 0 ? (totalGanhos / totalLeads) * 100 : 0,

      leadsByStatus: statusDistribution.reduce(
        (acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        },
        {} as Record<string, number>,
      ),

      leadsByCity: cityDistribution.map(
        (item): LeadsByCityItem => ({
          city: item.city,
          count: parseInt(item.count),
        }),
      ),

      leadsByState: stateDistribution.map(
        (item): LeadsByStateItem => ({
          state: item.state,
          count: parseInt(item.count),
        }),
      ),

      leadsByOrigin: originDistribution.map(
        (item): LeadsByOriginItem => ({
          origin: item.origin,
          count: parseInt(item.count),
        }),
      ),

      leadsBySegment: segmentDistribution.map(
        (item): LeadsBySegmentItem => ({
          segment: item.segment,
          count: parseInt(item.count),
        }),
      ),
    };

    return overview;
  }

  async getFunnelMetrics() {
    const statusFlow = [
      'novo',
      'contatado',
      'qualificado',
      'proposta',
      'negociacao',
      'ganho',
    ];

    const statusCounts = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('lead.status IN (:...statuses)', { statuses: statusFlow })
      .groupBy('lead.status')
      .getRawMany();

    const countMap = statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    const funnel = statusFlow.map((status, index) => {
      const count = countMap[status] || 0;
      const previousCount =
        index > 0 ? countMap[statusFlow[index - 1]] || 0 : null;

      return {
        stage: status,
        count,
        conversionRate:
          previousCount && previousCount > 0
            ? (count / previousCount) * 100
            : null,
      };
    });

    return {
      funnel,
      totalInFunnel: statusFlow.reduce(
        (sum, status) => sum + (countMap[status] || 0),
        0,
      ),
    };
  }
}
