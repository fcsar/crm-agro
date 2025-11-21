import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus, LeadOrigin, LeadSegment } from '../lead.entity';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Nome completo do lead',
    example: 'João Silva',
    minLength: 2,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser um texto' })
  @Length(2, 255, {
    message: 'O nome deve ter entre 2 e 255 caracteres',
  })
  name: string;

  @ApiProperty({
    description: 'Email do lead (único no sistema)',
    example: 'joao.silva@fazenda.com.br',
    uniqueItems: true,
  })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido. Use o formato: exemplo@email.com' })
  @MaxLength(255, { message: 'O email não pode ter mais de 255 caracteres' })
  email: string;

  @ApiPropertyOptional({
    description: 'CPF do lead (apenas 11 dígitos numéricos, único no sistema)',
    example: '12345678901',
    pattern: '^\\d{11}$',
  })
  @IsOptional()
  @IsString({ message: 'O CPF deve ser um texto' })
  @Matches(/^\d{11}$/, {
    message: 'CPF inválido. Use apenas 11 dígitos numéricos (ex: 12345678901)',
  })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Telefone (10 ou 11 dígitos numéricos)',
    example: '31999999999',
    pattern: '^[0-9]{10,11}$',
  })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser um texto' })
  @Matches(/^[0-9]{10,11}$/, {
    message:
      'Telefone inválido. Use apenas números, com 10 ou 11 dígitos (ex: 31999999999)',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Cidade do lead',
    example: 'Uberlândia',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'A cidade deve ser um texto' })
  @Length(2, 100, {
    message: 'A cidade deve ter entre 2 e 100 caracteres',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado (UF) - 2 caracteres maiúsculos',
    example: 'MG',
    default: 'MG',
    pattern: '^[A-Z]{2}$',
  })
  @IsOptional()
  @IsString({ message: 'O estado deve ser um texto' })
  @Length(2, 2, { message: 'Estado deve ter exatamente 2 caracteres (ex: MG)' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'Estado deve conter apenas letras maiúsculas (ex: MG, SP, RJ)',
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'Status atual do lead no funil de vendas',
    enum: LeadStatus,
    default: LeadStatus.NOVO,
  })
  @IsOptional()
  @IsEnum(LeadStatus, {
    message: `Status inválido. Use: ${Object.values(LeadStatus).join(', ')}`,
  })
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Origem do lead (canal de aquisição)',
    enum: LeadOrigin,
  })
  @IsOptional()
  @IsEnum(LeadOrigin, {
    message: `Origem inválida. Use: ${Object.values(LeadOrigin).join(', ')}`,
  })
  origin?: LeadOrigin;

  @ApiPropertyOptional({
    description:
      'Segmento do lead (calculado automaticamente baseado em totalAreaHectares)',
    enum: LeadSegment,
  })
  @IsOptional()
  @IsEnum(LeadSegment, {
    message: `Segmento inválido. Use: ${Object.values(LeadSegment).join(', ')}`,
  })
  segment?: LeadSegment;

  @ApiPropertyOptional({
    description: 'UUID do vendedor responsável',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID do vendedor deve ser um UUID válido' })
  assignedTo?: string;


  @ApiPropertyOptional({
    description: 'Observações gerais sobre o lead',
    example: 'Interessado em fertilizantes para soja',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'As observações devem ser um texto' })
  @MaxLength(1000, {
    message: 'As observações não podem ter mais de 1000 caracteres',
  })
  notes?: string;
}
