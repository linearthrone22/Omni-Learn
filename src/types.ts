export type Role = 'siswa' | 'ortu' | 'admin';

export interface User {
  name: string;
  email: string;
  pass: string;
  role: Role;
}

export interface AcademicRecord {
  id?: string;
  subject: string;
  semester: string;
  grade: number;
  note: string;
  ts: number;
  hash: string;
  onchain: boolean;
  txId?: string;
  verifiedAt?: number;
}

export interface DocumentRecord {
  id?: string;
  title: string;
  type: string;
  sem: string;
  hash: string;
  onchain: boolean;
  icon?: string;
  txId?: string;
  verifiedAt?: number;
}

export type ChainEntity = 'record' | 'document';

export interface ChainTransaction {
  id: string;
  entity: ChainEntity;
  entityId: string;
  hash: string;
  title: string;
  ownerEmail: string;
  ownerName: string;
  block: number;
  ts: number;
  wallet: string;
}

export interface PortfolioSnapshot {
  owner: Pick<User, 'name' | 'email' | 'role'>;
  records: AcademicRecord[];
  docs: DocumentRecord[];
  generatedAt: number;
}
