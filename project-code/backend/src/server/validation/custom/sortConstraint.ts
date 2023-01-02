import {registerDecorator, ValidationArguments, ValidationOptions} from "class-validator";

/**
 * Custom IsSort decorator function that ensures a 'sort' value is either
 * 1 or -1 (for ascending or descending).
 * @param validationOptions The validation options.
 * @returns The decorator function.
 */
export function IsSort(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isSort',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'number' && [1, -1].indexOf(value) !== -1;
                }
            }
        });
    }
}