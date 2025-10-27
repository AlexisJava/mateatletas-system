import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * Validador custom: verifica que un teléfono sea válido para Argentina
 * Acepta formatos:
 * - +54 9 11 1234-5678
 * - +5491112345678
 * - 11 1234-5678
 * - 1112345678
 * - (011) 1234-5678
 */
export function IsPhoneNumberAR(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumberAR',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true; // Si es opcional, permitir vacío

          const phone = String(value).replace(/[\s\-\(\)]/g, ''); // Eliminar espacios, guiones, paréntesis

          // Patrones aceptados:
          // +549111234567 (11 dígitos con +549)
          // 111234567 (área + número sin código de país)
          // Mínimo 10 dígitos (área + número)

          const patterns = [
            /^\+549\d{10,11}$/, // +549 + código de área + número
            /^\d{10,11}$/, // Solo dígitos (mínimo 10)
          ];

          return patterns.some((pattern) => pattern.test(phone));
        },
        defaultMessage() {
          return 'Debe proporcionar un número de teléfono válido para Argentina';
        },
      },
    });
  };
}
