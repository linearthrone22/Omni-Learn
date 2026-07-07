import { useEffect, useMemo, useState } from 'react';
import { AcademicRecord, ChainEntity, ChainTransaction, DocumentRecord, User } from './types';
import {
  ensureSeedAccount,
  getChainTransactions,
  getDocs,
  getRecords,
  getUsers,
  getWallet,
  saveChainTransactions,
  saveWallet,
  store,
} from './lib/store';
import { buildPortfolioHtml, buildProofUrl } from './lib/proof';
import { makeId, sha256 } from './lib/crypto';
import { AddDocumentModal } from './components/AddDocumentModal';
import { AddRecordModalClean } from './components/AddRecordModalClean';
import { AIAssistant } from './components/AIAssistant';
import { AppSidebar } from './components/AppSidebar';
import { AuthScreenClean } from './components/AuthScreenClean';
import { ChainVerification } from './components/ChainVerification';
import { DashboardClean } from './components/DashboardClean';
import { DocumentsClean } from './components/DocumentsClean';
import { PublicPortfolio } from './components/PublicPortfolio';
import { PublicVerification } from './components/PublicVerification';
import { RecordsClean } from './components/RecordsClean';
import { ToastClean } from './components/ToastClean';

type View = 'dashboard' | 'records' | 'documents' | 'chain' | 'ai';

