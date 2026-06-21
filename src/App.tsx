import { useState, useEffect } from 'react';
import { User, AcademicRecord, DocumentRecord } from './types';
import { ensureSeedAccount, getRecords, getDocs, store } from './lib/store';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Records } from './components/Records';
import { Documents } from './components/Documents';
import { AddRecordModal } from './components/AddRecordModal';
import { Toast } from './components/Toast';
import { sha256 } from './lib/crypto';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Initialize seed data
  useEffect(() => {
    ensureSeedAccount();
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (user) {
      loadData(user.email);
    }
  }, [user]);

  const loadData = async (email: string) => {
    setRecords(await getRecords(email));
    setDocs(await getDocs(email));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2600);
  };

  const handleSaveRecord = async (newRecord: any) => {
    if (!user) return;
    const recs = [...records, {
      ...newRecord,
      ts: Date.now(),
      onchain: false,
    }];
    setRecords(recs);
    await store.set('records_' + user.email, recs);
    setShowModal(false);
    showToast('Nilai tersimpan · sidik jari dibuat');
  };

  const handleAddDoc = async () => {
    if (!user) return;
    const title = window.prompt('Nama dokumen / prestasi:');
    if (!title) return;
    const type = window.prompt('Jenis (Sertifikat / Rapor / Penghargaan):', 'Sertifikat') || 'Dokumen';
    const sem = window.prompt('Semester:', 'Semester 1') || '-';
    const hash = await sha256(user.email + title + Date.now());
    
    const d: DocumentRecord[] = [...docs, {
      id: Math.random().toString(),
      title,
      type,
      sem,
      hash: hash.slice(0, 14),
      onchain: false,
      icon: '📄'
    }];
    setDocs(d);
    await store.set('docs_' + user.email, d);
    setView('documents');
    showToast('Dokumen ditambahkan');
  };

  if (!user) {
    return <AuthScreen onLogin={(u) => { setUser(u); setView('dashboard'); }} />;
  }

  return (
    <div id="app" style={{ display: 'grid' }}>
      <Sidebar 
        user={user} 
        currentView={view} 
        onNavigate={setView} 
        onLogout={() => setUser(null)} 
      />

      <main className="main">
        {view === 'dashboard' && (
          <Dashboard 
            user={user} 
            records={records} 
            docs={docs} 
            onAddRecord={() => setShowModal(true)} 
          />
        )}
        
        {view === 'records' && (
          <Records 
            records={records} 
            onAddRecord={() => setShowModal(true)} 
          />
        )}

        {view === 'documents' && (
          <Documents 
            docs={docs} 
            onAddDoc={handleAddDoc} 
          />
        )}
      </main>

      {showModal && (
        <AddRecordModal 
          user={user} 
          onClose={() => setShowModal(false)}
          onSave={handleSaveRecord}
        />
      )}

      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
