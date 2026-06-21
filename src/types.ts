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
}

export interface DocumentRecord {
  id?: string;
  title: string;
  type: string;
  sem: string;
  hash: string;
  onchain: boolean;
  icon: string;
}
