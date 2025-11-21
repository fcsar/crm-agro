import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { LeadComment } from './lead-comment.entity';
import { Property } from '../properties/property.entity';

export enum LeadStatus {
  NOVO = 'novo',
  CONTATADO = 'contatado',
  QUALIFICADO = 'qualificado',
  PROPOSTA = 'proposta',
  NEGOCIACAO = 'negociacao',
  GANHO = 'ganho',
  PERDIDO = 'perdido',
}

export enum LeadOrigin {
  INDICACAO = 'indicacao',
  FEIRA = 'feira',
  SITE = 'site',
  TELEFONE = 'telefone',
  WHATSAPP = 'whatsapp',
  REDE_SOCIAL = 'rede_social',
  VISITA_CAMPO = 'visita_campo',
  OUTROS = 'outros',
}

export enum LeadSegment {
  PEQUENO = 'pequeno',
  MEDIO = 'medio',
  GRANDE = 'grande',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 14, nullable: true, unique: true })
  cpf: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 2, default: 'MG' })
  state: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NOVO,
  })
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: LeadOrigin,
    nullable: true,
  })
  origin: LeadOrigin;

  @Column({
    type: 'enum',
    enum: LeadSegment,
    nullable: true,
  })
  segment: LeadSegment;

  @Column({ type: 'uuid', nullable: true, name: 'assigned_to' })
  assignedTo: string;

  @Column({ type: 'int', default: 0, name: 'priority_score' })
  priorityScore: number;

  @Column({ type: 'boolean', default: false, name: 'is_prioritario' })
  isPrioritario: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'total_area_hectares',
  })
  totalAreaHectares: number;

  @Column({ type: 'text', nullable: true, name: 'main_crops' })
  mainCrops: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => LeadComment, (comment) => comment.lead)
  comments: LeadComment[];

  @OneToMany(() => Property, (property) => property.lead)
  properties: Property[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_contact_at' })
  lastContactAt: Date;
}
