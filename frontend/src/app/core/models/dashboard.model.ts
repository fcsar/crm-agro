export interface DashboardOverview {
  totalLeads: number;
  prioritarios: number;
  totalAreaHectares: number | null;
  averagePriorityScore: number;
  conversionRate: number;
  leadsByStatus: LeadsByStatusItem[];
  leadsByCity: LeadsByCityItem[];
  leadsByState: LeadsByStateItem[];
  leadsByOrigin: LeadsByOriginItem[];
  leadsBySegment: LeadsBySegmentItem[];
}

export interface LeadsByStatusItem {
  status: string;
  count: number;
}

export interface LeadsByCityItem {
  city: string;
  count: number;
}

export interface LeadsByStateItem {
  state: string;
  count: number;
}

export interface LeadsByOriginItem {
  origin: string;
  count: number;
}

export interface LeadsBySegmentItem {
  segment: string;
  count: number;
}

export interface FunnelMetrics {
  funnel: FunnelStage[];
  totalInFunnel: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number | null;
}
