import { Test, TestingModule } from '@nestjs/testing';
import { ManosService, ManoLevantada } from '../services/manos.service';

/**
 * ============================================================================
 * UNIT TEST: ManosService
 * ============================================================================
 *
 * Sistema de "Levantar la Mano" para clases en vivo
 *
 * REGLAS DE NEGOCIO:
 * - Solo 1 mano levantada por estudiante a la vez (por sala)
 * - Lista ordenada por timestamp (FIFO - primero en levantar, primero en cola)
 * - Al dar palabra, la mano baja automáticamente
 * - Al desconectarse, se remueven las manos del usuario
 *
 * EQUIVALENCE CLASSES:
 * - Estado inicial: [sala vacía, sala con manos, sala no existe]
 * - Usuario: [con mano levantada, sin mano levantada]
 * - Rol: [estudiante, docente] (solo contexto, el service no valida)
 *
 * Run: cd apps/api && npm test -- --testPathPattern="manos.service" --runInBand
 */
describe('ManosService', () => {
  let service: ManosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManosService],
    }).compile();

    service = module.get<ManosService>(ManosService);
  });

  describe('levantarMano', () => {
    it('should_add_hand_to_list_when_student_raises_hand', () => {
      const mano = service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');

      expect(mano).toBeDefined();
      expect(mano.odooId).toBe('odoo-456');
      expect(mano.nombre).toBe('Juan Pérez');
      expect(mano.salaId).toBe('sala-123');
      expect(mano.timestamp).toBeInstanceOf(Date);
    });

    it('should_return_existing_hand_when_student_already_raised_hand', () => {
      const primeraMano = service.levantarMano(
        'sala-123',
        'odoo-456',
        'Juan Pérez',
      );

      // Esperar un poco para asegurar que el timestamp sería diferente si se actualizara
      const segundaMano = service.levantarMano(
        'sala-123',
        'odoo-456',
        'Juan Pérez',
      );

      // Debe retornar la misma mano (mismo timestamp) para mantener FIFO
      expect(segundaMano.timestamp.getTime()).toBe(
        primeraMano.timestamp.getTime(),
      );
    });

    it('should_allow_only_one_hand_per_student_per_room', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez'); // duplicado

      const manos = service.getManosLevantadas('sala-123');
      expect(manos).toHaveLength(1);
    });

    it('should_allow_same_student_to_raise_hand_in_different_rooms', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');
      service.levantarMano('sala-789', 'odoo-456', 'Juan Pérez');

      expect(service.contarManosLevantadas('sala-123')).toBe(1);
      expect(service.contarManosLevantadas('sala-789')).toBe(1);
    });
  });

  describe('bajarMano', () => {
    it('should_remove_hand_from_list_when_student_lowers_hand', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');

      const resultado = service.bajarMano('sala-123', 'odoo-456');

      expect(resultado).toBe(true);
      expect(service.contarManosLevantadas('sala-123')).toBe(0);
    });

    it('should_return_false_when_hand_was_not_raised', () => {
      const resultado = service.bajarMano('sala-123', 'odoo-456');

      expect(resultado).toBe(false);
    });

    it('should_return_false_when_room_does_not_exist', () => {
      const resultado = service.bajarMano('sala-inexistente', 'odoo-456');

      expect(resultado).toBe(false);
    });

    it('should_not_affect_other_hands_in_room', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');
      service.levantarMano('sala-123', 'odoo-789', 'María García');

      service.bajarMano('sala-123', 'odoo-456');

      expect(service.contarManosLevantadas('sala-123')).toBe(1);
      expect(service.tieneManoLevantada('sala-123', 'odoo-789')).toBe(true);
    });
  });

  describe('getManosLevantadas', () => {
    it('should_return_empty_array_when_no_hands_raised', () => {
      const manos = service.getManosLevantadas('sala-123');

      expect(manos).toEqual([]);
    });

    it('should_return_empty_array_when_room_does_not_exist', () => {
      const manos = service.getManosLevantadas('sala-inexistente');

      expect(manos).toEqual([]);
    });

    it('should_return_hands_sorted_by_timestamp_FIFO', async () => {
      // Levantar manos con pequeños delays para asegurar timestamps diferentes
      service.levantarMano('sala-123', 'odoo-1', 'Primero');
      await new Promise((resolve) => setTimeout(resolve, 10));
      service.levantarMano('sala-123', 'odoo-2', 'Segundo');
      await new Promise((resolve) => setTimeout(resolve, 10));
      service.levantarMano('sala-123', 'odoo-3', 'Tercero');

      const manos = service.getManosLevantadas('sala-123');

      expect(manos).toHaveLength(3);
      expect(manos[0].nombre).toBe('Primero');
      expect(manos[1].nombre).toBe('Segundo');
      expect(manos[2].nombre).toBe('Tercero');
    });

    it('should_return_all_hands_with_correct_data', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');

      const manos = service.getManosLevantadas('sala-123');

      expect(manos[0]).toMatchObject({
        odooId: 'odoo-456',
        nombre: 'Juan Pérez',
        salaId: 'sala-123',
      });
    });
  });

  describe('darPalabra', () => {
    it('should_lower_hand_automatically_when_giving_word', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');

      const mano = service.darPalabra('sala-123', 'odoo-456');

      expect(mano).toBeDefined();
      expect(mano?.nombre).toBe('Juan Pérez');
      expect(service.tieneManoLevantada('sala-123', 'odoo-456')).toBe(false);
    });

    it('should_return_undefined_when_student_has_no_hand_raised', () => {
      const mano = service.darPalabra('sala-123', 'odoo-456');

      expect(mano).toBeUndefined();
    });

    it('should_return_undefined_when_room_does_not_exist', () => {
      const mano = service.darPalabra('sala-inexistente', 'odoo-456');

      expect(mano).toBeUndefined();
    });

    it('should_not_affect_other_hands_in_room', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');
      service.levantarMano('sala-123', 'odoo-789', 'María García');

      service.darPalabra('sala-123', 'odoo-456');

      expect(service.contarManosLevantadas('sala-123')).toBe(1);
      expect(service.tieneManoLevantada('sala-123', 'odoo-789')).toBe(true);
    });
  });

  describe('tieneManoLevantada', () => {
    it('should_return_true_when_student_has_hand_raised', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');

      expect(service.tieneManoLevantada('sala-123', 'odoo-456')).toBe(true);
    });

    it('should_return_false_when_student_has_no_hand_raised', () => {
      expect(service.tieneManoLevantada('sala-123', 'odoo-456')).toBe(false);
    });

    it('should_return_false_when_room_does_not_exist', () => {
      expect(service.tieneManoLevantada('sala-inexistente', 'odoo-456')).toBe(
        false,
      );
    });
  });

  describe('contarManosLevantadas', () => {
    it('should_return_0_when_room_is_empty', () => {
      expect(service.contarManosLevantadas('sala-123')).toBe(0);
    });

    it('should_return_0_when_room_does_not_exist', () => {
      expect(service.contarManosLevantadas('sala-inexistente')).toBe(0);
    });

    it('should_return_correct_count_when_multiple_hands_raised', () => {
      service.levantarMano('sala-123', 'odoo-1', 'Estudiante 1');
      service.levantarMano('sala-123', 'odoo-2', 'Estudiante 2');
      service.levantarMano('sala-123', 'odoo-3', 'Estudiante 3');

      expect(service.contarManosLevantadas('sala-123')).toBe(3);
    });
  });

  describe('bajarTodasLasManos', () => {
    it('should_remove_all_hands_from_room', () => {
      service.levantarMano('sala-123', 'odoo-1', 'Estudiante 1');
      service.levantarMano('sala-123', 'odoo-2', 'Estudiante 2');
      service.levantarMano('sala-123', 'odoo-3', 'Estudiante 3');

      service.bajarTodasLasManos('sala-123');

      expect(service.contarManosLevantadas('sala-123')).toBe(0);
    });

    it('should_not_throw_when_room_does_not_exist', () => {
      expect(() => {
        service.bajarTodasLasManos('sala-inexistente');
      }).not.toThrow();
    });

    it('should_not_affect_other_rooms', () => {
      service.levantarMano('sala-123', 'odoo-1', 'Estudiante 1');
      service.levantarMano('sala-789', 'odoo-2', 'Estudiante 2');

      service.bajarTodasLasManos('sala-123');

      expect(service.contarManosLevantadas('sala-123')).toBe(0);
      expect(service.contarManosLevantadas('sala-789')).toBe(1);
    });
  });

  describe('removerManosPorUsuario', () => {
    it('should_remove_all_hands_of_user_from_all_rooms', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');
      service.levantarMano('sala-789', 'odoo-456', 'Juan Pérez');
      service.levantarMano('sala-abc', 'odoo-456', 'Juan Pérez');

      const salasAfectadas = service.removerManosPorUsuario('odoo-456');

      expect(salasAfectadas).toHaveLength(3);
      expect(salasAfectadas).toContain('sala-123');
      expect(salasAfectadas).toContain('sala-789');
      expect(salasAfectadas).toContain('sala-abc');
      expect(service.tieneManoLevantada('sala-123', 'odoo-456')).toBe(false);
      expect(service.tieneManoLevantada('sala-789', 'odoo-456')).toBe(false);
    });

    it('should_return_empty_array_when_user_has_no_hands_raised', () => {
      const salasAfectadas = service.removerManosPorUsuario('odoo-inexistente');

      expect(salasAfectadas).toEqual([]);
    });

    it('should_not_affect_other_users_hands', () => {
      service.levantarMano('sala-123', 'odoo-456', 'Juan Pérez');
      service.levantarMano('sala-123', 'odoo-789', 'María García');

      service.removerManosPorUsuario('odoo-456');

      expect(service.contarManosLevantadas('sala-123')).toBe(1);
      expect(service.tieneManoLevantada('sala-123', 'odoo-789')).toBe(true);
    });
  });
});
