import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador personalizado: verifica que un string sea un CUID válido
 *
 * CUID (Collision-resistant Unique IDentifier):
 * - Formato: c[timestamp][counter][fingerprint][random]
 * - Longitud: 25 caracteres
 * - Caracteres: [a-z0-9]
 * - Siempre comienza con 'c'
 *
 * Ejemplo: cmgwe19t10000xwk6grajhfx1
 *
 * Referencia: https://github.com/paralleldrive/cuid
 */
export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // CUID v1 format:
          // - Comienza con 'c'
          // - Longitud exacta de 25 caracteres
          // - Solo contiene letras minúsculas y números
          const cuidRegex = /^c[a-z0-9]{24}$/;

          return cuidRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser un CUID válido (formato: c[a-z0-9]{24})`;
        },
      },
    });
  };
}
