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

async function seedFullDemoStudent(email: string) {
  const subjectProfiles: Record<string, [string, number[]][]> = {
    'andini@sekolah.id': [
      ['Matematika', [78, 82, 85, 88]],
      ['Bahasa Indonesia', [85, 84, 88, 90]],
      ['IPA', [72, 75, 80, 86]],
      ['Bahasa Inggris', [80, 83, 82, 89]],
    ],
    'raka@sekolah.id': [
      ['Matematika', [88, 90, 92, 94]],
      ['Bahasa Indonesia', [76, 79, 80, 82]],
      ['IPA', [84, 86, 89, 91]],
      ['Bahasa Inggris', [72, 74, 78, 81]],
    ],
    'salsabila@sekolah.id': [
      ['Matematika', [70, 74, 78, 83]],
      ['Bahasa Indonesia', [89, 91, 92, 94]],
      ['IPA', [78, 80, 82, 85]],
      ['Bahasa Inggris', [86, 88, 90, 93]],
    ],
  };

  const records: AcademicRecord[] = [];
  for (const [subject, grades] of subjectProfiles[email] || subjectProfiles['andini@sekolah.id']) {
    grades.forEach((grade, index) => {
      records.push({
        id: `${email}-record-${subject}-${index + 1}`,
        subject,
        semester: 'Semester ' + (index + 1),
        grade,
        note: index >= 2 ? 'Tren belajar meningkat dan konsisten.' : '',
        ts: Date.now() - (10 - index) * 86400000 - Math.random() * 5000000,
        hash: '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18),
        onchain: index < 3,
      });
    });
  }

  const docProfiles: Record<string, DocumentRecord[]> = {
    'andini@sekolah.id': [
      { id: 'andini-doc-1', title: 'Juara 2 Olimpiade Matematika', type: 'Sertifikat', sem: 'Semester 3', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: 'award' },
      { id: 'andini-doc-2', title: 'Rapor Semester 3', type: 'Rapor', sem: 'Semester 3', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: 'file' },
      { id: 'andini-doc-3', title: 'Sertifikat Lomba Coding', type: 'Sertifikat', sem: 'Semester 4', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: false, icon: 'code' },
    ],
    'raka@sekolah.id': [
      { id: 'raka-doc-1', title: 'Finalis Kompetisi Robotik Jakarta', type: 'Sertifikat', sem: 'Semester 4', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: 'code' },
      { id: 'raka-doc-2', title: 'Rapor Semester 4', type: 'Rapor', sem: 'Semester 4', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: 'file' },
      { id: 'raka-doc-3', title: 'Ketua Tim Eksperimen Sains', type: 'Penghargaan', sem: 'Semester 3', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: false, icon: 'award' },
    ],
    'salsabila@sekolah.id': [
      { id: 'salsa-doc-1', title: 'Juara 1 Debat Bahasa Inggris', type: 'Sertifikat', sem: 'Semester 4', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: 'award' },
      { id: 'salsa-doc-2', title: 'Rapor Semester 4', type: 'Rapor', sem: 'Semester 4', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: true, icon: 'file' },
      { id: 'salsa-doc-3', title: 'Portofolio Karya Tulis Ilmiah', type: 'Portofolio', sem: 'Semester 3', hash: '0x' + Math.random().toString(16).slice(2, 14), onchain: false, icon: 'file' },
    ],
  };

  await store.set('records_' + email, records);
  await store.set('docs_' + email, docProfiles[email] || docProfiles['andini@sekolah.id']);
}

export async function ensureSeedAccount() {
  const users = await getUsers();
  const demoUsers: User[] = [
    { name: 'Andini Pratama', email: 'andini@sekolah.id', pass: 'demo123', role: 'siswa', className: 'XI IPA 1' },
    { name: 'Raka Santoso', email: 'raka@sekolah.id', pass: 'demo123', role: 'siswa', className: 'XI IPA 1' },
    { name: 'Salsabila Putri', email: 'salsabila@sekolah.id', pass: 'demo123', role: 'siswa', className: 'XI IPS 2' },
    {
      name: 'Budi Pratama',
      email: 'ortu@sekolah.id',
      pass: 'demo123',
      role: 'ortu',
      linkedStudentEmail: 'andini@sekolah.id',
      linkedStudentEmails: ['andini@sekolah.id', 'raka@sekolah.id'],
    },
    { name: 'SMA Negeri 1 Jakarta', email: 'sekolah@sekolah.id', pass: 'demo123', role: 'admin', organization: 'SMA Negeri 1 Jakarta' },
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

  for (const student of demoUsers.filter((demoUser) => demoUser.role === 'siswa')) {
    const studentRecords = await getRecords(student.email);
    const studentDocs = await getDocs(student.email);
    if (!studentRecords.length || !studentDocs.length) {
      await seedFullDemoStudent(student.email);
    }
  }
}
