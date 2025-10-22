import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador custom: verifica que una fecha de nacimiento corresponda a una edad válida
 * @param minAge - Edad mínima permitida
 * @param maxAge - Edad máxima permitida
 * @param validationOptions - Opciones de class-validator
 */
export function IsValidAge(
  minAge: number,
  maxAge: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidAge',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minAge, maxAge],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;

          const birthDate = new Date(value);
          const today = new Date();

          // Calcular edad
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          const [min, max] = args.constraints;
          return age >= min && age <= max;
        },
        defaultMessage(args: ValidationArguments) {
          const [minAge, maxAge] = args.constraints;
          return `La edad debe estar entre ${minAge} y ${maxAge} años`;
        },
      },
    });
  };
}
