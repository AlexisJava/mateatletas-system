import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io, Socket } from 'socket.io-client';
import { AulaVivaGateway } from '../src/aula-viva/aula-viva.gateway';
import { PresenciaService } from '../src/aula-viva/services/presencia.service';

/** Estructura esperada del mensaje */
interface MensajeChat {
  id: string;
  visibleIdUsuario: string;
  nombreUsuario: string;
  rol: 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN';
  contenido: string;
  timestamp: string;
  salaId: string;
}

/** Respuesta de unirse a sala */
interface UnirseSalaResponse {
  exito: boolean;
  salaId: string;
}

/** Respuesta de enviar mensaje */
interface EnviarMensajeResponse {
  exito: boolean;
  mensaje?: MensajeChat;
  error?: string;
}

/**
 * Tests E2E para funcionalidad de Chat en Aula Viva
 *
 * Estos tests verifican la comunicación real WebSocket.
 * Usa un módulo de testing aislado sin dependencias de DB.
 */
describe('Chat E2E (AulaVivaGateway)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let clienteA: Socket | undefined;
  let clienteB: Socket | undefined;
  let clienteC: Socket | undefined;
  const PORT = 3847;
  const JWT_SECRET = 'test-secret-for-e2e-chat-tests';

  // Datos de usuarios de prueba
  const docenteData = {
    sub: 'docente-uuid-123',
    nombre: 'Prof. García',
    rol: 'DOCENTE',
  };

  const estudianteAData = {
    sub: 'estudiante-uuid-456',
    nombre: 'Juan Pérez',
    rol: 'ESTUDIANTE',
  };

  const estudianteBData = {
    sub: 'estudiante-uuid-789',
    nombre: 'María López',
    rol: 'ESTUDIANTE',
  };

  beforeAll(async () => {
    // Módulo de testing aislado - sin dependencias de base de datos
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [AulaVivaGateway, PresenciaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
    await app.listen(PORT);
  });

  afterAll(async () => {
    await app?.close();
  });

  afterEach(async () => {
    // Limpiar clientes después de cada test
    if (clienteA?.connected) clienteA.disconnect();
    if (clienteB?.connected) clienteB.disconnect();
    if (clienteC?.connected) clienteC.disconnect();
    clienteA = undefined;
    clienteB = undefined;
    clienteC = undefined;
    // Pequeña pausa para cleanup
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  // Helper: Generar token JWT
  const generarToken = (payload: {
    sub: string;
    nombre: string;
    rol: string;
  }): string => {
    return jwtService.sign(payload);
  };

  // Helper: Crear cliente WebSocket autenticado
  const crearCliente = (token: string): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      const cliente = io(`http://localhost:${PORT}/aula-viva`, {
        auth: { token },
        transports: ['websocket'],
        forceNew: true,
      });

      cliente.on('connect', () => resolve(cliente));
      cliente.on('connect_error', (err) => reject(err));

      setTimeout(() => reject(new Error('Timeout conectando cliente')), 5000);
    });
  };

  // Helper: Unirse a una sala
  const unirseSala = (
    cliente: Socket,
    claseGrupoId: string,
  ): Promise<UnirseSalaResponse> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de unirse-sala'));
      }, 3000);

      cliente.emit(
        'unirse-sala',
        { claseGrupoId },
        (response: UnirseSalaResponse) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  // Helper: Enviar mensaje
  const enviarMensaje = (
    cliente: Socket,
    salaId: string,
    contenido: string,
  ): Promise<EnviarMensajeResponse> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de enviar-mensaje'));
      }, 3000);

      cliente.emit(
        'enviar-mensaje',
        { salaId, contenido },
        (response: EnviarMensajeResponse) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  describe('enviar-mensaje', () => {
    it('should_receive_own_message_after_sending', async () => {
      // Arrange
      const token = generarToken(docenteData);
      clienteA = await crearCliente(token);
      const { salaId } = await unirseSala(
        clienteA,
        '11111111-1111-4111-8111-111111111101',
      );

      // 1. Registrar listener ANTES de enviar
      const mensajeRecibido = new Promise<MensajeChat>((resolve) => {
        clienteA!.on('nuevo-mensaje', (mensaje: MensajeChat) => {
          resolve(mensaje);
        });
      });

      // 2. Enviar sin esperar callback (evitar race condition)
      clienteA!.emit('enviar-mensaje', { salaId, contenido: 'Hola a todos!' });

      // Assert
      const mensaje = await mensajeRecibido;
      expect(mensaje.contenido).toBe('Hola a todos!');
      expect(mensaje.visibleIdUsuario).toBe(docenteData.sub);
      expect(mensaje.nombreUsuario).toBe(docenteData.nombre);
      expect(mensaje.rol).toBe(docenteData.rol);
    });

    it('should_receive_messages_from_other_participants_in_same_room', async () => {
      // Arrange
      const tokenA = generarToken(docenteData);
      const tokenB = generarToken(estudianteAData);

      clienteA = await crearCliente(tokenA);
      clienteB = await crearCliente(tokenB);

      const { salaId } = await unirseSala(
        clienteA,
        '22222222-2222-4222-8222-222222222202',
      );
      await unirseSala(clienteB, '22222222-2222-4222-8222-222222222202');

      const mensajeRecibidoPorB = new Promise<MensajeChat>((resolve) => {
        clienteB!.on('nuevo-mensaje', (mensaje: MensajeChat) => {
          resolve(mensaje);
        });
      });

      // Act
      await enviarMensaje(clienteA, salaId, 'Bienvenidos a la clase');

      // Assert
      const mensaje = await mensajeRecibidoPorB;
      expect(mensaje.contenido).toBe('Bienvenidos a la clase');
      expect(mensaje.nombreUsuario).toBe(docenteData.nombre);
    });

    it('should_NOT_receive_messages_from_other_rooms', async () => {
      // Arrange
      const tokenA = generarToken(docenteData);
      const tokenB = generarToken(estudianteAData);

      clienteA = await crearCliente(tokenA);
      clienteB = await crearCliente(tokenB);

      const { salaId: sala1 } = await unirseSala(
        clienteA,
        '33333333-3333-4333-8333-333333333301',
      );
      await unirseSala(clienteB, '33333333-3333-4333-8333-333333333302');

      let mensajeRecibido = false;
      clienteB!.on('nuevo-mensaje', () => {
        mensajeRecibido = true;
      });

      // Act
      await enviarMensaje(clienteA, sala1, 'Mensaje privado sala 1');

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Assert
      expect(mensajeRecibido).toBe(false);
    });

    it('should_include_complete_message_structure', async () => {
      // Arrange
      const token = generarToken(estudianteAData);
      clienteA = await crearCliente(token);
      const { salaId } = await unirseSala(
        clienteA,
        '44444444-4444-4444-8444-444444444403',
      );

      const mensajeRecibido = new Promise<MensajeChat>((resolve) => {
        clienteA!.on('nuevo-mensaje', (mensaje: MensajeChat) => {
          resolve(mensaje);
        });
      });

      // Act
      await enviarMensaje(clienteA, salaId, 'Test de estructura');

      // Assert
      const mensaje = await mensajeRecibido;

      expect(mensaje).toMatchObject({
        visibleIdUsuario: estudianteAData.sub,
        nombreUsuario: estudianteAData.nombre,
        rol: 'ESTUDIANTE',
        contenido: 'Test de estructura',
        salaId,
      });

      // Verificar campos adicionales
      expect(mensaje.id).toBeDefined();
      expect(typeof mensaje.id).toBe('string');
      expect(mensaje.timestamp).toBeDefined();
      expect(new Date(mensaje.timestamp).getTime()).not.toBeNaN();
    });

    it('should_reject_message_if_not_in_any_room', async () => {
      // Arrange
      const token = generarToken(estudianteAData);
      clienteA = await crearCliente(token);
      // No unirse a ninguna sala

      // Act
      const response = await enviarMensaje(
        clienteA,
        'sala-inexistente',
        'Mensaje sin sala',
      );

      // Assert
      expect(response.exito).toBe(false);
      expect(response.error).toContain('No estás en esta sala');
    });

    it('should_reject_empty_message', async () => {
      // Arrange
      const token = generarToken(docenteData);
      clienteA = await crearCliente(token);
      // UUID válido v4 para pasar validación del DTO
      const { salaId } = await unirseSala(
        clienteA,
        '11111111-1111-4111-8111-111111111104',
      );

      // Act
      const response = await enviarMensaje(clienteA, salaId, '   ');

      // Assert
      expect(response.exito).toBe(false);
      expect(response.error).toContain('vacío');
    });

    it('should_reject_message_exceeding_max_length', async () => {
      // Arrange
      const token = generarToken(docenteData);
      clienteA = await crearCliente(token);
      const { salaId } = await unirseSala(
        clienteA,
        '55555555-5555-4555-8555-555555555505',
      );
      const mensajeLargo = 'a'.repeat(2001);

      // Act
      const response = await enviarMensaje(clienteA, salaId, mensajeLargo);

      // Assert
      expect(response.exito).toBe(false);
      expect(response.error).toContain('2000');
    });
  });
});
