import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadsService } from './leads.service';
import { Lead, LeadStatus } from './lead.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: Repository<Lead>;

  const mockLead: Lead = {
    id: '123',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '31999999999',
    city: 'Uberlândia',
    state: 'MG',
    status: LeadStatus.NOVO,
    notes: 'Interessado em fertilizantes',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const createDto = {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '31999999999',
        city: 'Uberlândia',
        state: 'MG',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockLead);
      mockRepository.save.mockResolvedValue(mockLead);

      const result = await service.create(createDto);

      expect(result).toEqual(mockLead);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockLead);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto = {
        name: 'João Silva',
        email: 'joao@example.com',
      };

      mockRepository.findOne.mockResolvedValue(mockLead);

      try {
        await service.create(createDto);
        fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'O email joao@example.com já está cadastrado no sistema',
        );
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of leads', async () => {
      const leads = [mockLead];
      mockRepository.find.mockResolvedValue(leads);

      const result = await service.findAll();

      expect(result).toEqual(leads);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a lead by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockLead);

      const result = await service.findOne('123');

      expect(result).toEqual(mockLead);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      try {
        await service.findOne('999');
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    it('should update a lead', async () => {
      const updateDto = { name: 'João Silva Updated' };
      const updatedLead = { ...mockLead, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockLead);
      mockRepository.save.mockResolvedValue(updatedLead);

      const result = await service.update('123', updateDto);

      expect(result).toEqual(updatedLead);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a lead', async () => {
      mockRepository.findOne.mockResolvedValue(mockLead);
      mockRepository.remove.mockResolvedValue(mockLead);

      await service.remove('123');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockLead);
    });
  });
});
