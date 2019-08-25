import { ManagedApiInternal } from "../apiManagement/ManagedApiInternal";
import { ApiMethod, ApiMethodFunction, ApiMethodCallbackFunction, IApiDefinition, ApiMethodReturnType } from "../apiManagement/ApiDefinition";
import 'reflect-metadata';

export type ClassConstructor = { new(...args: any[]): {} };

export type ApiGetMethodReturnType<T, K = (...args: any[]) => T> = (
	target: object,
	propertyKey: string,
	descriptor: TypedPropertyDescriptor<K>
) => void;

export function Api<T extends ClassConstructor>(constructor: T) {
	ManagedApiInternal.RegisterApi(constructor);
}

function wrapApiMethod<T extends ApiMethodFunction>(method: ApiMethod, route: string, descriptor: TypedPropertyDescriptor<ApiMethodFunction>): IApiDefinition {
	return {
		method,
		route,
		handler: descriptor.value,
	}
}

export function ApiGetMethod<T extends string>(route: string): ApiGetMethodReturnType<T>;
export function ApiGetMethod<T extends void, K extends (string | object)>(route: string): ApiGetMethodReturnType<T, (callback: ApiMethodCallbackFunction<K>, ...args: any[]) => T>;
export function ApiGetMethod<T extends object>(route: string): ApiGetMethodReturnType<T>;
export function ApiGetMethod<T extends Promise<string>>(route: string): ApiGetMethodReturnType<T>;
export function ApiGetMethod<T extends Promise<object>>(route: string): ApiGetMethodReturnType<T>;
export function ApiGetMethod<T extends ApiMethodReturnType>(route: string): ApiGetMethodReturnType<T> {
	return (
		target: object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<(...args: any[]) => T>
	) => {
		Reflect.defineMetadata(
			'apimethod',
			wrapApiMethod(ApiMethod.GET, route, descriptor),
			target);
	}
}

export function ApiPostMethod<T extends string>(route: string): ApiGetMethodReturnType<T>;
export function ApiPostMethod<T extends void, K extends (string | object)>(route: string): ApiGetMethodReturnType<T, (callback: ApiMethodCallbackFunction<K>, ...args: any[]) => T>;
export function ApiPostMethod<T extends object>(route: string): ApiGetMethodReturnType<T>;
export function ApiPostMethod<T extends Promise<string>>(route: string): ApiGetMethodReturnType<T>;
export function ApiPostMethod<T extends Promise<object>>(route: string): ApiGetMethodReturnType<T>;
export function ApiPostMethod<T extends ApiMethodReturnType>(route: string) {
	return (
		target: object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<(...args: any[]) => T>
	) => {
		Reflect.defineMetadata(
			'apimethod',
			wrapApiMethod(ApiMethod.POST, route, descriptor),
			target);
	}
}

export function ApiPutMethod<T extends string>(route: string): ApiGetMethodReturnType<T>;
export function ApiPutMethod<T extends void, K extends (string | object)>(route: string): ApiGetMethodReturnType<T, (callback: ApiMethodCallbackFunction<K>, ...args: any[]) => T>;
export function ApiPutMethod<T extends object>(route: string): ApiGetMethodReturnType<T>;
export function ApiPutMethod<T extends Promise<string>>(route: string): ApiGetMethodReturnType<T>;
export function ApiPutMethod<T extends Promise<object>>(route: string): ApiGetMethodReturnType<T>;
export function ApiPutMethod<T extends ApiMethodReturnType>(route: string) {
	return (
		target: object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<(...args: any[]) => T>
	) => {
		Reflect.defineMetadata(
			'apimethod',
			wrapApiMethod(ApiMethod.PUT, route, descriptor),
			target);
	}
}

export function ApiDeleteMethod<T extends string>(route: string): ApiGetMethodReturnType<T>;
export function ApiDeleteMethod<T extends void, K extends (string | object)>(route: string): ApiGetMethodReturnType<T, (callback: ApiMethodCallbackFunction<K>, ...args: any[]) => T>;
export function ApiDeleteMethod<T extends object>(route: string): ApiGetMethodReturnType<T>;
export function ApiDeleteMethod<T extends Promise<string>>(route: string): ApiGetMethodReturnType<T>;
export function ApiDeleteMethod<T extends Promise<object>>(route: string): ApiGetMethodReturnType<T>;
export function ApiDeleteMethod<T extends ApiMethodReturnType>(route: string) {
	return (
		target: object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<(...args: any[]) => T>
	) => {
		Reflect.defineMetadata(
			'apimethod',
			wrapApiMethod(ApiMethod.DELETE, route, descriptor),
			target);
	}
}