export default function AppClean() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [txs, setTxs] = useState<ChainTransaction[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const isPublicProof = useMemo(() => new URLSearchParams(window.location.search).has('verify'), []);
  const isSharedPortfolio = useMemo(() => new URLSearchParams(window.location.search).has('share'), []);
  const [sharedMeta, setSharedMeta] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    async function init() {
      await ensureSeedAccount();
      setTxs(await getChainTransactions());

      const shareEmail = new URLSearchParams(window.location.search).get('share');
      if (shareEmail) {
        const normalizedEmail = shareEmail.trim().toLowerCase();
        setSharedMeta({
          email: normalizedEmail,
          name: emailToName(normalizedEmail),
        });
        setRecords((await getRecords(normalizedEmail)).map(normalizeRecord));
        setDocs((await getDocs(normalizedEmail)).map(normalizeDoc));
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user);
    }
  }, [user]);

  const showToast = (message: string) => {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(''), 2600);
  };

  const loadData = async (currentUser: User) => {
    const ownerEmail = getDataOwnerEmail(currentUser);
    const users = await getUsers();
    const ownerUser = users[ownerEmail] || currentUser;
    const loadedRecords = (await getRecords(ownerEmail)).map(normalizeRecord);
    const loadedDocs = (await getDocs(ownerEmail)).map(normalizeDoc);
    const loadedTxs = await getChainTransactions();
    const storedWallet = await getWallet(currentUser.email);
    const migrationWallet = storedWallet || await makeDemoWallet(currentUser.email);

    const { nextRecords, nextDocs, nextTxs } = ensureTransactionsForVerifiedItems({
      records: loadedRecords,
      docs: loadedDocs,
      txs: loadedTxs,
      user: ownerUser,
      wallet: migrationWallet,
    });

    setRecords(nextRecords);
    setDocs(nextDocs);
    setTxs(nextTxs);
    setWallet(storedWallet);
    await store.set('records_' + ownerEmail, nextRecords);
    await store.set('docs_' + ownerEmail, nextDocs);
    await saveChainTransactions(nextTxs);
  };

  const handleSaveRecord = async (newRecord: { id: string; subject: string; semester: string; grade: number; note: string; hash: string }) => {
    if (!user) return;
    if (!canManageRecords(user)) {
      setShowRecordModal(false);
      showToast('Hanya admin sekolah yang dapat menambahkan nilai.');
      return;
    }
    const ownerEmail = getDataOwnerEmail(user);
    const nextRecords: AcademicRecord[] = [...records, { ...newRecord, ts: Date.now(), onchain: false }];
    setRecords(nextRecords);
    await store.set('records_' + ownerEmail, nextRecords);
    setShowRecordModal(false);
    showToast('Nilai tersimpan dan sidik jari dibuat.');
  };

  const handleSaveDoc = async (doc: DocumentRecord) => {
    if (!user) return;
    if (!canManageRecords(user)) {
      setShowDocModal(false);
      showToast('Hanya admin sekolah yang dapat menambahkan dokumen.');
      return;
    }
    const ownerEmail = getDataOwnerEmail(user);
    const nextDocs = [...docs, doc];
    setDocs(nextDocs);
    await store.set('docs_' + ownerEmail, nextDocs);
    setShowDocModal(false);
    setView('documents');
    showToast('Dokumen ditambahkan ke portofolio.');
  };

  const connectWallet = async (): Promise<string | null> => {
    if (!user) return null;
    const ethereum = (window as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    let nextWallet: string | null = null;

    if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        nextWallet = accounts[0] || null;
      } catch (error) {
        nextWallet = null;
      }
    }

    if (!nextWallet) {
      nextWallet = await makeDemoWallet(user.email);
    }

    setWallet(nextWallet);
    await saveWallet(user.email, nextWallet);
    showToast('Wallet siap untuk verifikasi.');
    return nextWallet;
  };

  const mintRecord = async (id: string) => {
    if (!user) return;
    if (!canManageRecords(user)) {
      showToast('Hanya admin sekolah yang dapat memvalidasi nilai ke ledger.');
      return;
    }
    const target = records.find((record) => record.id === id || record.hash === id);
    if (!target || target.onchain) return;
    const nextWallet = wallet || await connectWallet();
    if (!nextWallet) return;
    const ownerEmail = getDataOwnerEmail(user);
    const ownerUser = await resolveDataOwner(user);
    const tx = createTransaction('record', target.id || target.hash, `${target.subject} - ${target.semester}`, target.hash, ownerUser, nextWallet, txs.length);
    const nextRecords = records.map((record) => record.id === id || record.hash === id ? { ...record, onchain: true, txId: tx.id, verifiedAt: tx.ts } : record);
    const nextTxs = [tx, ...txs];
    setRecords(nextRecords);
    setTxs(nextTxs);
    await store.set('records_' + ownerEmail, nextRecords);
    await saveChainTransactions(nextTxs);
    showToast('Nilai berhasil dimint ke ledger simulasi.');
  };

  const mintDoc = async (id: string) => {
    if (!user) return;
    if (!canManageRecords(user)) {
      showToast('Hanya admin sekolah yang dapat memvalidasi dokumen ke ledger.');
      return;
    }
    const target = docs.find((doc) => doc.id === id || doc.hash === id);
    if (!target || target.onchain) return;
    const nextWallet = wallet || await connectWallet();
    if (!nextWallet) return;
    const ownerEmail = getDataOwnerEmail(user);
    const ownerUser = await resolveDataOwner(user);
    const tx = createTransaction('document', target.id || target.hash, target.title, target.hash, ownerUser, nextWallet, txs.length);
    const nextDocs = docs.map((doc) => doc.id === id || doc.hash === id ? { ...doc, onchain: true, txId: tx.id, verifiedAt: tx.ts } : doc);
    const nextTxs = [tx, ...txs];
    setDocs(nextDocs);
    setTxs(nextTxs);
    await store.set('docs_' + ownerEmail, nextDocs);
    await saveChainTransactions(nextTxs);
    showToast('Dokumen berhasil dimint ke ledger simulasi.');
  };

  const mintAll = async () => {
    if (!user) return;
    if (!canManageRecords(user)) {
      showToast('Hanya admin sekolah yang dapat melakukan mint ke ledger.');
      return;
    }
    const nextWallet = wallet || await connectWallet();
    if (!nextWallet) return;

    const ownerEmail = getDataOwnerEmail(user);
    const ownerUser = await resolveDataOwner(user);
    const created: ChainTransaction[] = [];
    const nextRecords = records.map((record) => {
      if (record.onchain) return record;
      const tx = createTransaction('record', record.id || record.hash, `${record.subject} - ${record.semester}`, record.hash, ownerUser, nextWallet, txs.length + created.length);
      created.push(tx);
      return { ...record, onchain: true, txId: tx.id, verifiedAt: tx.ts };
    });
    const nextDocs = docs.map((doc) => {
      if (doc.onchain) return doc;
      const tx = createTransaction('document', doc.id || doc.hash, doc.title, doc.hash, ownerUser, nextWallet, txs.length + created.length);
      created.push(tx);
      return { ...doc, onchain: true, txId: tx.id, verifiedAt: tx.ts };
    });

    if (!created.length) {
      showToast('Tidak ada item pending untuk dimint.');
      return;
    }

    const nextTxs = [...created, ...txs];
    setRecords(nextRecords);
    setDocs(nextDocs);
    setTxs(nextTxs);
    await store.set('records_' + ownerEmail, nextRecords);
    await store.set('docs_' + ownerEmail, nextDocs);
    await saveChainTransactions(nextTxs);
    showToast(`${created.length} item berhasil dimint ke ledger.`);
  };

  const copyProofLink = async (tx: ChainTransaction) => {
    const url = buildProofUrl(tx);
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link verifikasi disalin.');
    } catch (error) {
      window.prompt('Salin link verifikasi:', url);
    }
  };

  const exportPortfolio = () => {
    if (!user) return;
    const ownerName = getProofOwner(user).name;
    const ownerEmail = getDataOwnerEmail(user);
    const html = buildPortfolioHtml({
      owner: { name: ownerName, email: ownerEmail, role: 'siswa' },
      records,
      docs,
      generatedAt: Date.now(),
    });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      window.setTimeout(() => printWindow.print(), 400);
      return;
    }

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omni-learn-${user.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Portofolio diunduh sebagai HTML siap cetak.');
  };

  const sharePortfolio = async () => {
    if (!user) return;
    const url = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(getDataOwnerEmail(user))}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link portofolio publik disalin.');
    } catch (error) {
      window.prompt('Salin link portofolio:', url);
    }
  };

  if (isPublicProof) {
    return (
      <>
        <PublicVerification
          txs={txs}
          onBack={() => {
            window.history.replaceState({}, '', window.location.pathname);
            window.location.reload();
          }}
        />
        {toastMsg && <ToastClean message={toastMsg} />}
      </>
    );
  }

  if (isSharedPortfolio) {
    return (
      <PublicPortfolio
        email={sharedMeta?.email || ''}
        name={sharedMeta?.name || 'Siswa Omni Learn'}
        records={records}
        docs={docs}
        onBack={() => {
          window.history.replaceState({}, '', window.location.pathname);
          window.location.reload();
        }}
      />
    );
  }

  if (!user) {
    return <AuthScreenClean onLogin={(nextUser) => { setUser(nextUser); setView('dashboard'); }} />;
  }

  return (
    <div id="app" style={{ display: 'grid' }}>
      <AppSidebar
        user={user}
        currentView={view}
        onNavigate={(nextView) => setView(nextView as View)}
        onLogout={() => {
          setUser(null);
          setRecords([]);
          setDocs([]);
          setWallet(null);
        }}
      />

      <main className="main">
        {view === 'dashboard' && (
          <DashboardClean
            user={user}
            records={records}
            docs={docs}
            onAddRecord={() => setShowRecordModal(true)}
            onSharePortfolio={sharePortfolio}
            onNavigate={(nextView) => setView(nextView as View)}
            canManage={canManageRecords(user)}
          />
        )}
        {view === 'records' && (
          <RecordsClean records={records} onAddRecord={() => setShowRecordModal(true)} onMintRecord={mintRecord} canManage={canManageRecords(user)} />
        )}
        {view === 'documents' && (
          <DocumentsClean docs={docs} onAddDoc={() => setShowDocModal(true)} onMintDoc={mintDoc} onExportPortfolio={exportPortfolio} canManage={canManageRecords(user)} />
        )}
        {view === 'chain' && (
          <ChainVerification
            user={getProofOwner(user)}
            records={records}
            docs={docs}
            txs={txs}
            wallet={wallet}
            onConnectWallet={connectWallet}
            onMintRecord={mintRecord}
            onMintDoc={mintDoc}
            onMintAll={mintAll}
            onCopyLink={copyProofLink}
            canManage={canManageRecords(user)}
          />
        )}
        {view === 'ai' && (
          <AIAssistant user={getProofOwner(user)} records={records} docs={docs} />
        )}
      </main>

      {showRecordModal && (
        <AddRecordModalClean user={getProofOwner(user)} onClose={() => setShowRecordModal(false)} onSave={handleSaveRecord} />
      )}
      {showDocModal && (
        <AddDocumentModal user={getProofOwner(user)} onClose={() => setShowDocModal(false)} onSave={handleSaveDoc} />
      )}
      {toastMsg && <ToastClean message={toastMsg} />}
    </div>
  );
}

