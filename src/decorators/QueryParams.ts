import { ManagedApiInternal } from "../apiManagement";
import { ApiParamValidationFunction, __ApiParamArgs } from "../apiManagement/InternalTypes";
import { ApiParamType } from "../apiManagement/ApiDefinition";
import { IQueryParamDecoratorDefinition } from "../transformer/ParamDecoratorTransformer";

export const queryParamDecoratorKey = 'queryParamDecorator';

export function QueryParamDecorator(d: IQueryParamDecoratorDefinition) {
	return (
		target: object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<any>
	) => {
		descriptor.writable = false;
		descriptor.configurable = false;
		Reflect.defineMetadata(queryParamDecoratorKey, d, target, propertyKey);
	}
}

export function GetQueryParamDecorator(param: string): IQueryParamDecoratorDefinition {
	return <IQueryParamDecoratorDefinition>Reflect.getMetadata(queryParamDecoratorKey, QueryParams, param);
}

export abstract class QueryParams {
	/**
	 * Decorates a query parameter that should be validated with a regular expression.
	 * @param stringValidationRegex The regular expression to validate the input
	 */
	@QueryParamDecorator({
		allowableTypes: ['string'],
		arguments: [
			{
				type: 'regexp',
				optional: true,
			}
		]
	})
	public static ApiQueryParamString(stringValidationRegex?: RegExp) {
		return QueryParams.ApiQueryParam((name, value) => {
			throw new Error('Not implemented');
		});
	}

	/**
	 * Decorates a query parameter that should be cast to a number.
	 * @param numberMin The minimum value, undefined for no minimum.
	 * @param numberMax The maximum value, undefined for no maximum.
	 * @param numberDefault The default value, undefined will use the minimum value if defined, if not the maximum, if not then undefined.
	 */
	@QueryParamDecorator({
		allowableTypes: ['number'],
		arguments: [
			{
				type: "numberMin",
				optional: true,
			},
			{
				type: "numberMax",
				optional: true,
			}
		]
	})
	public static ApiQueryParamNumber(numberMin?: number, numberMax?: number) {
		return QueryParams.ApiQueryParam((name, value) => {
			throw new Error('Not implemented');
		});
	}

	/**
	 * A query parameter.
	 * @param validator 
	 */
	public static ApiQueryParam(): ParameterDecorator;
	public static ApiQueryParam(validator?: ApiParamValidationFunction): ParameterDecorator;
	@QueryParamDecorator({
		allowableTypes: ['string', 'number', 'date'],
		arguments: [
			{
				type: "validationFunc",
				optional: true,
			}
		]
	})
	public static ApiQueryParam(a?: any): ParameterDecorator {
		const args = <__ApiParamArgs>a;
		return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
			ManagedApiInternal.AddApiHandlerParamMetadataToObject(
				{
					args,
					parameterIndex,
					propertyKey,
					type: ApiParamType.Query
				},
				target.constructor);
		}
	}
}

export const ApiQueryParam = QueryParams.ApiQueryParam;
export const ApiQueryParamString = QueryParams.ApiQueryParamString;
export const ApiQueryParamNumber = QueryParams.ApiQueryParamNumber;