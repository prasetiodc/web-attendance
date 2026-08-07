import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userModelMock: any;

  const mockUser = {
    id: 1,
    email: 'admin@example.com',
    password: 'password',
    role: 'admin',
    isActive: true,
    lastLogin: null,
    employeeId: 5,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    userModelMock = {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.email === 'admin@example.com') {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: userModelMock,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token-xyz123'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully validate correct credentials and return a token', async () => {
      const result = await service.login({
        username: 'admin@example.com',
        password: 'password',
      });
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-jwt-token-xyz123');
      expect(result.user.email).toBe('admin@example.com');
      expect(mockUser.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'admin@example.com',
        sub: 1,
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException for incorrect credentials', async () => {
      await expect(
        service.login({
          username: 'admin@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      await expect(
        service.login({
          username: 'nonexistent@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
