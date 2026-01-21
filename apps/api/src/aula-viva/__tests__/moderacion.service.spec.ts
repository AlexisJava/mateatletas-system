import { Test, TestingModule } from '@nestjs/testing';
import { ModeracionService, TipoMuteo } from '../services/moderacion.service';

/**
 * ============================================================================
 * UNIT TEST: ModeracionService
 * ============================================================================
 *
 * Sistema de moderación para clases en vivo (mutear/expulsar)
 *
 * REGLAS DE NEGOCIO:
 * - Solo DOCENTE puede mutear/expulsar (validado en gateway, no aquí)
 * - Tipos de muteo: 'chat', 'audio', 'ambos'
 * - Expulsión dura 24 horas
 * - mutear-todos tiene lista de excepciones (ej: el docente)
 *
 * EQUIVALENCE CLASSES:
 * - Muteo: [no muteado, muteado-chat, muteado-audio, muteado-ambos]
 * - Expulsión: [no expulsado, expulsado-vigente, expulsado-expirado]
 *
 * Run: cd apps/api && npm test -- --testPathPattern="moderacion.service" --runInBand
 */
describe('ModeracionService', () => {
  let service: ModeracionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModeracionService],
    }).compile();

    service = module.get<ModeracionService>(ModeracionService);
  });

  describe('mutear', () => {
    it('should_add_user_to_muted_list_when_muting_chat', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBe('chat');
    });

    it('should_add_user_to_muted_list_when_muting_audio', () => {
      service.mutear('sala-123', 'odoo-456', 'audio');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBe('audio');
    });

    it('should_add_user_to_muted_list_when_muting_both', () => {
      service.mutear('sala-123', 'odoo-456', 'ambos');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBe('ambos');
    });

    it('should_update_mute_type_when_already_muted', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');
      service.mutear('sala-123', 'odoo-456', 'ambos');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBe('ambos');
    });

    it('should_allow_same_user_muted_in_different_rooms', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');
      service.mutear('sala-789', 'odoo-456', 'audio');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBe('chat');
      expect(service.estaMuteado('sala-789', 'odoo-456')).toBe('audio');
    });
  });

  describe('desmutear', () => {
    it('should_remove_user_from_muted_list_when_unmuting', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');

      const resultado = service.desmutear('sala-123', 'odoo-456');

      expect(resultado).toBe(true);
      expect(service.estaMuteado('sala-123', 'odoo-456')).toBeNull();
    });

    it('should_return_false_when_user_was_not_muted', () => {
      const resultado = service.desmutear('sala-123', 'odoo-456');

      expect(resultado).toBe(false);
    });

    it('should_return_false_when_room_does_not_exist', () => {
      const resultado = service.desmutear('sala-inexistente', 'odoo-456');

      expect(resultado).toBe(false);
    });

    it('should_not_affect_mute_in_other_rooms', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');
      service.mutear('sala-789', 'odoo-456', 'audio');

      service.desmutear('sala-123', 'odoo-456');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBeNull();
      expect(service.estaMuteado('sala-789', 'odoo-456')).toBe('audio');
    });
  });

  describe('mutearTodos', () => {
    it('should_mute_all_participants_except_excluded', () => {
      const participantes = ['odoo-1', 'odoo-2', 'odoo-3', 'odoo-docente'];

      const muteados = service.mutearTodos(
        'sala-123',
        'chat',
        ['odoo-docente'],
        participantes,
      );

      expect(muteados).toHaveLength(3);
      expect(muteados).toContain('odoo-1');
      expect(muteados).toContain('odoo-2');
      expect(muteados).toContain('odoo-3');
      expect(muteados).not.toContain('odoo-docente');
      expect(service.estaMuteado('sala-123', 'odoo-docente')).toBeNull();
    });

    it('should_mute_all_when_no_exclusions', () => {
      const participantes = ['odoo-1', 'odoo-2'];

      const muteados = service.mutearTodos(
        'sala-123',
        'ambos',
        [],
        participantes,
      );

      expect(muteados).toHaveLength(2);
      expect(service.estaMuteado('sala-123', 'odoo-1')).toBe('ambos');
      expect(service.estaMuteado('sala-123', 'odoo-2')).toBe('ambos');
    });

    it('should_return_empty_array_when_all_excluded', () => {
      const participantes = ['odoo-docente'];

      const muteados = service.mutearTodos(
        'sala-123',
        'chat',
        ['odoo-docente'],
        participantes,
      );

      expect(muteados).toHaveLength(0);
    });
  });

  describe('desmutearTodos', () => {
    it('should_unmute_all_participants_in_room', () => {
      service.mutear('sala-123', 'odoo-1', 'chat');
      service.mutear('sala-123', 'odoo-2', 'audio');
      service.mutear('sala-123', 'odoo-3', 'ambos');

      const desmuteados = service.desmutearTodos('sala-123');

      expect(desmuteados).toHaveLength(3);
      expect(service.estaMuteado('sala-123', 'odoo-1')).toBeNull();
      expect(service.estaMuteado('sala-123', 'odoo-2')).toBeNull();
      expect(service.estaMuteado('sala-123', 'odoo-3')).toBeNull();
    });

    it('should_return_empty_array_when_room_does_not_exist', () => {
      const desmuteados = service.desmutearTodos('sala-inexistente');

      expect(desmuteados).toEqual([]);
    });
  });

  describe('expulsar', () => {
    it('should_mark_user_as_expelled', () => {
      service.expulsar('sala-123', 'odoo-456');

      expect(service.estaExpulsado('sala-123', 'odoo-456')).toBe(true);
    });

    it('should_store_expulsion_reason_when_provided', () => {
      service.expulsar('sala-123', 'odoo-456', 'Comportamiento inadecuado');

      expect(service.getMotivoExpulsion('sala-123', 'odoo-456')).toBe(
        'Comportamiento inadecuado',
      );
    });

    it('should_remove_user_from_muted_list_when_expelled', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');

      service.expulsar('sala-123', 'odoo-456');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBeNull();
    });
  });

  describe('estaExpulsado', () => {
    it('should_return_true_when_user_is_expelled', () => {
      service.expulsar('sala-123', 'odoo-456');

      expect(service.estaExpulsado('sala-123', 'odoo-456')).toBe(true);
    });

    it('should_return_false_when_user_is_not_expelled', () => {
      expect(service.estaExpulsado('sala-123', 'odoo-456')).toBe(false);
    });

    it('should_return_false_when_room_does_not_exist', () => {
      expect(service.estaExpulsado('sala-inexistente', 'odoo-456')).toBe(false);
    });

    it('should_return_false_when_expulsion_expired', () => {
      // Este test simula una expulsión expirada manipulando el estado interno
      // En producción, la expulsión dura 24 horas
      service.expulsar('sala-123', 'odoo-456');

      // Simular que pasaron más de 24 horas
      const estadoInterno = (
        service as unknown as {
          estadoPorSala: Map<
            string,
            { expulsados: Map<string, { fecha: Date }> }
          >;
        }
      ).estadoPorSala.get('sala-123');

      if (estadoInterno) {
        const expulsion = estadoInterno.expulsados.get('odoo-456');
        if (expulsion) {
          // Poner fecha de hace 25 horas
          expulsion.fecha = new Date(Date.now() - 25 * 60 * 60 * 1000);
        }
      }

      expect(service.estaExpulsado('sala-123', 'odoo-456')).toBe(false);
    });
  });

  describe('estaMuteado', () => {
    it('should_return_mute_type_when_user_is_muted', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');

      expect(service.estaMuteado('sala-123', 'odoo-456')).toBe('chat');
    });

    it('should_return_null_when_user_is_not_muted', () => {
      expect(service.estaMuteado('sala-123', 'odoo-456')).toBeNull();
    });

    it('should_return_null_when_room_does_not_exist', () => {
      expect(service.estaMuteado('sala-inexistente', 'odoo-456')).toBeNull();
    });
  });

  describe('getEstadoUsuario', () => {
    it('should_return_complete_user_state', () => {
      service.mutear('sala-123', 'odoo-456', 'chat');

      const estado = service.getEstadoUsuario('sala-123', 'odoo-456');

      expect(estado.odooId).toBe('odoo-456');
      expect(estado.muteado).toBe('chat');
      expect(estado.expulsadoEn).toBeNull();
    });

    it('should_return_expelled_state_with_reason', () => {
      service.expulsar('sala-123', 'odoo-456', 'Spam');

      const estado = service.getEstadoUsuario('sala-123', 'odoo-456');

      expect(estado.expulsadoEn).toBeInstanceOf(Date);
      expect(estado.motivoExpulsion).toBe('Spam');
    });

    it('should_return_default_state_when_user_has_no_moderation', () => {
      const estado = service.getEstadoUsuario('sala-123', 'odoo-456');

      expect(estado.odooId).toBe('odoo-456');
      expect(estado.muteado).toBeNull();
      expect(estado.expulsadoEn).toBeNull();
    });
  });

  describe('getMuteados', () => {
    it('should_return_all_muted_users_in_room', () => {
      service.mutear('sala-123', 'odoo-1', 'chat');
      service.mutear('sala-123', 'odoo-2', 'audio');
      service.mutear('sala-123', 'odoo-3', 'ambos');

      const muteados = service.getMuteados('sala-123');

      expect(muteados).toHaveLength(3);
      expect(muteados).toContainEqual({ odooId: 'odoo-1', tipo: 'chat' });
      expect(muteados).toContainEqual({ odooId: 'odoo-2', tipo: 'audio' });
      expect(muteados).toContainEqual({ odooId: 'odoo-3', tipo: 'ambos' });
    });

    it('should_return_empty_array_when_no_muted_users', () => {
      const muteados = service.getMuteados('sala-123');

      expect(muteados).toEqual([]);
    });
  });

  describe('limpiarSala', () => {
    it('should_clear_all_moderation_state_for_room', () => {
      service.mutear('sala-123', 'odoo-1', 'chat');
      service.expulsar('sala-123', 'odoo-2');

      service.limpiarSala('sala-123');

      expect(service.estaMuteado('sala-123', 'odoo-1')).toBeNull();
      expect(service.estaExpulsado('sala-123', 'odoo-2')).toBe(false);
    });

    it('should_not_throw_when_room_does_not_exist', () => {
      expect(() => {
        service.limpiarSala('sala-inexistente');
      }).not.toThrow();
    });

    it('should_not_affect_other_rooms', () => {
      service.mutear('sala-123', 'odoo-1', 'chat');
      service.mutear('sala-789', 'odoo-1', 'audio');

      service.limpiarSala('sala-123');

      expect(service.estaMuteado('sala-123', 'odoo-1')).toBeNull();
      expect(service.estaMuteado('sala-789', 'odoo-1')).toBe('audio');
    });
  });
});
