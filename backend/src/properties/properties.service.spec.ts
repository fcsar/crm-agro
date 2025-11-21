import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { Lead } from '../leads/lead.entity';
import { CropType } from './property.enums';
import { NotFoundException } from '@nestjs/common';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let mockPropertiesRepository: any;
  let mockLeadsRepository: any;

  beforeEach(async () => {
    mockPropertiesRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };

    mockLeadsRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertiesRepository,
        },
        {
          provide: getRepositoryToken(Lead),
          useValue: mockLeadsRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma propriedade com sucesso', async () => {
      const dto = {
        leadId: 'lead-123',
        crop: CropType.SOJA,
        areaHectares: 250.5,
        city: 'Uberlândia',
        state: 'MG',
      };

      const mockLead = { id: 'lead-123', city: 'Uberlândia', state: 'MG' };
      const mockProperty = { id: 'prop-123', ...dto };

      mockLeadsRepository.findOne.mockResolvedValue(mockLead);
      mockPropertiesRepository.create.mockReturnValue(mockProperty);
      mockPropertiesRepository.save.mockResolvedValue(mockProperty);
      mockPropertiesRepository.find.mockResolvedValue([mockProperty]);

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockLeadsRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.leadId },
      });
    });

    it('deve lançar NotFoundException se lead não existir', async () => {
      const dto = {
        leadId: 'lead-inexistente',
        crop: CropType.SOJA,
        areaHectares: 100,
      };

      mockLeadsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLeadInsights', () => {
    it('deve gerar insights completos de um lead com múltiplas propriedades', async () => {
      const leadId = 'lead-123';
      const mockLead = { id: leadId };

      const mockProperties = [
        {
          leadId,
          crop: CropType.SOJA,
          areaHectares: '250',
          city: 'Uberlândia',
          state: 'MG',
        },
        {
          leadId,
          crop: CropType.SOJA,
          areaHectares: '100',
          city: 'Uberlândia',
          state: 'MG',
        },
        {
          leadId,
          crop: CropType.ALGODAO,
          areaHectares: '50',
          city: 'Uberlândia',
          state: 'MG',
        },
      ];

      mockLeadsRepository.findOne.mockResolvedValue(mockLead);
      mockPropertiesRepository.find.mockResolvedValue(mockProperties);

      const result = await service.getLeadInsights(leadId);

      expect(result).toBeDefined();
      expect(result.totalProperties).toBe(3);
      expect(result.totalArea).toBe(400);
      expect(result.isPriority).toBe(true);
      expect(result.cropMix).toHaveLength(2);
      expect(result.mainCrop).toBe(CropType.SOJA);
      expect(result.actionSuggestions).toBeDefined();
      expect(result.dataQualityAlerts).toBeDefined();
      expect(result.cropSeasonInsight).toBeDefined();
      expect(result.expansionPotential).toBe(true);
    });

    it('deve calcular score agronômico corretamente', async () => {
      const leadId = 'lead-123';
      const mockLead = { id: leadId };

      const mockProperties = [
        {
          leadId,
          crop: CropType.ALGODAO,
          areaHectares: '100',
          city: 'Uberlândia',
          state: 'MG',
        },
      ];

      mockLeadsRepository.findOne.mockResolvedValue(mockLead);
      mockPropertiesRepository.find.mockResolvedValue(mockProperties);

      const result = await service.getLeadInsights(leadId);

      expect(result.totalAgronomicScore).toBe(130);
    });

    it('deve detectar alertas de qualidade de dados', async () => {
      const leadId = 'lead-123';
      const mockLead = { id: leadId };

      const mockProperties = [
        {
          id: 'prop-1',
          leadId,
          crop: CropType.SOJA,
          areaHectares: '0.5',
          city: null,
          state: null,
        },
      ];

      mockLeadsRepository.findOne.mockResolvedValue(mockLead);
      mockPropertiesRepository.find.mockResolvedValue(mockProperties);

      const result = await service.getLeadInsights(leadId);

      expect(result.dataQualityAlerts.length).toBeGreaterThan(0);
      expect(
        result.dataQualityAlerts.some((a) => a.includes('área muito pequena')),
      ).toBe(true);
      expect(
        result.dataQualityAlerts.some((a) =>
          a.includes('localização incompleta'),
        ),
      ).toBe(true);
    });

    it('deve gerar sugestões de ação baseadas em área e cultura', async () => {
      const leadId = 'lead-123';
      const mockLead = { id: leadId };

      const mockProperties = [
        {
          leadId,
          crop: CropType.ALGODAO,
          areaHectares: '250',
          city: 'Uberlândia',
          state: 'MG',
        },
      ];

      mockLeadsRepository.findOne.mockResolvedValue(mockLead);
      mockPropertiesRepository.find.mockResolvedValue(mockProperties);

      const result = await service.getLeadInsights(leadId);

      expect(result.actionSuggestions.length).toBeGreaterThan(0);
      expect(result.actionSuggestions.some((s) => s.includes('Algodão'))).toBe(
        true,
      );
      expect(result.actionSuggestions.some((s) => s.includes('200+ ha'))).toBe(
        true,
      );
    });
  });

  describe('getGeographicHotspots', () => {
    it('deve retornar hotspots ordenados por quantidade', async () => {
      const mockProperties = [
        { city: 'Uberlândia', state: 'MG', areaHectares: '100' },
        { city: 'Uberlândia', state: 'MG', areaHectares: '200' },
        { city: 'Patos de Minas', state: 'MG', areaHectares: '150' },
        { city: 'Uberlândia', state: 'MG', areaHectares: '50' },
      ];

      mockPropertiesRepository.find.mockResolvedValue(mockProperties);

      const result = await service.getGeographicHotspots();

      expect(result).toBeDefined();
      expect(result[0].city).toBe('Uberlândia');
      expect(result[0].count).toBe(3);
      expect(result[0].totalArea).toBe(350);
    });
  });
});
