import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeadStatus } from '../lead.entity';

export class UpdateLeadStatusDto {
  @IsNotEmpty({ message: 'O status é obrigatório' })
  @IsEnum(LeadStatus, {
    message: `Status inválido. Use: ${Object.values(LeadStatus).join(', ')}`,
  })
  status: LeadStatus;
}
