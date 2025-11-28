import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IConfiguracionPreciosRepository } from '../../domain/repositories/configuracion-precios.repository.interface';
import {
  IEstudianteRepository,
  Estudiante,
} from '../../domain/repositories/estudiante.repository.interface';
import {
  IProductoRepository,
  Producto,
} from '../../domain/repositories/producto.repository.interface';
import {
  CalcularPrecioInputDTO,
  CalcularPrecioOutputDTO,
  CalculoIndividualDTO,
  ResumenCalculoDTO,
} from '../dtos/calcular-precio.dto';
import {
  calcularPrecioActividad,
  CalculoPrecioInput,
} from '../../domain/rules/precio.rules';
import {
  TipoDescuento,
  ConfiguracionPrecios,
} from '../../domain/types/pagos.types';

/**
 * Use Case: Calcular Precio de Actividades
 *
 * Responsabilidades (Application Layer):
 * 1. Orquestar la obtención de datos desde repositorios
 * 2. Validar permisos y datos de entrada
 * 3. Delegar cálculos de negocio al Domain Layer
 * 4. Transformar resultados a DTOs para presentación
 *
 * NO contiene lógica de negocio (eso está en precio.rules.ts)
 */
@Injectable()
export class CalcularPrecioUseCase {
  constructor(
    private readonly configuracionRepo: IConfiguracionPreciosRepository,
    private readonly estudianteRepo: IEstudianteRepository,
    private readonly productoRepo: IProductoRepository,
  ) {}

  async execute(
    input: CalcularPrecioInputDTO,
  ): Promise<CalcularPrecioOutputDTO> {
    // 1. Validaciones de entrada
    this.validarInput(input);

    // 2. Obtener configuración de precios
    const configuracion = await this.configuracionRepo.obtenerConfiguracion();
    if (!configuracion) {
      throw new Error('No se encontró la configuración de precios');
    }

    // 3. Obtener y validar estudiantes
    const estudiantes = await this.obtenerYValidarEstudiantes(input);

    // 4. Obtener y validar productos
    const productos = await this.obtenerYValidarProductos(input);

    // 5. Calcular precios individuales usando domain logic
    const calculos = this.calcularPreciosIndividuales(
      estudiantes,
      productos,
      input,
      configuracion,
    );

    // 6. Calcular resumen
    const resumen = this.calcularResumen(calculos, input);

    return {
      calculos,
      resumen,
    };
  }

  /**
   * Valida el input del use case
   */
  private validarInput(input: CalcularPrecioInputDTO): void {
    if (!input.estudiantesIds || input.estudiantesIds.length === 0) {
      throw new Error('Debe proporcionar al menos un estudiante');
    }

    if (
      !input.productosIdsPorEstudiante ||
      Object.keys(input.productosIdsPorEstudiante).length === 0
    ) {
      throw new Error('Debe proporcionar al menos un producto por estudiante');
    }

    // Validar que cada estudiante tenga al menos un producto
    for (const estudianteId of input.estudiantesIds) {
      const productos = input.productosIdsPorEstudiante[estudianteId];
      if (!productos || productos.length === 0) {
        throw new Error(
          `El estudiante ${estudianteId} no tiene productos asignados`,
        );
      }
    }
  }

  /**
   * Obtiene y valida los estudiantes
   */
  private async obtenerYValidarEstudiantes(
    input: CalcularPrecioInputDTO,
  ): Promise<Map<string, Estudiante>> {
    const estudiantesMap = new Map<string, Estudiante>();

    for (const estudianteId of input.estudiantesIds) {
      const estudiante = await this.estudianteRepo.obtenerPorId(estudianteId);

      if (!estudiante) {
        throw new Error(`Estudiante con ID ${estudianteId} no encontrado`);
      }

      // Validar que el estudiante pertenece al tutor
      if (estudiante.tutorId !== input.tutorId) {
        throw new Error(
          `El estudiante ${estudianteId} no pertenece al tutor ${input.tutorId}`,
        );
      }

      estudiantesMap.set(estudianteId, estudiante);
    }

    return estudiantesMap;
  }