function normalizeRecord(record: AcademicRecord): AcademicRecord {
  return {
    ...record,
    id: record.id || makeId('rec'),
    ts: record.ts || Date.now(),
    onchain: Boolean(record.onchain),
  };
}

function normalizeDoc(doc: DocumentRecord): DocumentRecord {
  return {
    ...doc,
    id: doc.id || makeId('doc'),
    onchain: Boolean(doc.onchain),
  };
}

function ensureTransactionsForVerifiedItems({
  records,
  docs,
  txs,
  user,
  wallet,
}: {
  records: AcademicRecord[];
  docs: DocumentRecord[];
  txs: ChainTransaction[];
  user: User;
  wallet: string;
}) {
  const nextTxs = [...txs];
  const nextRecords = records.map((record) => {
    if (!record.onchain || nextTxs.some((tx) => tx.hash === record.hash)) return record;
    const tx = createTransaction('record', record.id || record.hash, `${record.subject} - ${record.semester}`, record.hash, user, wallet, nextTxs.length);
    nextTxs.unshift(tx);
    return { ...record, txId: tx.id, verifiedAt: record.verifiedAt || tx.ts };
  });
  const nextDocs = docs.map((doc) => {
    if (!doc.onchain || nextTxs.some((tx) => tx.hash === doc.hash)) return doc;
    const tx = createTransaction('document', doc.id || doc.hash, doc.title, doc.hash, user, wallet, nextTxs.length);
    nextTxs.unshift(tx);
    return { ...doc, txId: tx.id, verifiedAt: doc.verifiedAt || tx.ts };
  });
  return { nextRecords, nextDocs, nextTxs };
}

