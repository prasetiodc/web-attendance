import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockImplementation((dto) => {
              if (dto.username === 'admin' && dto.password === 'password') {
                return Promise.resolve({
                  access_token: 'mock-jwt-token-xyz123',
                  user: { id: 1, username: 'admin', name: 'Administrator' },
                });
              }
              return Promise.reject(new UnauthorizedException('Invalid credentials'));
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token on correct credentials', async () => {
      const result = await controller.login({
        username: 'admin',
        password: 'password',
      });
      expect(result).toHaveProperty('access_token');
      expect(service.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password',
      });
    });

    it('should throw when service login throws', async () => {
      await expect(
        controller.login({
          username: 'admin',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
