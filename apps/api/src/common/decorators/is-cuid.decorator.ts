import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Regex para validar CUID (formato usado por Prisma)
 * CUID v1: 25 caracteres alfanuméricos que empiezan con 'c'
 * Ejemplo: cjld2cjxh0000qzrmn831i7rn
 */
const CUID_REGEX = /^c[a-z0-9]{24}$/;

/**
 * Decorador de validación para CUIDs de Prisma
 *
 * @example
 * ```typescript
 * class MiDto {
 *   @IsCuid()
 *   comisionId: string;
 * }
 * ```
 */
export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} debe ser un CUID válido`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return CUID_REGEX.test(value);
        },
      },
    });
  };
}
