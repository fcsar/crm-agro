import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LeadStatus, LeadOrigin, LeadSegment } from '../lead.entity';

export class FilterLeadsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limite deve ser um número inteiro' })
  @Min(1, { message: 'Limite deve ser no mínimo 1' })
  @Max(100, { message: 'Limite não pode ser maior que 100' })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(LeadStatus, {
    message: `Status inválido. Use: ${Object.values(LeadStatus).join(', ')}`,
  })
  status?: LeadStatus;

  @IsOptional()
  @IsString({ message: 'Cidade deve ser texto' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Estado deve ser texto' })
  state?: string;

  @IsOptional()
  @IsEnum(LeadOrigin, {
    message: `Origem inválida. Use: ${Object.values(LeadOrigin).join(', ')}`,
  })
  origin?: LeadOrigin;

  @IsOptional()
  @IsEnum(LeadSegment, {
    message: `Segmento inválido. Use: ${Object.values(LeadSegment).join(', ')}`,
  })
  segment?: LeadSegment;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'boolean') return value;
    return value;
  })
  @IsBoolean({ message: 'isPrioritario deve ser true ou false' })
  isPrioritario?: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'ID do vendedor deve ser um UUID válido' })
  assignedTo?: string;

  @IsOptional()
  @IsString({ message: 'Busca deve ser texto' })
  search?: string;
}
