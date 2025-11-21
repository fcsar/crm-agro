import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CRM Agro API')
    .setDescription(
      'API de gestão de leads para distribuidores de fertilizantes com inteligência comercial agronômica',
    )
    .setVersion('1.0')
    .addTag('leads', 'Gestão de leads e contatos')
    .addTag('properties', 'Gestão de propriedades rurais')
    .addTag('analytics', 'Análises e insights')
    .setContact(
      'CRM Agro Team',
      'http://localhost:3000',
      'contato@crmagro.com.br',
    )
    .setLicense('MIT', 'https')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CRM Agro API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2d6a4f }
    `,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
