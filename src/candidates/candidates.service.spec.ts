import { ConflictException } from '@nestjs/common';
import { CandidatesRepository } from './candidates.repository';
import { CandidatesService } from './candidates.service';

describe('CandidatesService', () => {
  let repository: jest.Mocked<CandidatesRepository>;
  let service: CandidatesService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<CandidatesRepository>;
    service = new CandidatesService(repository);
  });

  it('returns a conflict when the owner already has a candidate with the email', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(
      service.create('owner-id', {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
