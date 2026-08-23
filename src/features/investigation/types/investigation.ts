import type { Confidence, OsintResult, SearchSession } from '../../osint/types/osint'

export type EntityType='person'|'username'|'email'|'domain'|'organization'|'document'|'website'|'location'|'identifier'|'unknown'
export type EvidenceType='exact_match'|'username_match'|'domain_match'|'email_domain'|'document_reference'|'organization_reference'|'temporal'|'manual'|'contradiction'
export type RelationshipType='mentions'|'uses_username'|'associated_domain'|'works_for'|'references'|'published_by'|'same_identifier'|'same_domain'|'possible_match'|'manual'
export type ReviewStatus='unreviewed'|'confirmed'|'rejected'
export type TimelinePrecision='exact'|'day'|'month'|'year'|'unknown'
export type SourceQuality='authoritative'|'public-index'|'secondary'|'unknown'

export interface InvestigationEntity{id:string;type:EntityType;label:string;normalizedValue:string;aliases:string[];confidence:'low'|'medium'|'high';evidenceIds:string[];sourceIds:string[];metadata:Record<string,string>}
export interface Evidence{id:string;sourceResultId:string;type:EvidenceType;description:string;weight:number;quality:SourceQuality;contradictory?:boolean}
export interface EntityRelationship{id:string;sourceEntityId:string;targetEntityId:string;type:RelationshipType;confidence:'low'|'medium'|'high';score:number;evidenceIds:string[];explanation:string;reviewStatus:ReviewStatus;manual?:boolean}
export interface TimelineEvent{id:string;date:string;precision:TimelinePrecision;title:string;sourceId?:string;entityIds:string[]}
export interface OperatorHypothesis{id:string;text:string;createdAt:string;entityIds:string[];label:'OPERATOR HYPOTHESIS'}
export interface InvestigationNote{id:string;text:string;createdAt:string}
export interface DnsRecordSet{domain:string;a:string[];aaaa:string[];mx:string[];ns:string[];cname:string[];txt:string[];queriedAt:string;status:'ONLINE'|'UNAVAILABLE'|'TIMEOUT'}
export interface Investigation{version:1;id:string;searchSessionId:string;target:string;createdAt:string;updatedAt:string;privateMode:boolean;sourceSession:SearchSession;entities:InvestigationEntity[];relationships:EntityRelationship[];evidence:Evidence[];timeline:TimelineEvent[];hypotheses:OperatorHypothesis[];notes:InvestigationNote[];dns?:DnsRecordSet}
export interface InvestigationSnapshot{investigation:Pick<Investigation,'version'|'id'|'target'|'createdAt'|'updatedAt'>;entities:InvestigationEntity[];relationships:EntityRelationship[];evidence:Evidence[];timeline:TimelineEvent[];hypotheses:OperatorHypothesis[];limitations:string[]}
export interface GraphNode{id:string;label:string;type:EntityType;confidence:string;x:number;y:number}
export interface GraphEdge{id:string;source:string;target:string;confidence:string;reviewStatus:ReviewStatus;type:RelationshipType}
export interface InvestigationGraph{nodes:GraphNode[];edges:GraphEdge[]}
export interface InvestigationSummary{results:number;entities:number;relationships:number;high:number;medium:number;low:number;contradictions:number}
export type InvestigationAuditEvent='ENTITY_CREATED'|'RELATIONSHIP_CREATED'|'RELATIONSHIP_CONFIRMED'|'RELATIONSHIP_REJECTED'|'HYPOTHESIS_CREATED'|'EVIDENCE_VIEWED'|'INVESTIGATION_DELETED'
export type {Confidence,OsintResult}