function createTransaction(
  entity: ChainEntity,
  entityId: string,
  title: string,
  hash: string,
  user: User,
  wallet: string,
  offset: number,
): ChainTransaction {
  return {
    id: makeId('tx'),
    entity,
    entityId,
    hash,
    title,
    ownerEmail: user.email,
    ownerName: user.name,
    block: 420000 + offset + 1,
    ts: Date.now(),
    wallet,
  };
}

async function makeDemoWallet(email: string): Promise<string> {
  const hash = await sha256(`${email}|omni-learn-demo-wallet`);
  return `0x${hash.replace('0x', '').slice(0, 40)}`;
}

function getDataOwnerEmail(user: User): string {
  return user.linkedStudentEmail || user.email;
}

function canManageRecords(user: User): boolean {
  return user.role === 'admin';
}

async function resolveDataOwner(user: User): Promise<User> {
  const ownerEmail = getDataOwnerEmail(user);
  if (ownerEmail === user.email) return user;
  const users = await getUsers();
  return users[ownerEmail] || { name: 'Andini Pratama', email: ownerEmail, pass: 'demo123', role: 'siswa' };
}

function getProofOwner(user: User): User {
  if (!user.linkedStudentEmail) return user;
  return {
    name: 'Andini Pratama',
    email: user.linkedStudentEmail,
    pass: 'demo123',
    role: 'siswa',
  };
}

function emailToName(email: string): string {
  const localPart = email.split('@')[0] || 'siswa';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
