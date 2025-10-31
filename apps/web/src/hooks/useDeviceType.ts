/**
 * 📱 Hook para detectar tipo de dispositivo y orientación
 *
 * Retorna información sobre el dispositivo actual y su orientación
 * Útil para renderizado condicional de componentes responsivos
 */

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/lib/constants/responsive';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

export interface DeviceInfo {
  /** Tipo de dispositivo detectado */
  deviceType: DeviceType;

  /** Si está en orientación horizontal */
  isLandscape: boolean;

  /** Si está en orientación vertical */
  isPortrait: boolean;

  /** Ancho actual del viewport */
  width: number;

  /** Alto actual del viewport */
  height: number;

  /** Nombre legible del breakpoint actual */
  breakpointName: string;
}

export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceType: 'mobile',
    isLandscape: true,
    isPortrait: false,
    width: 0,
    height: 0,
    breakpointName: 'Mobile Landscape',
  });

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isPortrait = height > width;

      // Detectar tipo de dispositivo basado en ancho
      let deviceType: DeviceType = 'mobile';
      let breakpointName = 'Mobile Landscape';

      if (width < BREAKPOINTS.md.min) {
        deviceType = 'mobile';
        breakpointName = BREAKPOINTS.xs.name;
      } else if (width >= BREAKPOINTS.md.min && width < BREAKPOINTS.lg.min) {
        deviceType = 'tablet';
        breakpointName = BREAKPOINTS.md.name;
      } else if (width >= BREAKPOINTS.lg.min && width < BREAKPOINTS.xl.min) {
        deviceType = 'desktop';
        breakpointName = BREAKPOINTS.lg.name;
      } else {
        deviceType = 'ultrawide';
        breakpointName = BREAKPOINTS.xl.name;
      }

      setDeviceInfo({
        deviceType,
        isLandscape,
        isPortrait,
        width,
        height,
        breakpointName,
      });
    };

    // Detección inicial
    detectDevice();

    // Escuchar cambios de tamaño y orientación
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook simplificado que solo retorna el tipo de dispositivo
 */
export function useDevice(): DeviceType {
  const { deviceType } = useDeviceType();
  return deviceType;
}

/**
 * Hook que retorna si el dispositivo es móvil (mobile o tablet)
 */
export function useIsMobile(): boolean {
  const { deviceType } = useDeviceType();
  return deviceType === 'mobile' || deviceType === 'tablet';
}

/**
 * Hook que retorna si está en orientación landscape
 */
export function useIsLandscape(): boolean {
  const { isLandscape } = useDeviceType();
  return isLandscape;
}

/**
 * Ejemplo de uso:
 *
 * function MyComponent() {
 *   const { deviceType, isLandscape, width } = useDeviceType();
 *
 *   if (deviceType === 'mobile') {
 *     return <MobileLayout />;
 *   }
 *
 *   if (deviceType === 'tablet') {
 *     return <TabletLayout />;
 *   }
 *
 *   return <DesktopLayout />;
 * }
 */
