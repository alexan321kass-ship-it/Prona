import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService - forgotPassword', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    prismaService = {
      usuario: {
        findUnique: jest.fn(),
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

  it('debe responder sin token si el correo no existe', async () => {
    prismaService.usuario.findUnique.mockResolvedValue(null);

    const result = await service.forgotPassword('noexiste@mail.com');

    expect(result.resetToken).toBeUndefined();
    expect(result.message).toContain('Si el correo está registrado');
  });

  it('debe generar código y token si el usuario existe sin lanzar error aun si falla el transporte', async () => {
    prismaService.usuario.findUnique.mockResolvedValue({
      id_usuario: 1,
      primer_nombre: 'Prueba',
      primer_apellido: 'Usuario',
      correo: 'prueba@mail.com',
      contrasena: '$2b$10$hashedpassword',
    });

    const result = await service.forgotPassword('prueba@mail.com');

    expect(result.resetToken).toBe('mocked-reset-token');
    expect(result.message).toContain('Código enviado');
  });
});
