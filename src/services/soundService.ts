export type SoundCue='terminal'|'alert'|'transmission'|'unlock'|'box-open'|'message'
const SOUND_KEY='orpheus.sound.enabled'
export const soundSettings={isEnabled:()=>localStorage.getItem(SOUND_KEY)!=='false',setEnabled:(enabled:boolean)=>localStorage.setItem(SOUND_KEY,String(enabled))}
export function playSoundCue(_cue:SoundCue){if(!soundSettings.isEnabled())return/* Pontos de áudio serão conectados quando os assets oficiais existirem. */}
