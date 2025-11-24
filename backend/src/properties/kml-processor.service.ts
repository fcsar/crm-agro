import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as tj from '@mapbox/togeojson';
import { DOMParser } from 'xmldom';
import * as turf from '@turf/helpers';
import area from '@turf/area';
import { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';

export interface KmlProcessResult {
  geometry: Polygon | MultiPolygon;
  areaHectares: number;
  geojsonString: string;
}

@Injectable()
export class KmlProcessorService {
  private readonly logger = new Logger(KmlProcessorService.name);

  processKmlFile(kmlContent: string): KmlProcessResult {
    try {
      const kmlDom = new DOMParser().parseFromString(kmlContent, 'text/xml');

      const geojson = tj.kml(kmlDom) as FeatureCollection;

      if (!geojson || !geojson.features || geojson.features.length === 0) {
        throw new BadRequestException(
          'Arquivo KML não contém geometrias válidas',
        );
      }

      const polygonFeature = this.extractPolygon(geojson);

      if (!polygonFeature) {
        throw new BadRequestException(
          'Nenhum polígono encontrado no arquivo KML. Certifique-se de que o arquivo contém um Polygon ou MultiPolygon.',
        );
      }

      const areaSquareMeters = area(polygonFeature);
      const areaHectares = Number((areaSquareMeters / 10000).toFixed(2));

      this.logger.log(
        `KML processado: ${areaHectares} hectares (${areaSquareMeters.toFixed(2)} m²)`,
      );

      return {
        geometry: polygonFeature.geometry as Polygon | MultiPolygon,
        areaHectares,
        geojsonString: JSON.stringify(polygonFeature.geometry),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Erro ao processar KML: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Erro ao processar arquivo KML: ${error.message}`,
      );
    }
  }

  private extractPolygon(
    geojson: FeatureCollection,
  ): Feature<Polygon | MultiPolygon> | null {
    for (const feature of geojson.features) {
      if (
        feature.geometry.type === 'Polygon' ||
        feature.geometry.type === 'MultiPolygon'
      ) {
        return feature as Feature<Polygon | MultiPolygon>;
      }

      if (feature.geometry.type === 'GeometryCollection') {
        for (const geometry of (feature.geometry as any).geometries) {
          if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            return turf.feature(geometry) as Feature<Polygon | MultiPolygon>;
          }
        }
      }
    }

    return null;
  }

  validateKmlContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Arquivo KML vazio');
    }

    if (!content.includes('<kml') && !content.includes('<?xml')) {
      throw new BadRequestException(
        'Arquivo não parece ser um KML válido. Certifique-se de que é um arquivo .kml do Google Earth.',
      );
    }
  }
}
