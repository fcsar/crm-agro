import { CropType } from './enums';

export interface Property {
  id: string;
  leadId: string;
  crop: CropType;
  areaHectares: number;
  city?: string;
  state?: string;
  geometry?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDto {
  leadId: string;
  crop: CropType;
  areaHectares: number;
  city?: string;
  state?: string;
  geometry?: string;
}

export interface UpdatePropertyDto {
  crop?: CropType;
  areaHectares?: number;
  city?: string;
  state?: string;
  geometry?: string;
}

export interface FilterPropertiesDto {
  leadId?: string;
  crop?: CropType;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export interface PropertyInsights {
  totalProperties: number;
  totalArea: number;
  totalAgronomicScore: number;
  isPriority: boolean;
  cropMix: CropMixItem[];
  mainCrop: string;
  actionSuggestions: string[];
  cropSeasonInsight: string;
  expansionPotential: boolean;
  cities: string[];
}

export interface CropMixItem {
  crop: CropType;
  totalArea: number;
  percentage: number;
}

export interface GeographicHotspot {
  city: string;
  state: string;
  totalProperties: number;
  totalArea: number;
  averageArea: number;
  dominantCrop: CropType;
}
