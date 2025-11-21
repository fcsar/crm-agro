import {
  IsEnum,
  IsOptional,
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CropType } from '../property.enums';

export class FilterPropertiesDto {
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
  @IsUUID('4', { message: 'leadId deve ser um UUID válido' })
  leadId?: string;

  @IsOptional()
  @IsEnum(CropType, {
    message: 'Cultura inválida. Use: soja, milho ou algodao',
  })
  crop?: CropType;

  @IsOptional()
  @IsString({ message: 'Cidade deve ser texto' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Estado deve ser texto' })
  state?: string;
}
