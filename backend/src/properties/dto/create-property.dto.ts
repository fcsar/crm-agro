import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CropType } from '../property.enums';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'UUID do lead proprietário (obrigatório)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'Lead é obrigatório' })
  @IsUUID('4', { message: 'leadId deve ser um UUID válido' })
  leadId: string;

  @ApiProperty({
    description: 'Cultura principal da propriedade',
    enum: CropType,
    example: CropType.SOJA,
  })
  @IsNotEmpty({ message: 'Cultura é obrigatória' })
  @IsEnum(CropType, {
    message: 'Cultura inválida. Use: soja, milho ou algodao',
  })
  crop: CropType;

  @ApiProperty({
    description: 'Área da propriedade em hectares (deve ser maior que zero)',
    example: 250.5,
    minimum: 0.01,
    type: Number,
  })
  @IsNotEmpty({ message: 'Área em hectares é obrigatória' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Área deve ser numérica' })
  @IsPositive({ message: 'Área deve ser maior que zero' })
  areaHectares: number;

  @ApiPropertyOptional({
    description:
      'Cidade da propriedade (opcional, herda do lead se não informado)',
    example: 'Uberlândia',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Cidade deve ser texto' })
  @MaxLength(100, { message: 'Cidade pode ter no máximo 100 caracteres' })
  city?: string;

  @ApiPropertyOptional({
    description:
      'Estado (UF) da propriedade (opcional, herda do lead se não informado)',
    example: 'MG',
    pattern: '^[A-Z]{2}$',
  })
  @IsOptional()
  @IsString({ message: 'Estado deve ser texto' })
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres (ex: MG)' })
  state?: string;

  @ApiPropertyOptional({
    description: 'Geometria da propriedade (GeoJSON, WKT, etc) - futuro',
    example: '{"type": "Polygon", "coordinates": [...]}',
  })
  @IsOptional()
  @IsString()
  geometry?: string;
}
