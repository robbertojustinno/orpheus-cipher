import type{LicenseProvider}from'../types/license';import{ProductionLicenseProvider}from'./productionLicenseProvider'
export async function createLicenseProvider():Promise<LicenseProvider>{if(import.meta.env.DEV){const{DevelopmentLicenseProvider}=await import('./developmentLicenseProvider');return new DevelopmentLicenseProvider()}return new ProductionLicenseProvider()}
