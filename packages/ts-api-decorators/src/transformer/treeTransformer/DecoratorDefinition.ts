import * as ts from 'typescript';
import { InternalTypeDefinition } from '../../apiManagement/InternalTypes';
import { IExtractedApiDefinition } from '../ExtractionTransformer';
import { IHandlerTreeNodeParameter, IHandlerTreeNode } from './HandlerTree';
import { ITransformerMetadata, IMetadataDescriptor } from '../TransformerMetadata';
import { ITransformContext } from './ITransformContext';
import { ApiParamType } from '../../apiManagement/ApiDefinition';

export enum DecoratorType {
	Class,
	ClassMember,
	Method,
	MethodParameter,
	Constructor,
	ConstructorParameter,
}

// Decorator type definition
export interface IDecoratorDefinitionBase {
	magicFunctionName: string;
	indexTs: string;
	provider: string;
	decoratorType: DecoratorType;
	dependencies: IDecoratorDependency[];
	arguments: IDecoratorArgument[];
	metadata?: ITransformerMetadata[];
}

export interface IParameterDecoratorDefinition extends IDecoratorDefinitionBase {
	decoratorType: DecoratorType.MethodParameter | DecoratorType.ConstructorParameter;
	parameterType: ApiParamType;

	/**
	 * If the parameterType is `Transport`, the transport type id
	 */
	transportTypeId?: string;

	/**
	 * If set, parameter type must match at least one of the type restrictions
	 */
	parameterTypeRestrictions?: InternalTypeDefinition[];
	
	/**
	 * If set, all arguments will be transformed to object keys
	 */
	transformArgumentsToObject?: IMetadataDescriptor[] | boolean;
}

export interface IClassMemberDecoratorDefinition extends IDecoratorDefinitionBase {
	decoratorType: DecoratorType.ClassMember | DecoratorType.ConstructorParameter;

	/**
	 * If set, parameter type must match at least one of the type restrictions
	 */
	memberTypeRestrictions?: InternalTypeDefinition[];
}

export interface IClassDecoratorDefinition extends IDecoratorDefinitionBase {
	decoratorType: DecoratorType.Class;
}

export interface IMethodDecoratorDefinition extends IDecoratorDefinitionBase {
	decoratorType: DecoratorType.Method;

	/**
	 * If set, parameter type must match at least one of the type restrictions
	 */
	returnTypeRestrictions?: InternalTypeDefinition[];
}

export interface IConstructorDecoratorDefinition extends IDecoratorDefinitionBase {
	decoratorType: DecoratorType.Method | DecoratorType.Constructor;
}

export type IDecoratorDefinition =
	IParameterDecoratorDefinition
	| IConstructorDecoratorDefinition
	| IClassMemberDecoratorDefinition
	| IClassDecoratorDefinition
	| IMethodDecoratorDefinition
;

export enum DecoratorDependencyType {
	NameDependency, // Dependency is on the `name` field of the IDecoratorDefinition.
	ProviderDependency, // Dependency is on the `provider` field of the IDecoratorDefinition.
}

export enum DecoratorDependencyLocation {
	Parent, // Dependency is on a parent of the current decorator
	Peer, // Dependency is on a peer of the current decorator
}

export interface IDecoratorDependency {
	type: DecoratorDependencyType;
	dependency: string;
	location: DecoratorDependencyLocation;
}

export interface IDecoratorArgument {
	type: InternalTypeDefinition;

	/**
	 * Whether the argument is optional. Defaults to false;
	 */
	optional?: boolean; // Defaults to false

	/**
	 * Function called to transform the argument
	 */
	transformer?: IDecoratorArgumentTransformerFunction; // Defaults to false

	/**
	 * Function called to extract metadata from the argument
	 */
	metadataExtractor?: IArgumentMetadataExtractorFunction;
}

export interface IDecoratorArgumentProcessorArgs {
	node: ts.Node,
	transformContext: ITransformContext;
	argumentExpression: ts.Expression;
	argument: IDecoratorArgument;
	index: number;
}

export type IDecoratorArgumentTransformerFunction = (args: IDecoratorArgumentProcessorArgs) => ts.Expression | void;

export type IArgumentMetadataExtractorFunction = (args: IDecoratorArgumentProcessorArgs) => ITransformerMetadata | void;