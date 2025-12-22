import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageGallery } from '../ImageGallery';
import type { ImageGalleryConfig } from '../types';

const mockConfig: ImageGalleryConfig = {
  instruccion: 'Explora las imágenes de la célula',
  titulo: 'Galería de Células',
  imagenes: [
    {
      id: 'img1',
      url: '/images/celula1.jpg',
      alt: 'Célula animal',
      titulo: 'Célula Animal',
      descripcion: 'Vista microscópica de una célula animal',
    },
    {
      id: 'img2',
      url: '/images/celula2.jpg',
      alt: 'Célula vegetal',
      titulo: 'Célula Vegetal',
      descripcion: 'Vista microscópica de una célula vegetal',
    },
    {
      id: 'img3',
      url: '/images/celula3.jpg',
      alt: 'Célula bacteriana',
      titulo: 'Célula Bacteriana',
    },
  ],
};

const defaultProps = {
  id: 'test-gallery',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('ImageGallery', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_title_when_provided', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByText(mockConfig.titulo!)).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByTestId('image-gallery-test-gallery')).toBeInTheDocument();
    });

    it('should_render_all_images', () => {
      render(<ImageGallery {...defaultProps} />);
      // Main image + thumbnails, verificamos que existen
      expect(screen.getAllByAltText('Célula animal').length).toBeGreaterThan(0);
      expect(screen.getAllByAltText('Célula vegetal').length).toBeGreaterThan(0);
      expect(screen.getAllByAltText('Célula bacteriana').length).toBeGreaterThan(0);
    });

    it('should_render_thumbnails', () => {
      render(<ImageGallery {...defaultProps} />);
      const thumbnails = screen.getAllByTestId(/^thumbnail-/);
      expect(thumbnails).toHaveLength(3);
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<ImageGallery {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_image_count_in_editor_mode', () => {
      render(<ImageGallery {...defaultProps} modo="editor" />);
      expect(screen.getByText(/3 imágenes/)).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<ImageGallery {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });
  });

  describe('Navegacion', () => {
    it('should_show_first_image_by_default', () => {
      render(<ImageGallery {...defaultProps} />);
      const mainImage = screen.getByTestId('main-image');
      expect(mainImage).toHaveAttribute('alt', 'Célula animal');
    });

    it('should_show_image_title', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByText('Célula Animal')).toBeInTheDocument();
    });

    it('should_show_image_description', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByText('Vista microscópica de una célula animal')).toBeInTheDocument();
    });

    it('should_change_image_when_thumbnail_clicked', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByTestId('thumbnail-img2'));

      const mainImage = screen.getByTestId('main-image');
      expect(mainImage).toHaveAttribute('alt', 'Célula vegetal');
      expect(screen.getByText('Célula Vegetal')).toBeInTheDocument();
    });

    it('should_have_navigation_buttons', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    });

    it('should_go_to_next_image', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

      const mainImage = screen.getByTestId('main-image');
      expect(mainImage).toHaveAttribute('alt', 'Célula vegetal');
    });

    it('should_go_to_previous_image', () => {
      render(<ImageGallery {...defaultProps} />);

      // Ir a segunda imagen
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      // Volver
      fireEvent.click(screen.getByRole('button', { name: /anterior/i }));

      const mainImage = screen.getByTestId('main-image');
      expect(mainImage).toHaveAttribute('alt', 'Célula animal');
    });

    it('should_show_image_counter', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should_update_counter_on_navigation', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
  });

  describe('Zoom', () => {
    it('should_have_zoom_button', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByTestId('zoom-button')).toBeInTheDocument();
    });

    it('should_open_modal_on_zoom', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByTestId('zoom-button'));

      expect(screen.getByTestId('zoom-modal')).toBeInTheDocument();
    });

    it('should_show_zoomed_image_in_modal', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByTestId('zoom-button'));

      expect(screen.getByTestId('zoomed-image')).toHaveAttribute('alt', 'Célula animal');
    });

    it('should_close_modal_on_close_button', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByTestId('zoom-button'));
      fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));

      expect(screen.queryByTestId('zoom-modal')).not.toBeInTheDocument();
    });

    it('should_close_modal_on_backdrop_click', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByTestId('zoom-button'));
      fireEvent.click(screen.getByTestId('zoom-modal-backdrop'));

      expect(screen.queryByTestId('zoom-modal')).not.toBeInTheDocument();
    });

    it('should_open_modal_on_image_double_click', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.doubleClick(screen.getByTestId('main-image'));

      expect(screen.getByTestId('zoom-modal')).toBeInTheDocument();
    });
  });

  describe('Thumbnails activos', () => {
    it('should_highlight_active_thumbnail', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByTestId('thumbnail-img1')).toHaveClass('active');
    });

    it('should_update_active_thumbnail_on_navigation', () => {
      render(<ImageGallery {...defaultProps} />);

      fireEvent.click(screen.getByTestId('thumbnail-img2'));

      expect(screen.getByTestId('thumbnail-img1')).not.toHaveClass('active');
      expect(screen.getByTestId('thumbnail-img2')).toHaveClass('active');
    });
  });

  describe('Disposicion', () => {
    it('should_render_grid_layout_by_default', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.getByTestId('thumbnails-container')).toHaveClass('grid');
    });

    it('should_render_carousel_layout_when_configured', () => {
      const configCarousel: ImageGalleryConfig = {
        ...mockConfig,
        disposicion: 'carousel',
      };
      render(<ImageGallery {...defaultProps} config={configCarousel} />);
      expect(screen.getByTestId('thumbnails-container')).toHaveClass('carousel');
    });
  });

  describe('Descripcion general', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: ImageGalleryConfig = {
        ...mockConfig,
        descripcion: 'Haz clic en las imágenes para verlas en detalle',
      };
      render(<ImageGallery {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Autoplay', () => {
    it('should_have_autoplay_button_when_configured', () => {
      const configAutoplay: ImageGalleryConfig = {
        ...mockConfig,
        autoplay: true,
        intervaloAutoplay: 3000,
      };
      render(<ImageGallery {...defaultProps} config={configAutoplay} />);
      expect(screen.getByTestId('autoplay-button')).toBeInTheDocument();
    });

    it('should_not_show_autoplay_when_not_configured', () => {
      render(<ImageGallery {...defaultProps} />);
      expect(screen.queryByTestId('autoplay-button')).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onProgress_when_image_viewed', () => {
      const onProgress = vi.fn();
      render(<ImageGallery {...defaultProps} onProgress={onProgress} />);

      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('Sin descripcion de imagen', () => {
    it('should_not_show_description_when_image_has_none', () => {
      render(<ImageGallery {...defaultProps} />);

      // Ir a la tercera imagen que no tiene descripcion
      fireEvent.click(screen.getByTestId('thumbnail-img3'));

      expect(screen.queryByText('Vista microscópica')).not.toBeInTheDocument();
    });
  });
});
