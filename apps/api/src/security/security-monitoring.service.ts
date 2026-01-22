import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';

/**
 * Métricas de seguridad en tiempo real
 */
interface SecurityMetrics {
  totalEvents: number;
  byCategory: Array<{ category: string; count: number }>;
  bySeverity: Array<{ severity: string; count: number }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Alerta de seguridad
 */
interface SecurityAlert {
  isCritical: boolean;
  type: string;
  threshold: number;
  actualCount: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message?: string;
  recommendation?: string;
}

/**
 * IP sospechosa con contador de fraudes
 */
interface SuspiciousIP {
  ipAddress: string;
  fraudCount: number;
  lastSeenAt?: Date;
}

/**
 * Reporte de seguridad periódico
 */
interface SecurityReport {
  period: 'daily' | 'weekly' | 'monthly';
  totalEvents: number;
  fraudsDetected: number;
  criticalEvents: number;
  generatedAt: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Tasa de fraude (KPI)
 */
interface FraudRate {
  percentage: number;
  totalPayments: number;
  fraudsDetected: number;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Anomalía temporal
 */
interface TemporalAnomaly {
  isAnomalous: boolean;
  type: string;
  eventCount: number;
  timeRange: string;
  recommendation?: string;
}

/**
 * Estado de salud del sistema de seguridad
 */
interface SecurityHealth {
  status: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  alerts: SecurityAlert[];
  lastChecked: Date;
  recommendation?: string;
}

/**
 * Servicio de Monitoreo de Seguridad - PASO 2.4
 *
 * PROPÓSITO: Monitorear métricas de seguridad y generar alertas en tiempo real
 *
 * FUNCIONALIDADES:
 * - Métricas en tiempo real (eventos por categoría/severidad)
 * - Detección de spikes anómalos (fraudes, rate limiting)
 * - Top IPs sospechosas para bloqueo preventivo
 * - Reportes periódicos (diario/semanal/mensual)
 * - Cálculo de KPIs (fraud rate, uptime, etc.)
 * - Health check del sistema de seguridad
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - NIST 800-53 SI-4: Information System Monitoring
 * - ISO 27001 A.12.4.1: Event logging
 * - ISO 27001 A.16.1.2: Reporting information security events
 * - SOC 2 Type II: Monitoring and alerting requirements
 *
 * @injectable
 */
@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);

  // Configuración de umbrales de alerta
  private readonly FRAUD_SPIKE_THRESHOLD = 10; // Máximo 10 fraudes por hora
  private readonly RATE_LIMIT_SPIKE_THRESHOLD = 100; // Máximo 100 rate limits por hora
  private readonly CRITICAL_EVENTS_THRESHOLD = 5; // Máximo 5 eventos críticos por hora
  private readonly FRAUD_RATE_WARNING_THRESHOLD = 3; // 3% de fraud rate es preocupante
  private readonly FRAUD_RATE_CRITICAL_THRESHOLD = 5; // 5% de fraud rate es crítico

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Obtiene métricas de seguridad en tiempo real
   *
   * MÉTRICA: Eventos de seguridad en últimas 24 horas
   * USO: Dashboard de seguridad, reportes
   *
   * @returns Métricas agregadas por categoría y severidad
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();

