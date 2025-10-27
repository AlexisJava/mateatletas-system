import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador custom: verifica que una fecha/hora esté dentro del horario laboral
 * @param startHour - Hora de inicio (default: 8)
 * @param endHour - Hora de fin (default: 20)
 * @param validationOptions - Opciones de class-validator
 */
export function IsBusinessHours(
  startHour = 8,
  endHour = 20,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBusinessHours',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [startHour, endHour],
      options: validationOptions,
      validator: {
        validate(value: Date | string, args: ValidationArguments) {
          if (!value) return false;

          const date = new Date(value);
          const hour = date.getHours();

          const [start, end] = resolveConstraintBounds(
            args.constraints,
            startHour,
            endHour,
          );
          return hour >= start && hour < end;
        },
        defaultMessage(args: ValidationArguments) {
          const [start, end] = resolveConstraintBounds(
            args.constraints,
            startHour,
            endHour,
          );
          return `${args.property} debe estar entre las ${start}:00 y las ${end}:00 horas`;
        },
      },
    });
  };
}

function resolveConstraintBounds(
  constraints: ValidationArguments['constraints'],
  defaultStart: number,
  defaultEnd: number,
): [number, number] {
  if (!Array.isArray(constraints)) {
    return [defaultStart, defaultEnd];
  }

  const start = Number(constraints[0]);
  const end = Number(constraints[1]);

  const isValidStart = Number.isFinite(start);
  const isValidEnd = Number.isFinite(end);

  return [isValidStart ? start : defaultStart, isValidEnd ? end : defaultEnd];
}
