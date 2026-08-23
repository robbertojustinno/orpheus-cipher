export type LicenseType='MASTER'|'FOUNDER'|'STANDARD';export type LicenseStatus='active'|'revoked'|'suspended';export type LicenseHydration='loading'|'ready'|'error'
export interface LicenseIdentity{licenseId:string;type:LicenseType;founderNumber?:number;issuedAt:string;expiresAt?:string;status:LicenseStatus;capabilities:string[];keyId:string;maxActivations:number;offlineGraceDays:number}
export interface PersistedLicenseState{version:1;installationId:string;license:LicenseIdentity;token:string;activatedAt:string;lastValidatedAt:string}
export interface ActivationResult{ok:boolean;license?:LicenseIdentity;state?:PersistedLicenseState;code:'ACCEPTED'|'INVALID_LICENSE'|'INVALID_SIGNATURE'|'REVOKED'|'SUSPENDED'|'UNAVAILABLE'}
export interface LicenseValidationResult{valid:boolean;license?:LicenseIdentity;code:string;offline:boolean;graceRemainingDays:number}
export interface LicenseProvider{activate(key:string,installationId:string):Promise<ActivationResult>;validate(state:PersistedLicenseState):Promise<LicenseValidationResult>}
export const hasCapability=(license:LicenseIdentity|null|undefined,capability:string)=>Boolean(license?.status==='active'&&license.capabilities.includes(capability))
export const formatLicenseAccess=(license:LicenseIdentity|null|undefined)=>license?.type==='MASTER'?'MASTER ACCESS':license?.type==='FOUNDER'&&license.founderNumber?`${String(license.founderNumber).padStart(2,'0')}/30`:'STANDARD ACCESS'
export const offlineGraceRemaining=(lastValidatedAt:string,days:number,now=Date.now())=>Math.max(0,days-Math.floor((now-Date.parse(lastValidatedAt))/86_400_000))
