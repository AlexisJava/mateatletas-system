import { describe, it, expect } from 'vitest';
import {
  themeRegistry,
  casaThemeMap,
  getThemeByName,
  getThemeByCasa,
  listThemeNames,
} from '../themes';
import { defaultTheme } from '../themes/default';
import { casaQuantumTheme } from '../themes/casa-quantum';
import { casaVertexTheme } from '../themes/casa-vertex';
import { casaPulsarTheme } from '../themes/casa-pulsar';

describe('Theme Registry', () => {
  describe('themeRegistry', () => {
    it('should_contain_all_themes', () => {
      expect(themeRegistry['default']).toBeDefined();
      expect(themeRegistry['casa-quantum']).toBeDefined();
      expect(themeRegistry['casa-vertex']).toBeDefined();
      expect(themeRegistry['casa-pulsar']).toBeDefined();
    });

    it('should_have_4_themes', () => {
      expect(Object.keys(themeRegistry).length).toBe(4);
    });
  });

  describe('casaThemeMap', () => {
    it('should_map_quantum_to_quantum_theme', () => {
      expect(casaThemeMap['QUANTUM']).toBe(casaQuantumTheme);
    });

    it('should_map_vertex_to_vertex_theme', () => {
      expect(casaThemeMap['VERTEX']).toBe(casaVertexTheme);
    });

    it('should_map_pulsar_to_pulsar_theme', () => {
      expect(casaThemeMap['PULSAR']).toBe(casaPulsarTheme);
    });
  });

  describe('getThemeByName', () => {
    it('should_return_theme_for_valid_name', () => {
      expect(getThemeByName('default')).toBe(defaultTheme);
      expect(getThemeByName('casa-quantum')).toBe(casaQuantumTheme);
      expect(getThemeByName('casa-vertex')).toBe(casaVertexTheme);
      expect(getThemeByName('casa-pulsar')).toBe(casaPulsarTheme);
    });

    it('should_return_default_for_invalid_name', () => {
      expect(getThemeByName('non-existent')).toBe(defaultTheme);
      expect(getThemeByName('')).toBe(defaultTheme);
    });
  });

  describe('getThemeByCasa', () => {
    it('should_return_correct_theme_for_each_casa', () => {
      expect(getThemeByCasa('QUANTUM')).toBe(casaQuantumTheme);
      expect(getThemeByCasa('VERTEX')).toBe(casaVertexTheme);
      expect(getThemeByCasa('PULSAR')).toBe(casaPulsarTheme);
    });
  });

  describe('listThemeNames', () => {
    it('should_return_all_theme_names', () => {
      const names = listThemeNames();
      expect(names).toContain('default');
      expect(names).toContain('casa-quantum');
      expect(names).toContain('casa-vertex');
      expect(names).toContain('casa-pulsar');
    });

    it('should_return_4_names', () => {
      expect(listThemeNames().length).toBe(4);
    });
  });
});

describe('Theme Structure', () => {
  const themes = [defaultTheme, casaQuantumTheme, casaVertexTheme, casaPulsarTheme];

  themes.forEach((theme) => {
    describe(`${theme.name}`, () => {
      it('should_have_required_color_properties', () => {
        expect(theme.colors.primary).toBeDefined();
        expect(theme.colors.secondary).toBeDefined();
        expect(theme.colors.success).toBeDefined();
        expect(theme.colors.error).toBeDefined();
        expect(theme.colors.warning).toBeDefined();
        expect(theme.colors.surface).toBeDefined();
        expect(theme.colors.text).toBeDefined();
        expect(theme.colors.border).toBeDefined();
      });

      it('should_have_surface_levels_0_to_3', () => {
        expect(theme.colors.surface[0]).toBeDefined();
        expect(theme.colors.surface[1]).toBeDefined();
        expect(theme.colors.surface[2]).toBeDefined();
        expect(theme.colors.surface[3]).toBeDefined();
      });

      it('should_have_text_variants', () => {
        expect(theme.colors.text.primary).toBeDefined();
        expect(theme.colors.text.secondary).toBeDefined();
        expect(theme.colors.text.muted).toBeDefined();
      });

      it('should_have_gradient_properties', () => {
        expect(theme.gradients.primary).toBeDefined();
        expect(theme.gradients.success).toBeDefined();
        expect(theme.gradients.error).toBeDefined();
        expect(theme.gradients.warning).toBeDefined();
      });

      it('should_have_typography_properties', () => {
        expect(theme.typography.displayFont).toBeDefined();
        expect(theme.typography.bodyFont).toBeDefined();
        expect(typeof theme.typography.useTextShadow).toBe('boolean');
        expect(typeof theme.typography.useTextStroke).toBe('boolean');
      });

      it('should_have_border_properties', () => {
        expect(theme.borders.radius).toBeDefined();
        expect(typeof theme.borders.width).toBe('number');
      });

      it('should_have_shadow_properties', () => {
        expect(typeof theme.shadows.useBrawlStyle).toBe('boolean');
        expect(theme.shadows.sm).toBeDefined();
        expect(theme.shadows.md).toBeDefined();
        expect(theme.shadows.lg).toBeDefined();
      });

      it('should_have_animation_properties', () => {
        expect(typeof theme.animations.useFramerMotion).toBe('boolean');
        expect(['subtle', 'normal', 'playful']).toContain(theme.animations.intensity);
      });
    });
  });
});
