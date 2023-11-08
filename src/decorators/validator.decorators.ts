import type { ValidationOptions } from 'class-validator';
import {
  IsPhoneNumber as isPhoneNumber,
  registerDecorator,
  ValidateIf,
} from 'class-validator';
import { isString } from 'lodash';

import { ErrorCode, InvalidBadRequestException } from './../exceptions';

export function IsPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'isPassword',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string) {
          const isValid =
            /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!#$%&()*+,.:;<>?@[\\\]^_{}~-]).{8,}$/.test(
              value,
            );

          if (!isValid) {
            throw new InvalidBadRequestException(
              ErrorCode.PASSWORD_IS_NOT_STRONG,
            );
          }

          return true;
        },
      },
    });
  };
}

export function IsAlphabetic(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'isAlphabetic',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string) {
          const isValid = /^[\p{L} ]+$/u.test(value);

          if (!isValid) {
            throw new InvalidBadRequestException(
              ErrorCode.ONLY_ALPHABETIC_ARE_ALLOWED,
            );
          }

          return true;
        },
      },
    });
  };
}

export function IsPhoneNumber(
  validationOptions?: ValidationOptions & {
    region?: Parameters<typeof isPhoneNumber>[0];
  },
): PropertyDecorator {
  return isPhoneNumber(validationOptions?.region, {
    message: 'error.phoneNumber',
    ...validationOptions,
  });
}

export function IsTmpKey(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'tmpKey',
      target: object.constructor,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          return isString(value) && /^tmp\//.test(value);
        },
        defaultMessage(): string {
          return 'error.invalidTmpKey';
        },
      },
    });
  };
}

export function IsUndefinable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((obj, value) => value !== undefined, options);
}

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((obj, value) => value !== null, options);
}
