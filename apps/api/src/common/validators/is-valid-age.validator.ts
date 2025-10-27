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
        validate(value: Date | string, args: ValidationArguments) {
          if (!value) return false;

          const birthDate = new Date(value);
          const today = new Date();

          // Calcular edad
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          const [min, max] = resolveAgeBounds(args.constraints, minAge, maxAge);
          return age >= min && age <= max;
        },
        defaultMessage(args: ValidationArguments) {
          const [minAllowed, maxAllowed] = resolveAgeBounds(
            args.constraints,
            minAge,
            maxAge,
          );
          return `La edad debe estar entre ${minAllowed} y ${maxAllowed} años`;
        },
      },
    });
  };
}

function resolveAgeBounds(
  constraints: ValidationArguments['constraints'],
  fallbackMin: number,
  fallbackMax: number,
): [number, number] {
  if (!Array.isArray(constraints)) {
    return [fallbackMin, fallbackMax];
  }

  const min = Number(constraints[0]);
  const max = Number(constraints[1]);

  const minBound = Number.isFinite(min) ? min : fallbackMin;
  const maxBound = Number.isFinite(max) ? max : fallbackMax;

  return [minBound, maxBound];
}
