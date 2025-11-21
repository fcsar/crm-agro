import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';
import { Lead } from '../leads/lead.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import {
  PropertySummaryDto,
  PropertiesInsightDto,
  CropGroupDto,
} from './dto/property-summary.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { CropType, CROP_WEIGHTS, CROP_SEASONS } from './property.enums';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
  ) {}

  private calculateAgronomicScore(
    areaHectares: number,
    crop: CropType,
  ): number {
    const weight = CROP_WEIGHTS[crop] || 1.0;
    return Number((areaHectares * weight).toFixed(2));
  }

  private getCropSeasonInsight(crops: CropType[]): string {
    const currentMonth = new Date().getMonth() + 1;
    const insights: string[] = [];

    for (const crop of crops) {
      const seasons = CROP_SEASONS[crop];
      if (!seasons) continue;

      if (seasons.plantio.includes(currentMonth)) {
        insights.push(`${crop}: período de plantio`);
      } else if (seasons.adubacaoCobertura.includes(currentMonth)) {
        insights.push(`${crop}: momento ideal para adubação de cobertura`);
      } else if (seasons.colheita.includes(currentMonth)) {
        insights.push(`${crop}: período de colheita`);
      }
    }

    return insights.length > 0
      ? insights.join(' | ')
      : 'Fora dos períodos críticos de manejo';
  }

  private generateActionSuggestions(
    totalArea: number,
    cropMix: CropGroupDto[],
  ): string[] {
    const suggestions: string[] = [];

    if (totalArea > 200) {
      suggestions.push(
        'Oferecer plano de fertilização premium para grandes produtores (200+ ha)',
      );
      suggestions.push('Indicar para gestão de contas especiais');
    } else if (totalArea > 100) {
      suggestions.push('Oferecer plano intermediário com desconto progressivo');
    } else if (totalArea > 50) {
      suggestions.push('Propor pacote de fertilização básico');
    }

    for (const group of cropMix) {
      if (group.crop === CropType.ALGODAO && group.totalArea > 0) {
        suggestions.push(
          'Algodão: alta demanda de insumos — campanha prioritária de NPK',
        );
        suggestions.push(
          'Oferecer linha de crédito para cultura de alto investimento',
        );
      }

      if (group.crop === CropType.SOJA && group.totalArea > 150) {
        suggestions.push(
          'Soja (150+ ha): propor inoculantes e fertilizantes foliares',
        );
      }

      if (group.crop === CropType.MILHO && group.totalArea > 100) {
        suggestions.push(
          'Milho (100+ ha): oferecer combo de ureia + MAP para adubação',
        );
      }
    }

    if (cropMix.length === 1) {
      suggestions.push('Produtor monocultivo — oportunidade de diversificação');
    }

    return suggestions;
  }

  private detectDataQualityIssues(properties: Property[]): string[] {
    const alerts: string[] = [];

    for (const prop of properties) {
      const area = Number(prop.areaHectares);

      if (area < 1) {
        alerts.push(
          `Propriedade ${prop.id}: área muito pequena (< 1 ha) — revisar cadastro`,
        );
      }

      if (!prop.city || !prop.state) {
        alerts.push(
          `Propriedade ${prop.id}: localização incompleta — adicionar cidade/estado`,
        );
      }
    }

    const signatures = new Map<string, number>();
    for (const prop of properties) {
      const signature = `${prop.crop}-${prop.areaHectares}`;
      const count = signatures.get(signature) || 0;
      signatures.set(signature, count + 1);
    }

    for (const [signature, count] of signatures) {
      if (count > 1) {
        alerts.push(
          `Possível duplicata: ${count} propriedades com ${signature}`,
        );
      }
    }

    return alerts;
  }

  private detectExpansionPotential(properties: Property[]): boolean {
    if (properties.length < 2) return false;

    const cities = properties
      .filter((p) => p.city)
      .map((p) => p.city?.toLowerCase());
    const uniqueCities = new Set(cities);

    if (uniqueCities.size === 1 && properties.length >= 2) {
      return true;
    }

    const crops = new Set(properties.map((p) => p.crop));
    if (crops.size >= 2 && properties.length >= 2) {
      return true;
    }

    return false;
  }

  private toSummaryDto(property: Property): PropertySummaryDto {
    const areaHectares = Number(property.areaHectares);

    return {
      id: property.id,
      leadId: property.leadId,
      crop: property.crop,
      areaHectares,
      city: property.city,
      state: property.state,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      agronomicScore: this.calculateAgronomicScore(areaHectares, property.crop),
    };
  }

  async create(dto: CreatePropertyDto): Promise<Property> {
    try {
      const lead = await this.leadsRepository.findOne({
        where: { id: dto.leadId },
      });

      if (!lead) {
        this.logger.warn(
          `Tentativa de criar propriedade para lead inexistente: ${dto.leadId}`,
        );
        throw new NotFoundException('Lead não encontrado');
      }

      const city = dto.city || lead.city;
      const state = dto.state || lead.state;

      const property = this.propertiesRepository.create({
        leadId: dto.leadId,
        crop: dto.crop,
        areaHectares: dto.areaHectares.toString(),
        city,
        state,
        geometry: dto.geometry,
      });

      const savedProperty = await this.propertiesRepository.save(property);

      await this.updateLeadAggregates(dto.leadId);

      this.logger.log(
        `Propriedade criada: ${savedProperty.id} para lead ${dto.leadId}`,
      );
      return savedProperty;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao criar propriedade: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível criar a propriedade');
    }
  }

  private async updateLeadAggregates(leadId: string): Promise<void> {
    try {
      const properties = await this.propertiesRepository.find({
        where: { leadId },
      });

      const totalArea = properties.reduce((sum, p) => {
        return sum + Number(p.areaHectares);
      }, 0);

      const crops = Array.from(new Set(properties.map((p) => p.crop)));

      const lead = await this.leadsRepository.findOne({
        where: { id: leadId },
      });

      if (!lead) {
        this.logger.warn(`Lead ${leadId} não encontrado`);
        return;
      }

      lead.totalAreaHectares = totalArea;
      lead.mainCrops = JSON.stringify(crops);
      lead.isPrioritario = totalArea > 100;

      lead.priorityScore = this.calculateLeadPriorityScore(lead);

      await this.leadsRepository.save(lead);

      this.logger.log(
        `Lead ${leadId} atualizado: ${totalArea} ha, Score: ${lead.priorityScore}, Prioritário: ${lead.isPrioritario}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar agregados do lead ${leadId}: ${error.message}`,
      );
    }
  }

  private calculateLeadPriorityScore(lead: Partial<Lead>): number {
    let score = 0;

    if (lead.totalAreaHectares) {
      if (lead.totalAreaHectares > 100) score += 50;
      else if (lead.totalAreaHectares > 50) score += 30;
      else if (lead.totalAreaHectares > 0) score += 10;
    }

    if (lead.origin === 'indicacao') score += 20;
    if (lead.origin === 'feira') score += 15;

    if (lead.status === 'qualificado') score += 10;
    if (lead.status === 'proposta') score += 15;
    if (lead.status === 'negociacao') score += 20;

    if (!lead.assignedTo) score += 5;

    return score;
  }

  async findAll(
    filters: FilterPropertiesDto,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PropertySummaryDto>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters.leadId) where.leadId = filters.leadId;
      if (filters.crop) where.crop = filters.crop;
      if (filters.city) where.city = filters.city;
      if (filters.state) where.state = filters.state;

      const [properties, total] = await this.propertiesRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
      });

      const data = properties.map((p) => this.toSummaryDto(p));
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar propriedades: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível buscar as propriedades');
    }
  }

  async findOne(id: string): Promise<Property> {
    try {
      const property = await this.propertiesRepository.findOne({
        where: { id },
        relations: ['lead'],
      });

      if (!property) {
        this.logger.warn(`Propriedade não encontrada: ${id}`);
        throw new NotFoundException('Propriedade não encontrada');
      }

      return property;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao buscar propriedade ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível buscar a propriedade');
    }
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    try {
      const property = await this.findOne(id);

      Object.assign(property, {
        ...dto,
        areaHectares: dto.areaHectares
          ? dto.areaHectares.toString()
          : property.areaHectares,
      });

      const updatedProperty = await this.propertiesRepository.save(property);

      await this.updateLeadAggregates(property.leadId);

      this.logger.log(`Propriedade atualizada: ${id}`);
      return updatedProperty;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao atualizar propriedade ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível atualizar a propriedade');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const property = await this.findOne(id);
      const leadId = property.leadId;

      await this.propertiesRepository.remove(property);

      await this.updateLeadAggregates(leadId);

      this.logger.log(`Propriedade removida: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao remover propriedade ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível remover a propriedade');
    }
  }

  async getLeadInsights(leadId: string): Promise<PropertiesInsightDto> {
    try {
      const lead = await this.leadsRepository.findOne({
        where: { id: leadId },
      });

      if (!lead) {
        throw new NotFoundException('Lead não encontrado');
      }

      const properties = await this.propertiesRepository.find({
        where: { leadId },
      });

      if (properties.length === 0) {
        throw new NotFoundException('Lead não possui propriedades cadastradas');
      }

      const totalArea = properties.reduce(
        (sum, p) => sum + Number(p.areaHectares),
        0,
      );

      const totalAgronomicScore = properties.reduce((sum, p) => {
        return (
          sum + this.calculateAgronomicScore(Number(p.areaHectares), p.crop)
        );
      }, 0);

      const cropGroups = new Map<CropType, { area: number; count: number }>();

      for (const prop of properties) {
        const crop = prop.crop;
        const area = Number(prop.areaHectares);
        const current = cropGroups.get(crop) || { area: 0, count: 0 };
        cropGroups.set(crop, {
          area: current.area + area,
          count: current.count + 1,
        });
      }

      const cropMix: CropGroupDto[] = Array.from(cropGroups.entries()).map(
        ([crop, data]) => ({
          crop,
          totalArea: Number(data.area.toFixed(2)),
          totalProperties: data.count,
          percentage: Number(((data.area / totalArea) * 100).toFixed(1)),
        }),
      );

      cropMix.sort((a, b) => b.totalArea - a.totalArea);

      const mainCrop = cropMix[0].crop;

      const dataQualityAlerts = this.detectDataQualityIssues(properties);

      const actionSuggestions = this.generateActionSuggestions(
        totalArea,
        cropMix,
      );

      const crops = properties.map((p) => p.crop);
      const cropSeasonInsight = this.getCropSeasonInsight(crops);

      const expansionPotential = this.detectExpansionPotential(properties);

      const cities = Array.from(
        new Set(properties.filter((p) => p.city).map((p) => p.city!)),
      );

      return {
        leadId,
        totalProperties: properties.length,
        totalArea: Number(totalArea.toFixed(2)),
        totalAgronomicScore: Number(totalAgronomicScore.toFixed(2)),
        isPriority: totalArea > 100,
        cropMix,
        mainCrop,
        dataQualityAlerts,
        actionSuggestions,
        cropSeasonInsight,
        expansionPotential,
        cities,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao gerar insights do lead ${leadId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível gerar insights');
    }
  }

  async getGeographicHotspots(): Promise<
    Array<{ city: string; state: string; count: number; totalArea: number }>
  > {
    try {
      const properties = await this.propertiesRepository.find({
        where: {},
      });

      const cityGroups = new Map<
        string,
        { state: string; count: number; totalArea: number }
      >();

      for (const prop of properties) {
        if (!prop.city) continue;

        const key = `${prop.city}-${prop.state || ''}`;
        const current = cityGroups.get(key) || {
          state: prop.state || '',
          count: 0,
          totalArea: 0,
        };

        cityGroups.set(key, {
          state: current.state,
          count: current.count + 1,
          totalArea: current.totalArea + Number(prop.areaHectares),
        });
      }

      const hotspots = Array.from(cityGroups.entries())
        .map(([key, data]) => {
          const city = key.split('-')[0];
          return {
            city,
            state: data.state,
            count: data.count,
            totalArea: Number(data.totalArea.toFixed(2)),
          };
        })
        .sort((a, b) => b.count - a.count);

      return hotspots;
    } catch (error) {
      this.logger.error(
        `Erro ao gerar hotspots geográficos: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível gerar hotspots');
    }
  }
}
