import { ApiProperty } from '@nestjs/swagger';

export class LeadsByCityItem {
  @ApiProperty({
    description: 'Nome da cidade',
    example: 'Uberlândia',
  })
  city: string;

  @ApiProperty({
    description: 'Quantidade de leads nesta cidade',
    example: 15,
  })
  count: number;
}

export class LeadsByStateItem {
  @ApiProperty({
    description: 'Sigla do estado',
    example: 'MG',
  })
  state: string;

  @ApiProperty({
    description: 'Quantidade de leads neste estado',
    example: 42,
  })
  count: number;
}

export class LeadsByOriginItem {
  @ApiProperty({
    description: 'Origem do lead',
    example: 'feira',
  })
  origin: string;

  @ApiProperty({
    description: 'Quantidade de leads desta origem',
    example: 12,
  })
  count: number;
}

export class LeadsBySegmentItem {
  @ApiProperty({
    description: 'Segmento do produtor',
    example: 'grande',
  })
  segment: string;

  @ApiProperty({
    description: 'Quantidade de leads neste segmento',
    example: 9,
  })
  count: number;
}

export class DashboardOverviewDto {
  @ApiProperty({
    description: 'Total de leads cadastrados',
    example: 42,
  })
  totalLeads: number;

  @ApiProperty({
    description: 'Leads prioritários (área > 100 ha)',
    example: 9,
  })
  prioritarios: number;

  @ApiProperty({
    description: 'Área total em hectares de todos os leads',
    example: 5420.75,
    nullable: true,
  })
  totalAreaHectares: number | null;

  @ApiProperty({
    description: 'Distribuição de leads por status do funil',
    example: {
      novo: 10,
      contatado: 8,
      qualificado: 6,
      proposta: 5,
      negociacao: 4,
      ganho: 7,
      perdido: 2,
    },
  })
  leadsByStatus: Record<string, number>;

  @ApiProperty({
    description: 'Top 10 cidades com mais leads',
    type: [LeadsByCityItem],
  })
  leadsByCity: LeadsByCityItem[];

  @ApiProperty({
    description: 'Distribuição por estado (UF)',
    type: [LeadsByStateItem],
  })
  leadsByState: LeadsByStateItem[];

  @ApiProperty({
    description: 'Distribuição por origem do lead',
    type: [LeadsByOriginItem],
  })
  leadsByOrigin: LeadsByOriginItem[];

  @ApiProperty({
    description: 'Distribuição por segmento (pequeno/médio/grande)',
    type: [LeadsBySegmentItem],
  })
  leadsBySegment: LeadsBySegmentItem[];

  @ApiProperty({
    description: 'Taxa de conversão (ganhos / total)',
    example: 16.67,
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Score médio de prioridade',
    example: 127.5,
  })
  averagePriorityScore: number;
}
