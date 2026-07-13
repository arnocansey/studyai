import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'GEMINI_API_KEY') return '';
              return undefined;
            },
          },
        },
        {
          provide: PrismaService,
          useValue: {
            auditLog: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('explainConcept Fallbacks', () => {
    it('should return python instructions when prompt contains python keywords', async () => {
      const response = await service.explainConcept('What is the syntax of python print?');
      expect(response).toContain('Python');
      expect(response).toContain('print(');
    });

    it('should return subnetting netmask values when networking terms are provided', async () => {
      const response = await service.explainConcept('Explain subnet boundaries for WAN links');
      expect(response).toContain('Subnet');
      expect(response).toContain('/30');
      expect(response).toContain('255.255.255.252');
    });

    it('should return SUID privilege guidelines for ethical hacking prompts', async () => {
      const response = await service.explainConcept('How do I run SUID overflow exploit?');
      expect(response).toContain('SUID');
      expect(response).toContain('vuln-helper');
    });

    it('should return a generic AI recommendation for general queries', async () => {
      const response = await service.explainConcept('Tell me about cloud architectures');
      expect(response).toContain('Tutor');
      expect(response).toContain('GEMINI_API_KEY');
    });
  });
});
