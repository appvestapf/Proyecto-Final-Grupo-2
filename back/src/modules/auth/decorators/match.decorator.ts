import {registerDecorator,ValidationArguments,ValidationOptions} from 'class-validator';

export function Match(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName,
      options: validationOptions,

      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const relatedValue = (args.object as Record<string, unknown>)[
            property
          ];

          return value === relatedValue;
        },

        defaultMessage() {
          return `${propertyName} debe coincidir con ${property}`;
        },
      },
    });
  };
}