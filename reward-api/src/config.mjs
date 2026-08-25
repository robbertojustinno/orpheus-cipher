const required=(name)=>{const value=process.env[name];if(!value)throw new Error(`Missing required environment variable: ${name}`);return value}
export function config(){
 const production=process.env.NODE_ENV==='production'
 return{production,port:Number(process.env.PORT||10000),databaseUrl:required('DATABASE_URL'),allowedOrigins:new Set((process.env.ORPHEUS_ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean)),adminUsername:required('ADMIN_USERNAME'),adminPasswordHash:required('ADMIN_PASSWORD_HASH'),sessionSecret:required('SESSION_SECRET'),adminEmail:process.env.ADMIN_EMAIL||'',emailFrom:process.env.EMAIL_FROM||'',resendApiKey:process.env.RESEND_API_KEY||'',adminBaseUrl:process.env.ADMIN_BASE_URL||'',ssl:production}
}
