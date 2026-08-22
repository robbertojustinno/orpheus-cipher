import type { SecretCommand } from './commandTypes'

/** Registry deliberadamente vazio até validação do manuscrito final. */
export const secretCommandRegistry:SecretCommand[]=[]

export function findSecretCommand(trigger:string){const normalized=trigger.toLowerCase();return secretCommandRegistry.find(command=>command.trigger===normalized||command.aliases?.includes(normalized))}
