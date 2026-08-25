import{createHmac,randomBytes,scrypt as scryptCallback,timingSafeEqual}from'node:crypto';import{promisify}from'node:util'
const scrypt=promisify(scryptCallback),digest=(value,secret)=>createHmac('sha256',secret).update(value).digest('hex')
export async function verifyAdminPassword(password,encoded){const[scheme,saltHex,hashHex]=String(encoded).split('$');if(scheme!=='scrypt'||!saltHex||!hashHex)return false;const actual=await scrypt(String(password),Buffer.from(saltHex,'hex'),Buffer.from(hashHex,'hex').length);return timingSafeEqual(Buffer.from(hashHex,'hex'),actual)}
export async function createSession(repo,username,secret){const token=randomBytes(32).toString('base64url'),expires=new Date(Date.now()+8*60*60*1000);await repo.createSession(digest(token,secret),username,expires);return{token,expires}}
export const readSession=async(repo,token,secret)=>token?repo.session(digest(token,secret)):null
export const destroySession=async(repo,token,secret)=>{if(token)await repo.deleteSession(digest(token,secret))}
export const sessionHash=digest
