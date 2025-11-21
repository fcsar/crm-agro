import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from './lead.entity';

@Entity('lead_comments')
export class LeadComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lead, (lead) => lead.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ type: 'uuid', name: 'lead_id' })
  leadId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  author: string;

  @Column({
    type: 'enum',
    enum: [
      'novo',
      'contatado',
      'qualificado',
      'proposta',
      'negociacao',
      'ganho',
      'perdido',
    ],
    nullable: true,
    name: 'lead_status_at_time',
  })
  leadStatusAtTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
