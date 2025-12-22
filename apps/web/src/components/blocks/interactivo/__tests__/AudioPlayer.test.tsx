import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import type { AudioPlayerConfig } from '../types';

// Mock HTMLMediaElement
beforeEach(() => {
  window.HTMLMediaElement.prototype.load = vi.fn();
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
  Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
    writable: true,
    value: 120, // 2 minutos
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
    writable: true,
    value: 0,
  });
});

const mockConfig: AudioPlayerConfig = {
  instruccion: 'Escucha el audio y responde',
  titulo: 'Pronunciación en Inglés',
  audioUrl: '/audio/lesson1.mp3',
  transcripcion: [
    { tiempo: 0, texto: 'Hello, welcome to the lesson.' },
    { tiempo: 5, texto: 'Today we will learn about greetings.' },
    { tiempo: 12, texto: 'Repeat after me: Good morning!' },
  ],
};

const defaultProps = {
  id: 'test-audio',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('AudioPlayer', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_title_when_provided', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByText(mockConfig.titulo!)).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('audio-player-test-audio')).toBeInTheDocument();
    });

    it('should_render_audio_element', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('audio-element')).toBeInTheDocument();
    });

    it('should_render_play_button', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
    });

    it('should_render_progress_bar', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('audio-progress')).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<AudioPlayer {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_audio_info_in_editor_mode', () => {
      render(<AudioPlayer {...defaultProps} modo="editor" />);
      expect(screen.getByText(/Audio:/)).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<AudioPlayer {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });
  });

  describe('Controles de reproduccion', () => {
    it('should_toggle_play_pause', () => {
      render(<AudioPlayer {...defaultProps} />);

      const playButton = screen.getByTestId('play-button');
      expect(playButton).toHaveAttribute('aria-label', 'Reproducir');

      fireEvent.click(playButton);

      expect(playButton).toHaveAttribute('aria-label', 'Pausar');
    });

    it('should_show_pause_icon_when_playing', () => {
      render(<AudioPlayer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('play-button'));

      expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
    });

    it('should_show_play_icon_when_paused', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });
  });

  describe('Barra de tiempo', () => {
    it('should_show_current_time', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('current-time')).toHaveTextContent('0:00');
    });

    it('should_show_duration', () => {
      render(<AudioPlayer {...defaultProps} />);
      // Mock duration is 120 seconds = 2:00
      expect(screen.getByTestId('duration')).toBeInTheDocument();
    });

    it('should_allow_seeking_via_progress_bar', () => {
      render(<AudioPlayer {...defaultProps} />);

      const progressBar = screen.getByTestId('audio-progress');
      fireEvent.click(progressBar, { clientX: 50 });

      // Just verify it doesn't crash
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Transcripcion', () => {
    it('should_show_transcription_when_provided', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('transcription-container')).toBeInTheDocument();
    });

    it('should_render_all_transcription_lines', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByText('Hello, welcome to the lesson.')).toBeInTheDocument();
      expect(screen.getByText('Today we will learn about greetings.')).toBeInTheDocument();
      expect(screen.getByText('Repeat after me: Good morning!')).toBeInTheDocument();
    });

    it('should_not_show_transcription_when_not_provided', () => {
      const configNoTranscription: AudioPlayerConfig = {
        instruccion: 'Escucha el audio',
        audioUrl: '/audio/test.mp3',
      };
      render(<AudioPlayer {...defaultProps} config={configNoTranscription} />);
      expect(screen.queryByTestId('transcription-container')).not.toBeInTheDocument();
    });

    it('should_show_timestamps_in_transcription', () => {
      render(<AudioPlayer {...defaultProps} />);
      // 0:00 aparece tanto en current-time como en transcripción, usamos getAllByText
      expect(screen.getAllByText('0:00').length).toBeGreaterThan(0);
      expect(screen.getByText('0:05')).toBeInTheDocument();
      expect(screen.getByText('0:12')).toBeInTheDocument();
    });
  });

  describe('Control de volumen', () => {
    it('should_have_volume_control', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('volume-control')).toBeInTheDocument();
    });

    it('should_have_mute_button', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.getByTestId('mute-button')).toBeInTheDocument();
    });

    it('should_toggle_mute_on_click', () => {
      render(<AudioPlayer {...defaultProps} />);

      const muteButton = screen.getByTestId('mute-button');
      fireEvent.click(muteButton);

      expect(screen.getByTestId('muted-icon')).toBeInTheDocument();
    });
  });

  describe('Velocidad de reproduccion', () => {
    it('should_show_speed_control_when_configured', () => {
      const configWithSpeed: AudioPlayerConfig = {
        ...mockConfig,
        mostrarVelocidad: true,
      };
      render(<AudioPlayer {...defaultProps} config={configWithSpeed} />);
      expect(screen.getByTestId('speed-control')).toBeInTheDocument();
    });

    it('should_not_show_speed_control_by_default', () => {
      render(<AudioPlayer {...defaultProps} />);
      expect(screen.queryByTestId('speed-control')).not.toBeInTheDocument();
    });
  });

  describe('Loop', () => {
    it('should_have_loop_button_when_configured', () => {
      const configWithLoop: AudioPlayerConfig = {
        ...mockConfig,
        permitirLoop: true,
      };
      render(<AudioPlayer {...defaultProps} config={configWithLoop} />);
      expect(screen.getByTestId('loop-button')).toBeInTheDocument();
    });

    it('should_toggle_loop_on_click', () => {
      const configWithLoop: AudioPlayerConfig = {
        ...mockConfig,
        permitirLoop: true,
      };
      render(<AudioPlayer {...defaultProps} config={configWithLoop} />);

      const loopButton = screen.getByTestId('loop-button');
      fireEvent.click(loopButton);

      expect(loopButton).toHaveClass('active');
    });
  });

  describe('Descripcion', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: AudioPlayerConfig = {
        ...mockConfig,
        descripcion: 'Practica tu pronunciación escuchando atentamente',
      };
      render(<AudioPlayer {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onProgress_when_playing', () => {
      const onProgress = vi.fn();
      render(<AudioPlayer {...defaultProps} onProgress={onProgress} />);

      fireEvent.click(screen.getByTestId('play-button'));

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('Estado deshabilitado', () => {
    it('should_disable_controls_when_disabled', () => {
      render(<AudioPlayer {...defaultProps} disabled />);

      const playButton = screen.getByTestId('play-button');
      expect(playButton).toBeDisabled();
    });
  });
});
