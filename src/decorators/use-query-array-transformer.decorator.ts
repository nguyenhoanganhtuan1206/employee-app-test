import { Transform } from 'class-transformer';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

export default function UseQueryArrayTransformer(): PropertyDecorator {
  return Transform((params) => {
    let value = params.value;

    if (isString(value)) {
      value = value.split(',');
    }

    if (!value || isArray(value)) {
      return value;
    }

    return [value];
  });
}
