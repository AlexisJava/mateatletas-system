import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { StudioThemeProvider, useStudioTheme, useStudioThemeSafe } from '../StudioThemeContext';
import { defaultTheme } from '../themes/default';
import { casaQuantumTheme } from '../themes/casa-quantum';
import { casaVertexTheme } from '../themes/casa-vertex';
import { casaPulsarTheme } from '../themes/casa-pulsar';

describe('StudioThemeContext', () => {
  describe('StudioThemeProvider', () => {
    it('should_provide_default_theme_when_no_props', () => {
      const TestComponent = () => {
        const { theme } = useStudioTheme();
        return <div data-testid="theme-name">{theme.name}</div>;
      };

      render(
        <StudioThemeProvider>
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('default');
    });

    it('should_use_initialTheme_when_provided', () => {
      const TestComponent = () => {
        const { theme } = useStudioTheme();
        return <div data-testid="theme-name">{theme.name}</div>;
      };

      render(
        <StudioThemeProvider initialTheme={casaQuantumTheme}>
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('casa-quantum');
    });

    it('should_resolve_theme_by_name', () => {
      const TestComponent = () => {
        const { theme } = useStudioTheme();
        return <div data-testid="theme-name">{theme.name}</div>;
      };

      render(
        <StudioThemeProvider themeName="casa-vertex">
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('casa-vertex');
    });

    it('should_use_default_theme_for_unknown_name', () => {
      const TestComponent = () => {
        const { theme } = useStudioTheme();
        return <div data-testid="theme-name">{theme.name}</div>;
      };

      render(
        <StudioThemeProvider themeName="non-existent-theme">
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('default');
    });

    it('should_provide_initial_modo', () => {
      const TestComponent = () => {
        const { modo } = useStudioTheme();
        return <div data-testid="modo">{modo}</div>;
      };

      render(
        <StudioThemeProvider initialModo="estudiante">
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('modo')).toHaveTextContent('estudiante');
    });

    it('should_default_to_preview_modo', () => {
      const TestComponent = () => {
        const { modo } = useStudioTheme();
        return <div data-testid="modo">{modo}</div>;
      };

      render(
        <StudioThemeProvider>
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('modo')).toHaveTextContent('preview');
    });
  });

  describe('useStudioTheme', () => {
    it('should_throw_error_outside_provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useStudioTheme();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useStudioTheme debe usarse dentro de un StudioThemeProvider',
      );

      consoleError.mockRestore();
    });

    it('should_allow_changing_theme', () => {
      const TestComponent = () => {
        const { theme, setTheme } = useStudioTheme();
        return (
          <div>
            <span data-testid="theme-name">{theme.name}</span>
            <button onClick={() => setTheme(casaPulsarTheme)}>Change Theme</button>
          </div>
        );
      };

      render(
        <StudioThemeProvider initialTheme={defaultTheme}>
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('default');

      fireEvent.click(screen.getByText('Change Theme'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('casa-pulsar');
    });

    it('should_allow_changing_theme_by_name', () => {
      const TestComponent = () => {
        const { theme, setThemeByName } = useStudioTheme();
        return (
          <div>
            <span data-testid="theme-name">{theme.name}</span>
            <button onClick={() => setThemeByName('casa-quantum')}>Change Theme</button>
          </div>
        );
      };

      render(
        <StudioThemeProvider>
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('default');

      fireEvent.click(screen.getByText('Change Theme'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('casa-quantum');
    });

    it('should_allow_changing_modo', () => {
      const TestComponent = () => {
        const { modo, setModo } = useStudioTheme();
        return (
          <div>
            <span data-testid="modo">{modo}</span>
            <button onClick={() => setModo('editor')}>Change Modo</button>
          </div>
        );
      };

      render(
        <StudioThemeProvider initialModo="preview">
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('modo')).toHaveTextContent('preview');

      fireEvent.click(screen.getByText('Change Modo'));

      expect(screen.getByTestId('modo')).toHaveTextContent('editor');
    });

    it('should_provide_pre_computed_classes', () => {
      const TestComponent = () => {
        const { classes } = useStudioTheme();
        return (
          <div>
            <span data-testid="has-classes">{classes.buttonPrimary ? 'yes' : 'no'}</span>
          </div>
        );
      };

      render(
        <StudioThemeProvider>
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('has-classes')).toHaveTextContent('yes');
    });
  });

  describe('useStudioThemeSafe', () => {
    it('should_return_undefined_outside_provider', () => {
      const TestComponent = () => {
        const context = useStudioThemeSafe();
        return <div data-testid="result">{context ? 'has-context' : 'no-context'}</div>;
      };

      render(<TestComponent />);

      expect(screen.getByTestId('result')).toHaveTextContent('no-context');
    });

    it('should_return_context_inside_provider', () => {
      const TestComponent = () => {
        const context = useStudioThemeSafe();
        return <div data-testid="result">{context ? 'has-context' : 'no-context'}</div>;
      };

      render(
        <StudioThemeProvider>
          <TestComponent />
        </StudioThemeProvider>,
      );

      expect(screen.getByTestId('result')).toHaveTextContent('has-context');
    });
  });

  describe('theme properties', () => {
    it('should_have_correct_casa_for_quantum', () => {
      expect(casaQuantumTheme.casa).toBe('QUANTUM');
    });

    it('should_have_correct_casa_for_vertex', () => {
      expect(casaVertexTheme.casa).toBe('VERTEX');
    });

    it('should_have_correct_casa_for_pulsar', () => {
      expect(casaPulsarTheme.casa).toBe('PULSAR');
    });

    it('should_not_have_casa_for_default', () => {
      expect(defaultTheme.casa).toBeUndefined();
    });

    it('should_have_playful_animations_for_quantum', () => {
      expect(casaQuantumTheme.animations.intensity).toBe('playful');
    });

    it('should_have_normal_animations_for_vertex', () => {
      expect(casaVertexTheme.animations.intensity).toBe('normal');
    });

    it('should_have_subtle_animations_for_pulsar', () => {
      expect(casaPulsarTheme.animations.intensity).toBe('subtle');
    });

    it('should_use_text_effects_for_quantum', () => {
      expect(casaQuantumTheme.typography.useTextShadow).toBe(true);
      expect(casaQuantumTheme.typography.useTextStroke).toBe(true);
    });

    it('should_not_use_text_effects_for_pulsar', () => {
      expect(casaPulsarTheme.typography.useTextShadow).toBe(false);
      expect(casaPulsarTheme.typography.useTextStroke).toBe(false);
    });
  });
});
