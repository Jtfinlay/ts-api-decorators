import { IBindingTrigger, IHttpTriggerBinding } from "./Bindings";
import { ApiMethod, ManagedApi } from "ts-api-decorators";
import { AzureFunctionParams } from "../..";

export  class HttpBindingTriggerFactory {
	public static GetBindingForMethod(method: ApiMethod): IBindingTrigger {
		return {
			triggerMethod: method,
			triggerType: 'httpTrigger',
			getTriggerForRoutes: routes => ([
				// Input trigger binding
				{
					type: 'httpTrigger',
					direction: 'in',
					name: AzureFunctionParams.TransportTypeRequestParam,
					route: HttpBindingTriggerFactory.RewriteRouteForAzureFunction(routes[0].route),
					methods: routes.map(r => r.method.toLowerCase()),
					// TODO: authLevel
				},

				// Outupt binding
				{
					type: 'http',
					direction: 'out',
					name: AzureFunctionParams.TransportTypeResponseParam,
				}
			]),
		};
	}

	public static RewriteRouteForAzureFunction(route: string): string {
		return ManagedApi.GetRouteTokens(route)
			.map(t => {
				if (typeof t === 'string') {
					return t;
				}

				let outStr = t.prefix ? t.prefix : '';
				if (t.modifier && t.modifier !== '?') {
					console.warn('Unhandled modifier: ' + t.modifier);
				}
				outStr += `{${t.name}:regex(${t.pattern})${t.modifier ? t.modifier : ''}}`;
				if (t.suffix) {
					outStr += t.suffix;
				}
				return outStr;
			})
			.join('');
	}
}