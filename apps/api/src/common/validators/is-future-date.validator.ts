import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador custom: verifica que una fecha sea futura
 * @param minMinutesInFuture - Minutos mínimos en el futuro (default: 0)
 * @param validationOptions - Opciones de class-validator
 */
export function IsFutureDate(
  minMinutesInFuture = 0,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minMinutesInFuture],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;

          const date = new Date(value);
          const now = new Date();
          const minFutureDate = new Date(
            now.getTime() + args.constraints[0] * 60000,
          );

          return date >= minFutureDate;
        },
        defaultMessage(args: ValidationArguments) {
          const minMinutes = args.constraints[0];
          if (minMinutes === 0) {
            return `${args.property} debe ser una fecha futura`;
          }
          return `${args.property} debe ser al menos ${minMinutes} minutos en el futuro`;
        },
      },
    });
  };
}