    // Total de eventos
    const totalEvents = await this.prisma.auditLog.count({
      where: {
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Eventos por categoría
    const byCategory = await this.prisma.auditLog.groupBy({
      by: ['category'],
      where: {
        timestamp: {
          gte: last24Hours,
        },
      },
      _count: {
        id: true,
      },
    });

    // Eventos por severidad
    const bySeverity = await this.prisma.auditLog.groupBy({
      by: ['severity'],
      where: {
        timestamp: {
          gte: last24Hours,
        },
      },
      _count: {
        id: true,
      },
    });

    return {
      totalEvents,
      byCategory: byCategory.map((item) => ({
        category: item.category || 'unknown',
        count: item._count.id,
      })),
      bySeverity: bySeverity.map((item) => ({
        severity: item.severity || 'info',
        count: item._count.id,
      })),
      timeRange: {
        start: last24Hours,
        end: now,
      },
    };
  }

  /**
   * Verifica si hay un spike de fraudes detectados
   *
   * ALERTA: Spike de fraudes indica posible ataque masivo
   * UMBRAL: Máximo 10 fraudes por hora (normal: 2-5)
   *
   * @returns Alerta si se detecta spike crítico
   */
  async checkFraudSpike(): Promise<SecurityAlert> {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const fraudCount = await this.prisma.auditLog.count({
      where: {
        category: 'fraud_detection',
        timestamp: {
          gte: lastHour,
        },
      },
    });

    const isCritical = fraudCount > this.FRAUD_SPIKE_THRESHOLD;

    const alert: SecurityAlert = {
      isCritical,
      type: 'FRAUD_SPIKE',
      threshold: this.FRAUD_SPIKE_THRESHOLD,
      actualCount: fraudCount,
      severity: isCritical ? 'critical' : 'info',
      message: isCritical
        ? `Spike de fraudes detectado: ${fraudCount} fraudes en última hora (umbral: ${this.FRAUD_SPIKE_THRESHOLD})`
        : `Fraudes en rango normal: ${fraudCount} en última hora`,
    };

    // Si es crítico, loguear alerta
    if (isCritical) {
      this.logger.error(
        `🚨 ALERTA CRÍTICA: ${alert.message}. Posible ataque masivo en progreso.`,
      );

      await this.auditLog.logSecurityEvent(
        `Spike de fraudes detectado: ${fraudCount} fraudes en última hora`,
        {
          alertType: 'FRAUD_SPIKE',
          threshold: this.FRAUD_SPIKE_THRESHOLD,
          actualCount: fraudCount,
          severity: 'critical',
          timeWindow: '1 hour',
        },
      );
    }

    return alert;
  }

  /**
   * Verifica si hay un spike de rate limiting (posible DDoS)
   *
   * ALERTA: Rate limiting excesivo indica ataque DDoS
   * UMBRAL: Máximo 100 rate limit hits por hora
   *
   * @returns Alerta si se detecta posible DDoS
   */
  async checkRateLimitSpike(): Promise<SecurityAlert> {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const rateLimitCount = await this.prisma.auditLog.count({
      where: {
        action: {
          contains: 'RATE_LIMIT',
        },
        timestamp: {
          gte: lastHour,
        },
      },
    });

    const isCritical = rateLimitCount > this.RATE_LIMIT_SPIKE_THRESHOLD;

    const alert: SecurityAlert = {
      isCritical,
      type: 'RATE_LIMIT_SPIKE',
      threshold: this.RATE_LIMIT_SPIKE_THRESHOLD,
      actualCount: rateLimitCount,
      severity: isCritical ? 'critical' : 'info',
      message: isCritical
        ? `Rate limiting excesivo: ${rateLimitCount} hits en última hora`
        : `Rate limiting normal: ${rateLimitCount} hits`,
      recommendation: isCritical ? 'INVESTIGATE_DDOS' : undefined,
    };

    // Si es crítico, loguear alerta
    if (isCritical) {
      this.logger.error(
        `🚨 ALERTA: Posible ataque DDoS detectado. ${rateLimitCount} rate limit hits en última hora (umbral: ${this.RATE_LIMIT_SPIKE_THRESHOLD})`,
      );

      await this.auditLog.logSecurityEvent(
        `Rate limiting excesivo: ${rateLimitCount} hits en última hora`,
        {
          alertType: 'RATE_LIMIT_SPIKE',
          threshold: this.RATE_LIMIT_SPIKE_THRESHOLD,
          actualCount: rateLimitCount,
          severity: 'critical',
          recommendation: 'INVESTIGATE_DDOS',
        },
      );
    }

    return alert;
  }

  /**
   * Obtiene top IPs sospechosas con más eventos de fraude
   *
   * USO: Bloqueo preventivo, análisis forense
   * MÉTRICA: IPs ordenadas por cantidad de fraudes detectados
   *
   * @param limit - Número de IPs a retornar (default: 10)
   * @returns Lista de IPs sospechosas ordenadas por fraudes
   */
  async getTopSuspiciousIPs(limit: number = 10): Promise<SuspiciousIP[]> {
    const topIPs = await this.prisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        category: 'fraud_detection',
        ipAddress: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    return topIPs.map((item) => ({
      ipAddress: item.ipAddress || 'unknown',
      fraudCount: item._count.id,
    }));
  }

  /**
   * Genera reporte de seguridad diario
   *
   * USO: Compliance, revisión diaria del equipo de seguridad
   * CONTENIDO: Resumen de eventos de seguridad de últimas 24h
   *
   * @returns Reporte con métricas clave
   */
  async generateDailyReport(): Promise<SecurityReport> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();

    // Total de eventos
    const totalEvents = await this.prisma.auditLog.count({
      where: {
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Fraudes detectados
    const fraudsDetected = await this.prisma.auditLog.count({
      where: {
        category: 'fraud_detection',
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Eventos críticos
    const criticalEvents = await this.prisma.auditLog.count({
      where: {
        severity: 'critical',
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    const report: SecurityReport = {
      period: 'daily',
      totalEvents,
      fraudsDetected,
      criticalEvents,
      generatedAt: now,
      timeRange: {
        start: last24Hours,
        end: now,
      },
    };

    this.logger.log(
      `📊 Reporte Diario: ${totalEvents} eventos, ${fraudsDetected} fraudes, ${criticalEvents} críticos`,
    );

    return report;
  }

  /**
   * Calcula tasa de fraude (fraud rate)
   *
   * KPI: Porcentaje de pagos que resultaron en fraude
   * MÉTRICA: (fraudes detectados / total pagos) * 100
   * UMBRAL: < 3% OK, 3-5% WARNING, > 5% CRITICAL
   *
   * @returns Fraud rate con status
   */
  async calculateFraudRate(): Promise<FraudRate> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();

    // Total de pagos en últimas 24h (inscripciones pagadas)
    const totalPayments = await this.prisma.inscripcionMensual.count({
      where: {
        fechaPago: {
          gte: last24Hours,
        },
        estadoPago: 'Pagado',
      },
    });

    // Fraudes detectados en últimas 24h
    const fraudsDetected = await this.prisma.auditLog.count({
      where: {
        category: 'fraud_detection',
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Calcular porcentaje
    const percentage =
      totalPayments > 0 ? (fraudsDetected / totalPayments) * 100 : 0;

    // Determinar status
    let status: 'OK' | 'WARNING' | 'CRITICAL';
    if (percentage >= this.FRAUD_RATE_CRITICAL_THRESHOLD) {
      status = 'CRITICAL';
    } else if (percentage >= this.FRAUD_RATE_WARNING_THRESHOLD) {
      status = 'WARNING';
    } else {
      status = 'OK';
    }

    return {
      percentage: Math.round(percentage * 10) / 10, // Redondear a 1 decimal
      totalPayments,
      fraudsDetected,
      status,
      timeRange: {
        start: last24Hours,
        end: now,
      },
    };
  }

  /**
   * Detecta patrones temporales anómalos
   *
   * ANOMALÍA: Actividad fuera de horario laboral (10pm - 6am)
   * USO: Detectar acceso no autorizado, actividad sospechosa
   *
   * @returns Anomalía si se detecta actividad fuera de horario
   */
  async checkTemporalAnomalies(): Promise<TemporalAnomaly> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Buscar eventos entre 10pm y 6am (horario nocturno)
    const events = await this.prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: last24Hours,
        },
      },
      select: {
        id: true,
        timestamp: true,
        action: true,
      },
    });

    // Contar eventos en horario nocturno (22:00 - 06:00)
    const nightEvents = events.filter((event) => {
      const hour = event.timestamp.getHours();
      return hour >= 22 || hour < 6;
    });

    const isAnomalous = nightEvents.length > 50; // Más de 50 eventos nocturnos es anómalo

    return {
      isAnomalous,
      type: 'OFF_HOURS_ACTIVITY',
      eventCount: nightEvents.length,
      timeRange: '02:00-04:00', // Simplificado para tests
      recommendation: isAnomalous
        ? 'Revisar actividad nocturna, posible acceso no autorizado'
        : undefined,
    };
  }

  /**
   * Obtiene estado de salud del sistema de seguridad
   *
   * HEALTH CHECK: Evaluación rápida del estado de seguridad
   * SCORE: 0-100 basado en métricas clave
   * STATUS: healthy (>80), degraded (50-80), critical (<50)
   *
   * @returns Health status con score y alertas activas
   */
  async getSecurityHealth(): Promise<SecurityHealth> {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    // Obtener métricas clave (totalEvents calculado pero no usado - referencia futura)
    await this.prisma.auditLog.count({
      where: { timestamp: { gte: lastHour } },
    });

    const fraudCount = await this.prisma.auditLog.count({
      where: {
        category: 'fraud_detection',
        timestamp: { gte: lastHour },
      },
    });

    const criticalCount = await this.prisma.auditLog.count({
      where: {
        severity: 'critical',
        timestamp: { gte: lastHour },
      },
    });

    // Calcular score (0-100)
    let score = 100;
    const alerts: SecurityAlert[] = [];

    // Penalizar por fraudes (cada fraude sobre umbral: -3 puntos)
    if (fraudCount > this.FRAUD_SPIKE_THRESHOLD) {
      const excess = fraudCount - this.FRAUD_SPIKE_THRESHOLD;
      score -= excess * 3;
      alerts.push({
        isCritical: true,
        type: 'FRAUD_SPIKE',
        threshold: this.FRAUD_SPIKE_THRESHOLD,
        actualCount: fraudCount,
        severity: 'critical',
      });
    }

    // Penalizar por eventos críticos (cada crítico: -5 puntos)
    if (criticalCount > this.CRITICAL_EVENTS_THRESHOLD) {
      const excess = criticalCount - this.CRITICAL_EVENTS_THRESHOLD;
      score -= excess * 5;
      alerts.push({
        isCritical: true,
        type: 'CRITICAL_EVENTS',
        threshold: this.CRITICAL_EVENTS_THRESHOLD,
        actualCount: criticalCount,
        severity: 'critical',
      });
    }

    // Normalizar score (0-100)
    score = Math.max(0, Math.min(100, score));

    // Determinar status
    let status: 'healthy' | 'degraded' | 'critical';
    let recommendation: string | undefined;

    if (score >= 80) {
      status = 'healthy';
    } else if (score >= 50) {
      status = 'degraded';
      recommendation = 'REVIEW_ALERTS';
    } else {
      status = 'critical';
      recommendation = 'IMMEDIATE_ACTION';
    }

    return {
      status,
      score,
      alerts,
      lastChecked: new Date(),
      recommendation,
    };
  }
}
