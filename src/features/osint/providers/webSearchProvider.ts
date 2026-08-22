import type{SearchContext,SearchProvider,SearchQuery}from'../types/osint'
/** Provider adapter point. Credentials must live in a future backend/service, never in this frontend. */
export class WebSearchProvider implements SearchProvider{readonly id:string='web';readonly name:string='GENERAL WEB';readonly status='unavailable' as const;supports(){return false}async search(_query:SearchQuery,_context:SearchContext){return[]}}
