import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadCommentDto {
  @ApiProperty({
    description: 'Texto do comentário',
    example: 'Cliente interessado em fertilizante para soja',
    maxLength: 2000,
  })
  @IsNotEmpty({ message: 'O comentário é obrigatório' })
  @IsString({ message: 'O comentário deve ser um texto' })
  @MaxLength(2000, {
    message: 'O comentário não pode ter mais de 2000 caracteres',
  })
  comment: string;

  @ApiPropertyOptional({
    description: 'Nome do autor do comentário',
    example: 'João Silva',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'O autor deve ser um texto' })
  @MaxLength(255, {
    message: 'O nome do autor não pode ter mais de 255 caracteres',
  })
  author?: string;
}
