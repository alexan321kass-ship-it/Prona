import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService - forgotPassword', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    prismaService = {
      usuario: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-reset-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debe lanzar BadRequestException si el correo no existe', async () => {
    prismaService.usuario.findFirst.mockResolvedValue(null);

    await expect(service.forgotPassword('noexiste@mail.com')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe generar código y token si el usuario existe sin lanzar error aun si falla el transporte', async () => {
    prismaService.usuario.findFirst.mockResolvedValue({
      id_usuario: 1,
      primer_nombre: 'Prueba',
      primer_apellido: 'Usuario',
      correo: 'prueba@mail.com',
      contrasena: '$2b$10$hashedpassword',
    });

    const result = await service.forgotPassword('PRUEBA@MAIL.COM ');

    expect(result.resetToken).toBe('mocked-reset-token');
    expect(result.message).toContain('Código enviado');
  });
});

