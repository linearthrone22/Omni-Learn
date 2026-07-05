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
import { ChainVerification } from './components/ChainVerification';
import { AIAssistant } from './components/AIAssistant';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Public Share State
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedEmail, setSharedEmail] = useState('');
  const [sharedName, setSharedName] = useState('');

  // Initialize seed data and read URL share params
  useEffect(() => {
    async function init() {
      await ensureSeedAccount();
      
      const params = new URLSearchParams(window.location.search);
      const shareEmail = params.get('share');
      if (shareEmail) {
        setIsSharedView(true);
        setSharedEmail(shareEmail);
        
        // Capitalize human friendly name
        const namePart = shareEmail.split('@')[0];
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setSharedName(capitalized);
        
        setRecords(await getRecords(shareEmail));
        setDocs(await getDocs(shareEmail));
      }
    }
    init();
  }, []);

  // Load data when logged in user changes
  useEffect(() => {
    if (user && !isSharedView) {
      loadData(user.email);
    }
  }, [user, isSharedView]);

  const loadData = async (email: string) => {
    setRecords(await getRecords(email));
    setDocs(await getDocs(email));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveRecord = async (newRecord: any) => {
    if (!user) return;
    const hash = await sha256(user.email + newRecord.subject + newRecord.grade + Date.now());
    const recs = [...records, {
      ...newRecord,
      hash: hash.slice(0, 16),
      ts: Date.now(),
      onchain: false,
    }];
    setRecords(recs);
    await store.set('records_' + user.email, recs);
    setShowModal(false);
    showToast('Nilai tersimpan · Sidik jari kriptografis SHA-256 dibuat! 🔒');
  };

  const handleAddDoc = async () => {
    if (!user) return;
    const title = window.prompt('Nama dokumen / prestasi (cth: Juara 1 OSN Matematika):');
    if (!title) return;
    const type = window.prompt('Jenis (Sertifikat / Rapor / Penghargaan / Piagam):', 'Sertifikat') || 'Sertifikat';
    const sem = window.prompt('Semester:', 'Semester 1') || '-';
    const hash = await sha256(user.email + title + Date.now());
    
    const d: DocumentRecord[] = [...docs, {
      id: Math.random().toString(),
      title,
      type,
      sem,
      hash: hash.slice(0, 16),
      onchain: false,
      icon: '🏆'
    }];
    setDocs(d);
    await store.set('docs_' + user.email, d);
    setView('documents');
    showToast('Dokumen prestasi ditambahkan ke portofolio siswa! 🎖');
  };

  const handleShareLink = () => {
    if (!user) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${user.email}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Link portofolio berhasil disalin ke clipboard! Bagikan kepada Universitas/Instansi. 🔗');
  };

  // RENDER PUBLIC SHAREABLE PORTFOLIO VIEW
  if (isSharedView) {
    const avg = records.length ? records.reduce((s, r) => s + r.grade, 0) / records.length : 0;
    const onchainCount = records.filter(r => r.onchain).length;

    return (
      <div className="public-profile" style={{ maxWidth: '1000px', margin: '40px auto', padding: '24px', background: '#F8FAFC' }}>
        {/* Floating Print warning */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--chain-soft)', border: '1px solid #D6E2FF', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: 'var(--chain)', fontWeight: 500 }}>
            🌐 Anda sedang melihat <strong>Portofolio Publik Terverifikasi</strong> untuk {sharedName}.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-add" style={{ background: 'var(--chain)', fontSize: '12px', padding: '6px 14px' }} onClick={() => window.print()}>
              🖨️ Simpan PDF
            </button>
            <button className="logout" style={{ background: '#FFF', color: 'var(--ink)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }} onClick={() => { window.location.href = window.location.pathname; }}>
              Masuk Aplikasi
            </button>
          </div>
        </div>

        {/* Certificate Transcript Header */}
        <div className="panel" style={{ padding: '30px', border: '2px solid var(--line-2)', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Security Watermark */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '140px', opacity: 0.03, userSelect: 'none', transform: 'rotate(-15deg)' }}>⛓</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--chain)', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span style={{ fontSize: '18px' }}>⬡</span> Omni Learn Web3 Ledger
              </div>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '8px' }}>Transkrip & Portofolio Akademik</h1>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '2px' }}>Siswa terdaftar: <strong>{sharedName}</strong> ({sharedEmail})</p>
            </div>
            
            {/* Verification QR Code */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', background: '#FFF', border: '1px solid var(--line)', padding: '6px', borderRadius: '8px', margin: '0 auto' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`} 
                  alt="QR Audit Link" 
                  style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--muted-2)', display: 'block', marginTop: '4px', fontFamily: 'var(--mono)' }}>ID: VERIFIED-ONCHAIN</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '30px' }} className="grid-2">
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted-2)', textTransform: 'uppercase', fontWeight: 600 }}>Rata-rata Nilai</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--chain)', marginTop: '4px' }}>{avg.toFixed(1)}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted-2)', textTransform: 'uppercase', fontWeight: 600 }}>Total Mata Pelajaran</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', marginTop: '4px' }}>{records.length}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted-2)', textTransform: 'uppercase', fontWeight: 600 }}>On-Chain Anchored</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>{onchainCount}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted-2)', textTransform: 'uppercase', fontWeight: 600 }}>Status Keaslian</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#047857', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🛡️ TERVERIFIKASI
              </div>
            </div>
          </div>

          {/* Academic Records Table */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '14px' }}>📊 Rapor Semester & Mata Pelajaran</h3>
            <div style={{ border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                    <th style={{ padding: '12px 16px' }}>Mata Pelajaran</th>
                    <th style={{ padding: '12px 16px' }}>Semester</th>
                    <th style={{ padding: '12px 16px' }}>Nilai</th>
                    <th style={{ padding: '12px 16px' }}>Sidik Jari Kriptografis (Hash)</th>
                    <th style={{ padding: '12px 16px' }}>Konsensus</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{rec.subject}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{rec.semester}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`grade-pill ${rec.grade >= 85 ? 'g-a' : rec.grade >= 75 ? 'g-b' : 'g-c'}`} style={{ fontSize: '12px', minWidth: '40px' }}>
                          {rec.grade}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '11.5px', color: 'var(--muted)' }}>
                        <code>{rec.hash || 'Not hashed'}</code>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {rec.onchain ? (
                          <span className="pill-ok" style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                            ⛓ Block Mined
                          </span>
                        ) : (
                          <span className="pill-ok" style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                            ⌛ Local Register
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Certificates and accomplishments portfolio list */}
          {docs.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '14px' }}>🏆 Portofolio Prestasi & Piagam</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-2">
                {docs.map((doc, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--line)', background: '#FFF', padding: '14px', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <span style={{ fontSize: '24px' }}>{doc.icon || '🏆'}</span>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{doc.title}</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>{doc.type} · {doc.sem}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--muted-2)' }}>HASH: {doc.hash}</span>
                        {doc.onchain && (
                          <span style={{ fontSize: '10px', color: '#047857', fontWeight: 600, background: '#D1FAE5', padding: '1px 6px', borderRadius: '6px' }}>ON-CHAIN</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Sign-off */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1.5px dashed var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', maxWidth: '520px' }}>
              Laporan transkrip akademik ini dilindungi oleh sidik jari kriptografi terdistribusi platform <strong>Omni Learn</strong>. Validasi on-chain membuktikan keaslian laporan tanpa bergantung pada stempel kertas atau tanda tangan basah fisik.
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>OMNI LEARN VERIFIER</div>
              <div style={{ fontSize: '10.5px', color: 'var(--emerald)', fontWeight: 600, marginTop: '2px' }}>✓ SECURE CRYPTO CONSENSUS APPROVED</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            onShareLink={handleShareLink}
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

        {view === 'chain' && (
          <ChainVerification
            user={user}
            records={records}
            docs={docs}
            onUpdateRecords={setRecords}
            onUpdateDocs={setDocs}
          />
        )}

        {view === 'ai' && (
          <AIAssistant
            user={user}
            records={records}
            docs={docs}
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
