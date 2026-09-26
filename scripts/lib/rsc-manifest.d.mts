export interface RscFamily { id: string; source: string; reason?: string }
export declare function classifyFamilies(manifestPath?: string): { client: RscFamily[]; server: RscFamily[] }
