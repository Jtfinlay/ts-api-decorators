import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import transformer from '../transformer/transformers/extractionTransformer';
import { TransformerFuncType, getDefaultCompilerOptions, parseTsConfig, compileSources } from '../Util/CompilationUtil';
import { ParsedCommandLine } from 'typescript';
import { PackageJson, getPackageJsonAuthor } from './CommandUtil';
import { IExtractedApiDefinitionWithMetadata } from '../transformer/ExtractionTransformer';
import { IProgramInfo } from './IProgramInfo';
import { IParseOptions } from './ProgramOptions';
import { ApiMethod } from '..';

export interface IParseApiResult {
    compilationResult: { [path: string]: ts.TransformationResult<ts.Node> };
    extractedApis: IExtractedApiDefinitionWithMetadata[];
    programInfo: IProgramInfo;
    tsConfig?: ParsedCommandLine;
    tsConfigPath?: string;
}

export abstract class CliCommand {
    private static readonly DEFAULT_TSCONFIG = 'tsconfig.json';
    private console: typeof console = console;
    private extractedApis: IExtractedApiDefinitionWithMetadata[] = [];

    protected async parseApi(options: IParseOptions): Promise<IParseApiResult> {
        if (!fs.existsSync(options.rootDir)) {
            throw new Error(`File does not exist: ${options.rootDir}`);
        }

        const resolvedRootDir = path.resolve(process.cwd(), options.rootDir);
        const rootDirStat = fs.lstatSync(resolvedRootDir);
        options.isDir = rootDirStat.isDirectory();

        const transformers: TransformerFuncType[] = [
            program => transformer(program, {
                onApiMethodExtracted: apiMethod => this.onApiMethodExtracted(apiMethod)
            }),
        ]
        
        const hasTsConfig = !!options.tsconfig;
        if (!hasTsConfig) {
            options.tsconfig = CliCommand.DEFAULT_TSCONFIG;
        }

        this.disableConsoleOutput();
        let compilationResult = null;
        let tsConfig: ParsedCommandLine;
        let tsConfigPath: string;
        if (options.isDir) {
            const loadedConfig = this.loadTsConfig(options.tsconfig, resolvedRootDir);
            tsConfig = loadedConfig.tsConfig;
            tsConfigPath = loadedConfig.path;
            compilationResult = compileSources(
                tsConfig.fileNames, 
                {
                    ...tsConfig.options,
                    noEmit: true,
                }, transformers);
        } else {
            const loadedConfig = this.loadTsConfig(options.tsconfig, path.dirname(resolvedRootDir));
            tsConfig = loadedConfig.tsConfig;
            tsConfigPath = loadedConfig.path;
            compilationResult = compileSources(
                [options.rootDir],
                {
                    ...tsConfig.options,
                    noEmit: true,
                }, transformers);
        }
        this.enableConsoleOutput();

        return {
            tsConfig,
            tsConfigPath,
            compilationResult,
            extractedApis: this.extractedApis,
            programInfo: this.loadApiInfo(options.apiInfo),
        };
    }

    private loadTsConfig(tsConfig: string | undefined, resolvedRootDir: string): { tsConfig: ParsedCommandLine, path: string } {
        let config: string;
        if (tsConfig) {
            config = tsConfig;
        } else {
            config = CliCommand.DEFAULT_TSCONFIG;
        }

        const tsconfigPath = path.resolve(process.cwd(), config);
        if (!fs.existsSync(tsconfigPath)) {
            if (tsConfig) {
                throw new Error(`tsconfig does not exist: ${tsconfigPath}`);
            }

            return {
                tsConfig: {
                    options: getDefaultCompilerOptions(),
                    errors: [],
                    fileNames: []
                },
                path: tsconfigPath,
            }
        }

        return {
            tsConfig: parseTsConfig(path.dirname(tsconfigPath), tsconfigPath),
            path: tsconfigPath,
        };
    }

    private loadApiInfo(apiInfoPath: string): IProgramInfo | undefined {
        if (typeof apiInfoPath !== 'string') {
            return undefined;
        }

        const file = path.resolve(process.cwd(), apiInfoPath);
        if (!fs.existsSync(file)) {
            return undefined;
        }

        const infoBase: PackageJson = require(file);
        return {
            version: infoBase.version,
            title: infoBase.name,
            description: infoBase.description,
            contact: getPackageJsonAuthor(infoBase),
            license: [
                {
                    name: infoBase.license,
                }
            ],
            homepage: infoBase.homepage,
            basePath: infoBase.basePath,
            host: infoBase.host,
        };
    }

    protected disableConsoleOutput() {
        this.console = {...console};
        for (const key of Object.keys(console)) {
            if (typeof console[key] === 'function') {
                console[key] = () => {};
            }
        }
    }

    protected enableConsoleOutput() {
        for (const key of Object.keys(this.console)) {
            if (typeof console[key] === 'function') {
                console[key] = this.console[key];
            }
        }
    }

    private onApiMethodExtracted(method: IExtractedApiDefinitionWithMetadata) {
        this.extractedApis.push(method);
    }

    protected printExtractionSummary(options: IParseOptions, api: IParseApiResult): string {
        const Table = require('cli-table');
        const table = new Table({
            head: ['Method', 'Route', 'File'],
        });

        const methodRoutes = new Map<ApiMethod, Set<string>>();
        api.extractedApis.forEach(a => {
            if (!methodRoutes.has(a.method)) {
                methodRoutes.set(a.method, new Set<string>());
            }

            const methodMath = methodRoutes.get(a.method);
            if (!methodMath.has(a.route)) {
                methodMath.add(a.route);
                table.push([a.method, a.route, a.file]);
            }
        });

        return table.toString();
    }
}