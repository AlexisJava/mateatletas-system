import { Injectable, Logger } from '@nestjs/common';

/**
 * Servicio de IP Whitelisting para Webhooks de MercadoPago
 *
 * PROPÓSITO:
 * Validar que los webhooks provengan únicamente de IPs oficiales de MercadoPago,
 * bloqueando intentos de spoofing desde IPs no autorizadas.
 *
 * PROBLEMA QUE RESUELVE:
 * Aunque validamos la firma HMAC del webhook, un atacante podría:
 * 1. Interceptar un webhook legítimo
 * 2. Reenviar el mismo webhook múltiples veces (replay attack)
 * 3. Intentar enviar webhooks falsos desde su propia IP
 *
 * SOLUCIÓN:
 * - Solo aceptar webhooks desde rangos de IP oficiales de MercadoPago
 * - Loguear y bloquear intentos desde IPs no autorizadas
 * - Emitir alertas de seguridad para análisis
 *
 * IPs OFICIALES DE MERCADOPAGO (actualizado 2025):
 * Fuente: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 *
 * Rangos IPv4:
 * - 209.225.49.0/24 (209.225.49.0 - 209.225.49.255)
 * - 216.33.197.0/24 (216.33.197.0 - 216.33.197.255)
 * - 216.33.196.0/24 (216.33.196.0 - 216.33.196.255)
 *
 * MANTENIMIENTO:
 * - Verificar rangos cada 6 meses en docs oficiales
 * - Agregar variable de entorno MERCADOPAGO_ALLOWED_IPS para override en emergencias
 *
 * @injectable
 */
@Injectable()
export class MercadoPagoIpWhitelistService {
  private readonly logger = new Logger(MercadoPagoIpWhitelistService.name);

  /**
   * Rangos de IP oficiales de MercadoPago (CIDR notation)
   * Fuente oficial: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
   *
   * Última actualización: Enero 2025
   */
  private readonly officialIpRanges: string[] = [
    '209.225.49.0/24', // MercadoPago primary range
    '216.33.197.0/24', // MercadoPago secondary range
    '216.33.196.0/24', // MercadoPago tertiary range
  ];

  /**
   * IPs específicas adicionales (para desarrollo y testing)
   */
  private readonly additionalAllowedIps: string[] = [
    '127.0.0.1', // Localhost (solo desarrollo)
    '::1', // Localhost IPv6 (solo desarrollo)
  ];

  constructor() {
    this.logger.log(
      `✅ IP Whitelist inicializado con ${this.officialIpRanges.length} rangos oficiales de MercadoPago`,
    );
  }

  /**
   * Valida si una IP está autorizada para enviar webhooks
   *
   * @param ip - Dirección IP a validar (IPv4 o IPv6)
   * @param isDevelopment - Si está en modo desarrollo (permite localhost)
   * @returns true si la IP está en whitelist, false caso contrario
   */
  isIpAllowed(ip: string, isDevelopment = false): boolean {
    if (!ip || ip.length === 0) {
      this.logger.warn('⚠️ IP vacía o undefined en validación');
      return false;
    }

    // En desarrollo, permitir localhost
    if (isDevelopment && this.additionalAllowedIps.includes(ip)) {
      this.logger.debug(`✅ IP localhost permitida en desarrollo: ${ip}`);
      return true;
    }

    // Validar contra rangos oficiales de MercadoPago
    for (const range of this.officialIpRanges) {
      if (this.isIpInRange(ip, range)) {
        this.logger.log(`✅ IP autorizada (MercadoPago): ${ip} (rango: ${range})`);
        return true;
      }
    }

    // IP no autorizada
    this.logger.warn(
      `🚨 IP NO AUTORIZADA intentando enviar webhook: ${ip}`,
    );
    return false;
  }

  /**
   * Verifica si una IP está dentro de un rango CIDR
   *
   * @param ip - IP a verificar (formato: "192.168.1.1")
   * @param cidr - Rango CIDR (formato: "192.168.1.0/24")
   * @returns true si la IP está en el rango
   */
  private isIpInRange(ip: string, cidr: string): boolean {
    try {
      const [range, bits] = cidr.split('/');
      const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);

      const ipNum = this.ipToNumber(ip);
      const rangeNum = this.ipToNumber(range);

      return (ipNum & mask) === (rangeNum & mask);
    } catch (error) {
      this.logger.error(
        `Error verificando IP ${ip} en rango ${cidr}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
      return false;
    }
  }

  /**
   * Convierte una IP string a número para cálculos de rangos
   *
   * @param ip - IP en formato string (ej: "192.168.1.1")
   * @returns Número representando la IP
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => {
      return (acc << 8) + parseInt(octet, 10);
    }, 0) >>> 0;
  }

  /**
   * Extrae la IP real del request considerando proxies (X-Forwarded-For, X-Real-IP)
   *
   * IMPORTANTE: En producción detrás de un proxy/load balancer,
   * la IP real viene en headers como X-Forwarded-For
   *
   * @param headers - Headers del request
   * @param socketIp - IP del socket (fallback)
   * @returns IP real del cliente
   */
  extractRealIp(
    headers: Record<string, string | string[] | undefined>,
    socketIp?: string,
  ): string {
    // 1. Intentar X-Forwarded-For (proxy chain)
    const xForwardedFor = headers['x-forwarded-for'];
    if (xForwardedFor) {
      // X-Forwarded-For puede ser una lista: "client, proxy1, proxy2"
      const ips = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor;
      const firstIp = ips.split(',')[0].trim();
      if (firstIp) {
        this.logger.debug(
          `IP extraída de X-Forwarded-For: ${firstIp}`,
        );
        return firstIp;
      }
    }

    // 2. Intentar X-Real-IP (algunos proxies)
    const xRealIp = headers['x-real-ip'];
    if (xRealIp && typeof xRealIp === 'string') {
      this.logger.debug(`IP extraída de X-Real-IP: ${xRealIp}`);
      return xRealIp;
    }

    // 3. Fallback a IP del socket
    if (socketIp) {
      this.logger.debug(`IP extraída del socket: ${socketIp}`);
      return socketIp;
    }

    // 4. Default a localhost (no debería llegar aquí)
    this.logger.warn('⚠️ No se pudo extraer IP real, usando localhost');
    return '127.0.0.1';
  }

  /**
   * Retorna los rangos de IP oficiales (para debugging/admin)
   */
  getOfficialRanges(): string[] {
    return [...this.officialIpRanges];
  }

  /**
   * Retorna estadísticas de validación (para monitoreo)
   */
  getValidationStats(): {
    officialRangesCount: number;
    additionalIpsCount: number;
  } {
    return {
      officialRangesCount: this.officialIpRanges.length,
      additionalIpsCount: this.additionalAllowedIps.length,
    };
  }
}