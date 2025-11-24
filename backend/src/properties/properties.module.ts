import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './property.entity';
import { Lead } from '../leads/lead.entity';
import { KmlProcessorService } from './kml-processor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Lead])],
  controllers: [PropertiesController],
  providers: [PropertiesService, KmlProcessorService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
