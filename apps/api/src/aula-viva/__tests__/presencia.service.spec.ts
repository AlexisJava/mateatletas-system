import { Test, TestingModule } from '@nestjs/testing';
import { PresenciaService, Participante } from '../services/presencia.service';

describe('PresenciaService', () => {
  let service: PresenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresenciaService],
    }).compile();

    service = module.get<PresenciaService>(PresenciaService);
  });

  const crearMockParticipante = (
    overrides: Partial<Participante> = {},
  ): Participante => ({
    odidentidadUsuario: 'user-123',
    odidentidadSala: 'clase-grupo-456',
    socketId: 'socket-abc',
    nombre: 'Juan Pérez',
    rol: 'ESTUDIANTE',
    conectadoEn: new Date(),
    ...overrides,
  });

  describe('agregarParticipante', () => {
    it('should_add_participant_to_room_when_valid_data', () => {
      const participante = crearMockParticipante();
      service.agregarParticipante(participante);

      const participantes = service.getParticipantesDeSala('clase-grupo-456');
      expect(participantes).toHaveLength(1);
      expect(participantes[0].odidentidadUsuario).toBe('user-123');
    });

    it('should_allow_same_user_in_multiple_rooms_when_different_sockets', () => {
      service.agregarParticipante(crearMockParticipante());
      service.agregarParticipante(
        crearMockParticipante({
          odidentidadSala: 'comision-789',
          socketId: 'socket-xyz',
        }),
      );

      const salas = service.getSalasDeSocket('socket-abc');
      expect(salas).toContain('clase-grupo-456');
    });

    it('should_track_socket_in_room_when_added', () => {
      service.agregarParticipante(crearMockParticipante());

      const salas = service.getSalasDeSocket('socket-abc');
      expect(salas).toContain('clase-grupo-456');
    });
  });

  describe('removerParticipante', () => {
    it('should_remove_participant_when_valid_socketId', () => {
      service.agregarParticipante(crearMockParticipante());
      service.removerParticipante('socket-abc');

      const participantes = service.getParticipantesDeSala('clase-grupo-456');
      expect(participantes).toHaveLength(0);
    });

    it('should_return_affected_rooms_when_participant_removed', () => {
      service.agregarParticipante(crearMockParticipante());

      const salasAfectadas = service.removerParticipante('socket-abc');
      expect(salasAfectadas).toContain('clase-grupo-456');
    });

    it('should_return_all_rooms_when_participant_in_multiple_rooms', () => {
      service.agregarParticipante(crearMockParticipante());
      service.agregarParticipante(
        crearMockParticipante({
          odidentidadSala: 'comision-789',
          socketId: 'socket-abc', // mismo socket, otra sala
        }),
      );

      const salasAfectadas = service.removerParticipante('socket-abc');
      expect(salasAfectadas).toContain('clase-grupo-456');
      expect(salasAfectadas).toContain('comision-789');
    });

    it('should_return_empty_array_when_socket_not_found', () => {
      const salasAfectadas = service.removerParticipante('socket-inexistente');
      expect(salasAfectadas).toEqual([]);
    });
  });

  describe('removerParticipanteDeSala', () => {
    it('should_remove_participant_only_from_specific_room', () => {
      service.agregarParticipante(crearMockParticipante());
      service.agregarParticipante(
        crearMockParticipante({
          odidentidadSala: 'comision-789',
          socketId: 'socket-abc',
        }),
      );

      service.removerParticipanteDeSala('socket-abc', 'clase-grupo-456');

      const salasRestantes = service.getSalasDeSocket('socket-abc');
      expect(salasRestantes).not.toContain('clase-grupo-456');
      expect(salasRestantes).toContain('comision-789');
    });

    it('should_not_throw_when_socket_not_in_room', () => {
      expect(() => {
        service.removerParticipanteDeSala('socket-abc', 'sala-inexistente');
      }).not.toThrow();
    });
  });

  describe('getParticipantesDeSala', () => {
    it('should_return_empty_array_when_room_not_exists', () => {
      const participantes = service.getParticipantesDeSala('sala-inexistente');
      expect(participantes).toEqual([]);
    });

    it('should_return_all_participants_when_room_has_multiple', () => {
      service.agregarParticipante(crearMockParticipante());
      service.agregarParticipante(
        crearMockParticipante({
          odidentidadUsuario: 'user-456',
          socketId: 'socket-def',
          nombre: 'María García',
        }),
      );

      const participantes = service.getParticipantesDeSala('clase-grupo-456');
      expect(participantes).toHaveLength(2);
    });

    it('should_return_participants_with_correct_data', () => {
      service.agregarParticipante(crearMockParticipante({ rol: 'DOCENTE' }));

      const participantes = service.getParticipantesDeSala('clase-grupo-456');
      expect(participantes[0].rol).toBe('DOCENTE');
      expect(participantes[0].nombre).toBe('Juan Pérez');
    });
  });

  describe('getParticipante', () => {
    it('should_return_participant_when_socketId_exists', () => {
      service.agregarParticipante(crearMockParticipante());

      const participante = service.getParticipante('socket-abc');
      expect(participante?.nombre).toBe('Juan Pérez');
    });

    it('should_return_undefined_when_socketId_not_exists', () => {
      const participante = service.getParticipante('socket-inexistente');
      expect(participante).toBeUndefined();
    });
  });

  describe('getSalasDeSocket', () => {
    it('should_return_empty_array_when_socket_not_exists', () => {
      const salas = service.getSalasDeSocket('socket-inexistente');
      expect(salas).toEqual([]);
    });

    it('should_return_all_rooms_when_socket_in_multiple', () => {
      service.agregarParticipante(crearMockParticipante());
      service.agregarParticipante(
        crearMockParticipante({
          odidentidadSala: 'comision-789',
          socketId: 'socket-abc',
        }),
      );

      const salas = service.getSalasDeSocket('socket-abc');
      expect(salas).toHaveLength(2);
      expect(salas).toContain('clase-grupo-456');
      expect(salas).toContain('comision-789');
    });
  });
});
