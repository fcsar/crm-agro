import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Logger,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { CreateLeadCommentDto } from './dto/create-lead-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Lead } from './lead.entity';
import { LeadSummaryDto } from './dto/lead-summary.dto';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  private readonly logger = new Logger(LeadsController.name);

  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo lead',
    description:
      'Cria um novo lead no sistema. Campos totalAreaHectares, mainCrops e isPrioritario são calculados automaticamente com base nas propriedades cadastradas.',
  })
  @ApiBody({ type: CreateLeadDto })
  @ApiResponse({
    status: 201,
    description: 'Lead criado com sucesso',
    type: Lead,
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
            field: 'email',
            errors: ['Email inválido. Use o formato: exemplo@email.com'],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou CPF já cadastrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'O email joao@example.com já está cadastrado no sistema',
      },
    },
  })
  async create(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    this.logger.log(`Criando novo lead: ${createLeadDto.email}`);
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar leads com filtros',
    description:
      'Lista todos os leads com paginação e filtros avançados. Retorna dados paginados ordenados por priorityScore e data de criação.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'novo',
      'contatado',
      'qualificado',
      'proposta',
      'negociacao',
      'ganho',
      'perdido',
    ],
  })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String, example: 'MG' })
  @ApiQuery({
    name: 'origin',
    required: false,
    enum: [
      'indicacao',
      'feira',
      'site',
      'telefone',
      'whatsapp',
      'rede_social',
      'visita_campo',
      'outros',
    ],
  })
  @ApiQuery({
    name: 'segment',
    required: false,
    enum: ['pequeno', 'medio', 'grande'],
  })
  @ApiQuery({ name: 'isPrioritario', required: false, type: Boolean })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    type: String,
    description: 'UUID do vendedor',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Busca por nome, email ou CPF',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de leads paginada',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'João Silva',
            email: 'joao@example.com',
            isPrioritario: true,
            priorityScore: 85,
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  async findAll(@Query() filters: FilterLeadsDto) {
    const { page, limit, ...filterParams } = filters;
    const pagination = { page, limit };
    return this.leadsService.findAllPaginated(filterParams, pagination);
  }

  @Get('prioritarios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar leads prioritários',
    description:
      'Lista apenas leads com área total > 100 hectares. Ordenados por priorityScore e totalAreaHectares.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista de leads prioritários paginada',
  })
  async findPrioritarios(@Query() pagination: PaginationDto) {
    return this.leadsService.findPriority(pagination);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar lead por ID',
    description: 'Retorna todos os dados de um lead específico.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do lead',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Lead encontrado', type: Lead })
  @ApiResponse({
    status: 404,
    description: 'Lead não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: "Lead com ID 'xxx' não foi encontrado no sistema",
      },
    },
  })
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Lead> {
    return this.leadsService.findOne(id);
  }

  @Get(':id/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar lead com resumo e métricas',
    description:
      'Retorna lead com métricas calculadas: área total, culturas, dias desde criação, dias desde último contato.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID do lead' })
  @ApiResponse({
    status: 200,
    description: 'Resumo do lead',
    type: LeadSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async findOneSummary(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<LeadSummaryDto> {
    return this.leadsService.findOneSummary(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar lead',
    description:
      'Atualiza dados básicos do lead. Campos totalAreaHectares, mainCrops e isPrioritario são calculados automaticamente via módulo de Properties.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID do lead' })
  @ApiBody({ type: UpdateLeadDto })
  @ApiResponse({ status: 200, description: 'Lead atualizado', type: Lead })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  @ApiResponse({ status: 409, description: 'Email ou CPF duplicado' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ): Promise<Lead> {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar status do lead',
    description:
      'Atualiza apenas o status do lead. Controla transições no funil de vendas. Atualiza lastContactAt automaticamente.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID do lead' })
  @ApiBody({ type: UpdateLeadStatusDto })
  @ApiResponse({ status: 200, description: 'Status atualizado', type: Lead })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    return this.leadsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover lead',
    description:
      'Remove um lead do sistema. Todas as propriedades associadas também serão removidas (CASCADE).',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID do lead' })
  @ApiResponse({ status: 204, description: 'Lead removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.leadsService.remove(id);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Adicionar comentário ao lead',
    description:
      'Cria um comentário/nota no histórico do lead. Captura automaticamente o status do lead no momento.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID do lead' })
  @ApiBody({ type: CreateLeadCommentDto })
  @ApiResponse({ status: 201, description: 'Comentário adicionado' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async addComment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createCommentDto: CreateLeadCommentDto,
  ) {
    this.logger.log(`Adicionando comentário ao lead: ${id}`);
    return this.leadsService.addComment(id, createCommentDto);
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar comentários do lead',
    description:
      'Retorna todos os comentários de um lead com paginação. Ordenados por data de criação (mais recentes primeiro).',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID do lead' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de comentários paginada' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async getComments(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.leadsService.getComments(id, pagination);
  }
}
