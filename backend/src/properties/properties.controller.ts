import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar propriedade rural',
    description:
      'Cria uma nova propriedade associada a um lead. Atualiza automaticamente totalAreaHectares, mainCrops e isPrioritario do lead.',
  })
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({
    status: 201,
    description: 'Propriedade criada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Lead não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          {
            field: 'crop',
            errors: ['Cultura inválida. Use: soja, milho ou algodao'],
          },
        ],
      },
    },
  })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar propriedades com filtros',
    description:
      'Lista todas as propriedades com paginação e filtros por lead, cultura, cidade ou estado.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'leadId',
    required: false,
    type: String,
    description: 'UUID do lead',
  })
  @ApiQuery({
    name: 'crop',
    required: false,
    enum: ['soja', 'milho', 'algodao'],
  })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String, example: 'MG' })
  @ApiResponse({
    status: 200,
    description: 'Lista de propriedades paginada',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            leadId: 'uuid',
            crop: 'soja',
            areaHectares: 250,
            agronomicScore: 250,
            city: 'Uberlândia',
            state: 'MG',
          },
        ],
        meta: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  findAll(@Query() filters: FilterPropertiesDto) {
    const { page, limit, ...filterParams } = filters;
    const pagination = { page, limit };
    return this.propertiesService.findAll(filterParams, pagination);
  }

  @Get('lead/:leadId/insights')
  @ApiTags('analytics')
  @ApiOperation({
    summary: '⭐ Insights completos do lead',
    description:
      'Retorna análise completa das propriedades: score agronômico, mix de culturas (%), sugestões de ação, alertas de qualidade, timing agrícola, potencial de expansão.',
  })
  @ApiParam({
    name: 'leadId',
    type: String,
    description: 'UUID do lead',
  })
  @ApiResponse({
    status: 200,
    description: 'Insights completos',
    schema: {
      example: {
        leadId: 'uuid',
        totalProperties: 3,
        totalArea: 400,
        totalAgronomicScore: 435,
        isPriority: true,
        cropMix: [
          {
            crop: 'soja',
            totalArea: 250,
            totalProperties: 1,
            percentage: 62.5,
          },
        ],
        mainCrop: 'soja',
        dataQualityAlerts: [],
        actionSuggestions: [
          'Oferecer plano premium para grandes produtores (200+ ha)',
          'Algodão: alta demanda de insumos — campanha prioritária de NPK',
        ],
        cropSeasonInsight: 'soja: período de plantio',
        expansionPotential: true,
        cities: ['Uberlândia'],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lead não encontrado ou sem propriedades cadastradas',
  })
  getLeadInsights(@Param('leadId', ParseUUIDPipe) leadId: string) {
    return this.propertiesService.getLeadInsights(leadId);
  }

  @Get('analytics/hotspots')
  @ApiTags('analytics')
  @ApiOperation({
    summary: '⭐ Hotspots geográficos',
    description:
      'Retorna distribuição geográfica das propriedades. Lista municípios com mais propriedades cadastradas, ordenados por quantidade e área total.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de hotspots geográficos',
    schema: {
      example: [
        {
          city: 'Uberlândia',
          state: 'MG',
          count: 14,
          totalArea: 2340.5,
        },
        {
          city: 'Patos de Minas',
          state: 'MG',
          count: 9,
          totalArea: 1520,
        },
      ],
    },
  })
  getHotspots() {
    return this.propertiesService.getGeographicHotspots();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar propriedade por ID',
    description: 'Retorna todos os dados de uma propriedade específica.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da propriedade',
  })
  @ApiResponse({ status: 200, description: 'Propriedade encontrada' })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar propriedade',
    description:
      'Atualiza dados de uma propriedade. Não permite trocar de lead. Atualiza automaticamente os agregados do lead.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID da propriedade' })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiResponse({ status: 200, description: 'Propriedade atualizada' })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover propriedade',
    description:
      'Remove uma propriedade. Atualiza automaticamente os agregados do lead (totalAreaHectares, mainCrops, etc).',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID da propriedade' })
  @ApiResponse({ status: 204, description: 'Propriedade removida' })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.remove(id);
  }
}
