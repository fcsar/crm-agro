import { CropType } from '../property.enums';

export class PropertySummaryDto {
  id: string;
  leadId: string;
  crop: CropType;
  areaHectares: number;
  city?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;

  agronomicScore?: number;
}

export class CropGroupDto {
  crop: CropType;
  totalArea: number;
  totalProperties: number;
  percentage: number;
}

export class PropertiesInsightDto {
  leadId: string;
  totalProperties: number;
  totalArea: number;
  totalAgronomicScore: number;
  isPriority: boolean;

  cropMix: CropGroupDto[];

  mainCrop: CropType;

  dataQualityAlerts: string[];

  actionSuggestions: string[];

  cropSeasonInsight?: string;

  expansionPotential?: boolean;

  cities: string[];
}
