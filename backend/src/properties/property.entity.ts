import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { CropType } from './property.enums';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lead, (lead) => lead.properties, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ type: 'uuid', name: 'lead_id' })
  leadId: string;

  @Column({
    type: 'enum',
    enum: CropType,
  })
  crop: CropType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'area_hectares' })
  areaHectares: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 2, nullable: true })
  state?: string;

  @Column({ type: 'text', nullable: true })
  geometry?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
