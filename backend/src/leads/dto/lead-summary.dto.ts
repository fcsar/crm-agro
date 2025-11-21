export class LeadSummaryDto {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  city?: string;
  state: string;
  status: string;
  origin?: string;
  segment?: string;
  assignedTo?: string;

  isPrioritario: boolean;
  priorityScore: number;
  totalAreaHectares?: number;
  mainCrops?: string[];

  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;

  daysSinceCreated?: number;
  daysSinceLastContact?: number;
}
