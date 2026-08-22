import { useState } from 'react'
import { ActivityTerminal } from './components/ActivityTerminal'
import { AlertPanel } from './components/AlertPanel'
import { ConnectionMap } from './components/ConnectionMap'
import { EnigmaCard } from './components/EnigmaCard'
import { Icon } from './components/Icon'
import { RightWidget } from './components/RightWidget'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import { TopBar } from './components/TopBar'
import { formatFounderAccess } from './config/system'
import { EnigmaModal } from './features/enigmas/EnigmaModal'
import { DetectionSequence } from './features/narrative/DetectionSequence'
import { PrivacyPanel } from './features/operator/PrivacyPanel'
import { ModulePanel } from './features/modules/ModulePanel'
import type { TerminalAction } from './features/terminal/commandTypes'
import { useNarrativeStore } from './stores/narrativeStore'
import type { Enigma, OperatorIdentity } from './types'
import styles from './App.module.css'

const anonymousIdentity:OperatorIdentity={username:'OPERADOR',hostname:'HOST-UNKNOWN',platform:'unknown',arch:'unknown'}

function App(){
  const[active,setActive]=useState('Painel')
  const[menu,setMenu]=useState(false)
  const[toast,setToast]=useState('')
  const[interference,setInterference]=useState(false)
  const[selected,setSelected]=useState<Enigma|null>(null)
  const[searchQuery,setSearchQuery]=useState('')
  const[dossierSubject,setDossierSubject]=useState('')
  const[highlightObjective,setHighlightObjective]=useState(false)
  const{hydration,progress,logs,enigmas,setLogs,addTerminalLog,setNarrativeState,startMission,resetNarrative,recordAudit}=useNarrativeStore()

  const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(''),2800)}
  const handleEnigma=(enigma:Enigma)=>{
    if(enigma.status==='locked')return
    setSelected(enigma)
    addTerminalLog({source:'SYSTEM',type:'info',message:`Caixa Enigma ${String(enigma.number).padStart(2,'0')} acessada.`})
    void recordAudit('ENIGMA_OPENED',enigma.id)
  }
  const handleTerminalAction=(action:TerminalAction)=>{
    if(action.type==='navigate'){setActive(action.destination);return}
    if(action.type==='open-enigma'){const enigma=enigmas.find(item=>item.id===action.enigmaId);if(enigma)handleEnigma(enigma);return}
    if(action.type==='highlight-objective'){setHighlightObjective(true);window.setTimeout(()=>setHighlightObjective(false),2400);return}
    if(action.type==='prepare-search'){setSearchQuery(action.query);setActive('Pesquisa Profunda');return}
    if(action.type==='open-dossier'){setDossierSubject(action.subject);setActive('Dossiê');void recordAudit('DOSSIER_ACCESSED',action.subject)}
  }
  const overall=Math.round(enigmas.reduce((sum,enigma)=>sum+enigma.progress,0)/enigmas.length)
  const dashboard=!['Privacidade','Pesquisa Profunda','Dossiê','Deep Dorks'].includes(active)
  const identityVisible=progress.narrativeState==='DETECTED'||progress.narrativeState==='MISSION_ACTIVE'
  const displayIdentity=identityVisible?progress.operator:{...anonymousIdentity,platform:progress.operator.platform,arch:progress.operator.arch}

  return <div className={`${styles.app} ${interference?styles.interference:''}`}>
    {hydration==='ready'&&<DetectionSequence state={progress.narrativeState} firstDetectionCompleted={progress.firstDetectionCompleted} identity={progress.operator} setState={setNarrativeState} addLog={addTerminalLog} setInterference={setInterference}/>}
    <TopBar onMenu={()=>setMenu(true)} identity={displayIdentity} founderAccess={formatFounderAccess(progress.founderId,progress.founderTotal)}/>
    <Sidebar active={active} open={menu} onClose={()=>setMenu(false)} onNavigate={label=>{setActive(label);if(label!=='Painel'&&label!=='Privacidade')notify(`${label.toUpperCase()} // Módulo em preparação`)}}/>
    {menu&&<button className={styles.overlay} onClick={()=>setMenu(false)} aria-label="Fechar menu"/>}
    <main className={styles.main}>
      <div className={styles.breadcrumb}>
        <span>ORPHEUS</span><i>/</i><strong>{active.toUpperCase()}</strong>
        <small>CIPHER NODE // {identityVisible?progress.operator.username:'SESSION-UNBOUND'}</small>
        {import.meta.env.DEV&&<button className={styles.devReset} onClick={async()=>{await resetNarrative();location.reload()}}>RESET NARRATIVE STATE</button>}
      </div>
      {dashboard?<div className={styles.layout}>
        <div className={styles.primary}>
          <AlertPanel onStart={startMission} state={progress.narrativeState} identity={progress.operator}/>
          <section className={styles.enigmas}>
            <header className={styles.sectionHeader}>
              <div><b>02</b><div><h2>CAIXAS ENIGMAS</h2><small>ARQUIVOS NARRATIVOS // ACESSO PROGRESSIVO</small></div></div>
              <div className={styles.overall}><div><span>PROGRESSO GERAL</span><strong>{overall}%</strong></div><div><i style={{width:`${overall}%`}}/></div></div>
            </header>
            <div className={styles.enigmaGrid}>{enigmas.map(enigma=><EnigmaCard key={enigma.id} enigma={enigma} onAction={handleEnigma}/>)}</div>
          </section>
          <ActivityTerminal logs={logs} setLogs={setLogs} progress={progress} enigmas={enigmas} onAction={handleTerminalAction} onAudit={(type,resource)=>{void recordAudit(type,resource)}}/>
        </div>
        <aside className={styles.right}>
          <RightWidget title="OBJETIVO ATUAL" code="OBJ.01" className={highlightObjective?styles.objectiveHighlight:''}>
            <div className={styles.objectiveIcon}><Icon name="target" size={25}/></div>
            <p className={styles.objectiveText}>{progress.narrativeState==='MISSION_ACTIVE'?'Recuperar a primeira chave narrativa e identificar o padrão por trás do Protocolo Orpheus.':'Monitorar a integridade da sessão e aguardar novas instruções do sistema.'}</p>
            <div className={styles.objectiveStatus}><i/><div><small>STATUS</small><strong>{progress.narrativeState==='MISSION_ACTIVE'?'Em andamento':'Monitorando'}</strong></div><b>01</b></div>
          </RightWidget>
          <RightWidget title="ARQUIVOS CORROMPIDOS" code="ARC.12">
            <div className={styles.files}><div className={styles.donut}><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="41"/><circle className={styles.donutValue} cx="50" cy="50" r="41"/></svg><div><strong>3<small>/12</small></strong><span>RESTAURADOS</span></div></div><div><strong>Arquivos restaurados</strong><p>3 de 12 fragmentos recuperados.</p><button onClick={()=>notify('ARQUIVOS // Acesso ao cofre solicitado')}>VER ARQUIVOS <Icon name="arrow" size={13}/></button></div></div>
          </RightWidget>
          <RightWidget title="MAPA DE CONEXÕES" code="NET.08"><ConnectionMap operatorName={displayIdentity.username}/></RightWidget>
        </aside>
      </div>:active==='Privacidade'?<PrivacyPanel/>:active==='Pesquisa Profunda'?<ModulePanel module="search" query={searchQuery} onQueryChange={setSearchQuery}/>:active==='Dossiê'?<ModulePanel module="dossier" subject={dossierSubject}/>:<ModulePanel module="dorks"/>}
    </main>
    <StatusBar/>
    {selected&&<EnigmaModal enigma={selected} onClose={()=>setSelected(null)} onAttempt={()=>{addTerminalLog({source:'SYSTEM',type:'warning',message:'Validação indisponível: conteúdo narrativo ainda não configurado.'});notify('RESPOSTA NÃO PROCESSADA // Placeholder da Fase 2')}}/>}
    {toast&&<div className={styles.toast}><i/><div><small>ORPHEUS // SISTEMA</small>{toast}</div></div>}
  </div>
}
export default App
