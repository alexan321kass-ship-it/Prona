import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { RolesGuard } from "../../../auth/roles.guard";

const contextoFake = (req: Record<string, unknown>): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

describe("CP-010-004: Bloqueo de acceso sin sesión (guards globales)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const superProto = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
    canActivate: (context: ExecutionContext) => boolean | Promise<boolean>;
  };

  it("JwtAuthGuard debe rechazar (401) una petición sin token en rutas privadas", async () => {
    jest
      .spyOn(superProto, "canActivate")
      .mockRejectedValue(new UnauthorizedException());

    const guard = new JwtAuthGuard(new Reflector());
    const contexto = contextoFake({
      url: "/api/reportes/historial",
      headers: {},
      cookies: {},
    });

    await expect(guard.canActivate(contexto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("Debe permitir el acceso a rutas marcadas con @Public sin token", async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const spy = jest.spyOn(superProto, "canActivate").mockResolvedValue(true);

    const guard = new JwtAuthGuard(reflector);
    const contexto = contextoFake({ url: "/api/auth/login", headers: {} });

    await expect(guard.canActivate(contexto)).resolves.toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("RolesGuard debe exigir rol Administrador para /reportes/historial", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(["Administrador"]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate(
        contextoFake({ user: { rol: { nombre_rol: "Administrador" } } }),
      ),
    ).toBe(true);
    expect(
      guard.canActivate(
        contextoFake({ user: { rol: { nombre_rol: "Asesor" } } }),
      ),
    ).toBe(false);
    expect(
      guard.canActivate(
        contextoFake({ user: { rol: { nombre_rol: "Super Administrador" } } }),
      ),
    ).toBe(true);
  });
});
