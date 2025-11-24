import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus, LeadSegment } from './lead.entity';
import { LeadComment } from './lead-comment.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { LeadSummaryDto } from './dto/lead-summary.dto';
import { CreateLeadCommentDto } from './dto/create-lead-comment.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
    @InjectRepository(LeadComment)
    private readonly commentsRepository: Repository<LeadComment>,
  ) {}

  private calculatePriorityScore(lead: Partial<Lead>): number {
    let score = 0;

    if (lead.totalAreaHectares) {
      if (lead.totalAreaHectares > 100) score += 50;
      else if (lead.totalAreaHectares > 50) score += 30;
      else if (lead.totalAreaHectares > 0) score += 10;
    }

    if (lead.origin === 'indicacao') score += 20;
    if (lead.origin === 'feira') score += 15;

    if (lead.status === LeadStatus.QUALIFICADO) score += 10;
    if (lead.status === LeadStatus.PROPOSTA) score += 15;
    if (lead.status === LeadStatus.NEGOCIACAO) score += 20;

    if (!lead.assignedTo) score += 5;

    return score;
  }

  private defineSegment(totalAreaHectares?: number): LeadSegment | null {
    if (!totalAreaHectares) return null;

    if (totalAreaHectares < 50) return LeadSegment.PEQUENO;
    if (totalAreaHectares <= 100) return LeadSegment.MEDIO;
    return LeadSegment.GRANDE;
  }

  private toSummaryDto(lead: Lead): LeadSummaryDto {
    const now = new Date();
    const daysSinceCreated = Math.floor(
      (now.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const daysSinceLastContact = lead.lastContactAt
      ? Math.floor(
          (now.getTime() - lead.lastContactAt.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      cpf: lead.cpf,
      phone: lead.phone,
      city: lead.city,
      state: lead.state,
      status: lead.status,
      origin: lead.origin,
      segment: lead.segment,
      assignedTo: lead.assignedTo,
      isPrioritario: lead.isPrioritario,
      priorityScore: lead.priorityScore,
      totalAreaHectares: lead.totalAreaHectares
        ? Number(lead.totalAreaHectares)
        : undefined,
      mainCrops: lead.mainCrops ? JSON.parse(lead.mainCrops) : undefined,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      lastContactAt: lead.lastContactAt,
      daysSinceCreated,
      daysSinceLastContact,
    };
  }

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      const existingEmail = await this.leadsRepository.findOne({
        where: { email: createLeadDto.email },
      });

      if (existingEmail) {
        this.logger.warn(
          `Tentativa de criar lead com email duplicado: ${createLeadDto.email}`,
        );
        throw new ConflictException(
          `O email ${createLeadDto.email} já está cadastrado no sistema`,
        );
      }

      if (createLeadDto.cpf) {
        const existingCpf = await this.leadsRepository.findOne({
          where: { cpf: createLeadDto.cpf },
        });

        if (existingCpf) {
          this.logger.warn(
            `Tentativa de criar lead com CPF duplicado: ${createLeadDto.cpf}`,
          );
          throw new ConflictException(
            `O CPF ${createLeadDto.cpf} já está cadastrado no sistema`,
          );
        }
      }

      const leadData = {
        ...createLeadDto,
        state: createLeadDto.state || 'MG',
        status: createLeadDto.status || LeadStatus.NOVO,
      };

      const lead = this.leadsRepository.create(leadData);

      lead.segment = this.defineSegment(lead.totalAreaHectares);
      lead.priorityScore = this.calculatePriorityScore(lead);

      const savedLead = await this.leadsRepository.save(lead);

      this.logger.log(
        `Lead criado com sucesso: ${savedLead.id} - Score inicial: ${savedLead.priorityScore}`,
      );
      return savedLead;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Erro ao criar lead: ${error.message}`, error.stack);
      throw new BadRequestException('Não foi possível criar o lead');
    }
  }

  async findOne(id: string): Promise<Lead> {
    try {
      const lead = await this.leadsRepository.findOne({ where: { id } });

      if (!lead) {
        this.logger.warn(`Lead não encontrado: ${id}`);
        throw new NotFoundException(
          `Lead com ID '${id}' não foi encontrado no sistema`,
        );
      }

      return lead;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao buscar lead ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível buscar o lead');
    }
  }

  async findOneSummary(id: string): Promise<LeadSummaryDto> {
    const lead = await this.findOne(id);
    return this.toSummaryDto(lead);
  }

  async findPriority(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<LeadSummaryDto>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const [leads, total] = await this.leadsRepository.findAndCount({
        where: { isPrioritario: true },
        order: {
          priorityScore: 'DESC',
          totalAreaHectares: 'DESC',
        },
        take: limit,
        skip,
      });

      const data = leads.map((lead) => this.toSummaryDto(lead));
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
        `Erro ao buscar leads prioritários: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Não foi possível buscar os leads prioritários',
      );
    }
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    try {
      const lead = await this.findOne(id);

      if (updateLeadDto.email && updateLeadDto.email !== lead.email) {
        const existingLead = await this.leadsRepository.findOne({
          where: { email: updateLeadDto.email },
        });

        if (existingLead) {
          this.logger.warn(
            `Tentativa de atualizar lead ${id} com email duplicado: ${updateLeadDto.email}`,
          );
          throw new ConflictException(
            `O email ${updateLeadDto.email} já está cadastrado no sistema`,
          );
        }
      }

      if (updateLeadDto.cpf && updateLeadDto.cpf !== lead.cpf) {
        const existingCpf = await this.leadsRepository.findOne({
          where: { cpf: updateLeadDto.cpf },
        });

        if (existingCpf) {
          this.logger.warn(
            `Tentativa de atualizar lead ${id} com CPF duplicado: ${updateLeadDto.cpf}`,
          );
          throw new ConflictException(
            `O CPF ${updateLeadDto.cpf} já está cadastrado no sistema`,
          );
        }
      }

      Object.assign(lead, updateLeadDto);

      lead.priorityScore = this.calculatePriorityScore(lead);

      const updatedLead = await this.leadsRepository.save(lead);

      this.logger.log(`Lead atualizado com sucesso: ${id}`);
      return updatedLead;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Erro ao atualizar lead ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível atualizar o lead');
    }
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    try {
      const lead = await this.findOne(id);

      const oldStatus = lead.status;
      lead.status = updateStatusDto.status;

      if (
        [
          LeadStatus.CONTATADO,
          LeadStatus.QUALIFICADO,
          LeadStatus.PROPOSTA,
          LeadStatus.NEGOCIACAO,
        ].includes(updateStatusDto.status)
      ) {
        lead.lastContactAt = new Date();
      }

      lead.priorityScore = this.calculatePriorityScore(lead);

      const updatedLead = await this.leadsRepository.save(lead);

      this.logger.log(
        `Status do lead ${id} atualizado: ${oldStatus} → ${updateStatusDto.status}`,
      );
      return updatedLead;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao atualizar status do lead ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Não foi possível atualizar o status do lead',
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const lead = await this.findOne(id);
      await this.leadsRepository.remove(lead);

      this.logger.log(`Lead removido com sucesso: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao remover lead ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível remover o lead');
    }
  }

  async addComment(
    leadId: string,
    createCommentDto: CreateLeadCommentDto,
  ): Promise<LeadComment> {
    try {
      const lead = await this.findOne(leadId);

      const comment = this.commentsRepository.create({
        leadId,
        message: createCommentDto.comment,
        author: createCommentDto.author,
        leadStatusAtTime: lead.status,
      });

      const savedComment = await this.commentsRepository.save(comment);

      this.logger.log(`Comentário adicionado ao lead ${leadId}`);
      return savedComment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao adicionar comentário ao lead ${leadId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível adicionar o comentário');
    }
  }

  async getComments(
    leadId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<LeadComment>> {
    try {
      await this.findOne(leadId);

      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const [data, total] = await this.commentsRepository.findAndCount({
        where: { leadId },
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
      });

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
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao buscar comentários do lead ${leadId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Não foi possível buscar os comentários');
    }
  }

  async findAllPaginated(
    filters: FilterLeadsDto,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<LeadSummaryDto>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      let query = this.leadsRepository
        .createQueryBuilder('lead')
        .orderBy('lead.priorityScore', 'DESC')
        .addOrderBy('lead.createdAt', 'DESC')
        .take(limit)
        .skip(skip);

      if (filters) {
        if (filters.status) {
          query = query.andWhere('lead.status = :status', {
            status: filters.status,
          });
        }
        if (filters.city) {
          query = query.andWhere('lead.city ILIKE :city', {
            city: `%${filters.city}%`,
          });
        }
        if (filters.state) {
          query = query.andWhere('lead.state = :state', {
            state: filters.state,
          });
        }
        if (filters.origin) {
          query = query.andWhere('lead.origin = :origin', {
            origin: filters.origin,
          });
        }
        if (filters.segment) {
          query = query.andWhere('lead.segment = :segment', {
            segment: filters.segment,
          });
        }
        if (filters.isPrioritario !== undefined) {
          query = query.andWhere('lead.isPrioritario = :isPrioritario', {
            isPrioritario: filters.isPrioritario,
          });
        }
        if (filters.assignedTo) {
          query = query.andWhere('lead.assignedTo = :assignedTo', {
            assignedTo: filters.assignedTo,
          });
        }
        if (filters.search) {
          query = query.andWhere(
            '(lead.name ILIKE :search OR lead.email ILIKE :search OR lead.cpf ILIKE :search)',
            { search: `%${filters.search}%` },
          );
        }
      }

      const [leads, total] = await query.getManyAndCount();

      const data = leads.map((lead) => this.toSummaryDto(lead));
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
      this.logger.error(`Erro ao buscar leads: ${error.message}`, error.stack);
      throw new BadRequestException('Não foi possível buscar os leads');
    }
  }
}
