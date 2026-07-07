import { User, AcademicRecord, DocumentRecord, ChainTransaction } from '../types';

const mem: Record<string, any> = {};

export const store = {
  async get<T>(k: string): Promise<T | null> {
    try {
      const r = localStorage.getItem(k);
      return r ? JSON.parse(r) : (mem[k] ?? null);
    } catch (e) {
      return mem[k] ?? null;
    }
  },
  async set(k: string, v: any) {
    mem[k] = v;
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
};

export async function getUsers(): Promise<Record<string, User>> {
  return (await store.get<Record<string, User>>('users')) || {};
}

export async function getRecords(email: string): Promise<AcademicRecord[]> {
  return (await store.get<AcademicRecord[]>('records_' + email)) || [];
}

export async function getDocs(email: string): Promise<DocumentRecord[]> {
  return (await store.get<DocumentRecord[]>('docs_' + email)) || [];
}

export async function getChainTransactions(): Promise<ChainTransaction[]> {
  return (await store.get<ChainTransaction[]>('chain_transactions')) || [];
}

export async function saveChainTransactions(txs: ChainTransaction[]) {
  await store.set('chain_transactions', txs);
}

export async function getWallet(email: string): Promise<string | null> {
  return await store.get<string>('wallet_' + email);
}

export async function saveWallet(email: string, wallet: string) {
  await store.set('wallet_' + email, wallet);
}

export async function seedFor(email: string, full: boolean) {
  if (!full) {
    await store.set('records_' + email, []);
    await store.set('docs_' + email, []);
    return;
  }
  const subjects: [string, number[]][] = [
    ['Matematika', [78, 82, 85, 88]],
    ['Bahasa Indonesia', [85, 84, 88, 90]],
    ['IPA', [72, 75, 80, 86]],
    ['Bahasa Inggris', [80, 83, 82, 89]],
  ];
  const recs: AcademicRecord[] = [];
  for (const [subj, grades] of subjects) {
    grades.forEach((g, i) => {
      recs.push({
        id: Math.random().toString(),
        subject: subj,
        semester: 'Semester ' + (i + 1),
        grade: g,
        note: '',
        ts: Date.now() - (8 - i) * 86400000 - Math.random() * 5000000,
        hash: '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18),
        onchain: i < 3
      });
    });
  }
  await store.set('records_' + email, recs);
  await store.set('docs_' + email, [
    { id: '1', title: 'Juara 2 Olimpiade Matematika', type: 'Sertifikat', sem: 'Semester 3', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: '🏅' },
    { id: '2', title: 'Rapor Semester 3', type: 'Rapor', sem: 'Semester 3', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: '📋' },
    { id: '3', title: 'Sertifikat Lomba Coding', type: 'Sertifikat', sem: 'Semester 4', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: false, icon: '💻' },
  ]);
}

export async function ensureSeedAccount() {
  const users = await getUsers();
  const demoUsers: User[] = [
    { name: 'Andini Pratama', email: 'andini@sekolah.id', pass: 'demo123', role: 'siswa' },
    { name: 'Budi Pratama', email: 'ortu@sekolah.id', pass: 'demo123', role: 'ortu', linkedStudentEmail: 'andini@sekolah.id' },
    { name: 'SMA Negeri 1 Jakarta', email: 'sekolah@sekolah.id', pass: 'demo123', role: 'admin', linkedStudentEmail: 'andini@sekolah.id', organization: 'SMA Negeri 1 Jakarta' },
  ];

  let changed = false;
  for (const demoUser of demoUsers) {
    if (!users[demoUser.email]) {
      users[demoUser.email] = demoUser;
      changed = true;
    } else {
      users[demoUser.email] = { ...users[demoUser.email], ...demoUser };
      changed = true;
    }
  }

  if (changed) {
    await store.set('users', users);
  }

  const studentRecords = await getRecords('andini@sekolah.id');
  const studentDocs = await getDocs('andini@sekolah.id');
  if (!studentRecords.length || !studentDocs.length) {
    await seedFor('andini@sekolah.id', true);
  }
}