  /**
   * Obtiene y valida los productos
   */
  private async obtenerYValidarProductos(
    input: CalcularPrecioInputDTO,
  ): Promise<Map<string, Producto>> {
    const productosMap = new Map<string, Producto>();

    // Obtener todos los IDs únicos de productos
    const todosLosProductosIds = new Set<string>();
    for (const productosIds of Object.values(input.productosIdsPorEstudiante)) {
      for (const productoId of productosIds) {
        todosLosProductosIds.add(productoId);
      }
    }

    // Obtener productos
    for (const productoId of todosLosProductosIds) {
      const producto = await this.productoRepo.obtenerPorId(productoId);

      if (!producto) {
        throw new Error(`Producto con ID ${productoId} no encontrado`);
      }

      productosMap.set(productoId, producto);
    }

    return productosMap;
  }

  /**
   * Calcula precios individuales por estudiante/producto
   * Delega la lógica de negocio al Domain Layer
   */
  private calcularPreciosIndividuales(
    estudiantes: Map<string, Estudiante>,
    productos: Map<string, Producto>,
    input: CalcularPrecioInputDTO,
    configuracion: ConfiguracionPrecios,
  ): CalculoIndividualDTO[] {
    const calculos: CalculoIndividualDTO[] = [];

    const cantidadHermanos = input.estudiantesIds.length;

    for (const estudianteId of input.estudiantesIds) {
      const estudiante = estudiantes.get(estudianteId)!;
      const productosIds = input.productosIdsPorEstudiante[estudianteId];

      // Validación ya hecha en validarInput(), pero TypeScript necesita el guard aquí
      if (!productosIds || productosIds.length === 0) {
        throw new Error(
          `El estudiante ${estudianteId} no tiene productos asignados`,
        );
      }

      const actividadesPorEstudiante = productosIds.length;

      for (const productoId of productosIds) {
        const producto = productos.get(productoId)!;

        // Preparar input para la función del domain
        const calculoInput: CalculoPrecioInput = {
          cantidadHermanos,
          actividadesPorEstudiante,
          tipoProducto: producto.tipo,
          tieneAACREA: input.tieneAACREA,
          configuracion,
        };

        // Aplicar reglas de negocio (Domain Layer)
        const resultado = calcularPrecioActividad(calculoInput);

        // Transformar a DTO
        calculos.push({
          estudianteId: estudiante.id,
          estudianteNombre: `${estudiante.nombre} ${estudiante.apellido}`,
          productoId: producto.id,
          productoNombre: producto.nombre,
          tipoProducto: producto.tipo,
          precioBase: resultado.precioBase,
          descuentoAplicado: resultado.precioBase.minus(resultado.precioFinal),
          precioFinal: resultado.precioFinal,
          tipoDescuento: resultado.tipoDescuento,
          detalleCalculo: resultado.detalleCalculo,
        });
      }
    }

    return calculos;
  }

  /**
   * Calcula el resumen del cálculo
   */
  private calcularResumen(
    calculos: CalculoIndividualDTO[],
    input: CalcularPrecioInputDTO,
  ): ResumenCalculoDTO {
    const subtotal = calculos.reduce(
      (sum, c) => sum.plus(c.precioBase),
      new Decimal(0),
    );

    const totalFinal = calculos.reduce(
      (sum, c) => sum.plus(c.precioFinal),
      new Decimal(0),
    );

    const totalDescuentos = subtotal.minus(totalFinal);

    // Analizar tipos de descuentos aplicados
    const tiposDescuento = new Set(calculos.map((c) => c.tipoDescuento));

    const tieneDescuentoHermanos =
      tiposDescuento.has(TipoDescuento.HERMANOS_BASICO) ||
      tiposDescuento.has(TipoDescuento.HERMANOS_MULTIPLE);

    const tieneDescuentoMultipleActividades = tiposDescuento.has(
      TipoDescuento.MULTIPLE_ACTIVIDADES,
    );

    const tieneDescuentoAACREA = tiposDescuento.has(TipoDescuento.AACREA);

    // Calcular totales
    const totalActividades = calculos.length;
    const cantidadEstudiantes = input.estudiantesIds.length;
    const cantidadHermanos = cantidadEstudiantes >= 2 ? cantidadEstudiantes : 0;

    return {
      cantidadEstudiantes,
      cantidadHermanos,
      totalActividades,
      subtotal,
      totalDescuentos,
      totalFinal,
      tieneDescuentoHermanos,
      tieneDescuentoMultipleActividades,
      tieneDescuentoAACREA,
    };
  }
}
