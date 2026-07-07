import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Copy, Link2, QrCode, ShieldCheck, Wallet } from 'lucide-react';
import { buildProofUrl } from '../lib/proof';
import { shortHash } from '../lib/crypto';
import { AcademicRecord, ChainTransaction, DocumentRecord, User } from '../types';

interface Props {
  user: User;
  records: AcademicRecord[];
  docs: DocumentRecord[];
  txs: ChainTransaction[];
  wallet: string | null;
  onConnectWallet: () => void;
  onMintRecord: (id: string) => void;
  onMintDoc: (id: string) => void;
  onMintAll: () => void;
  onCopyLink: (tx: ChainTransaction) => void;
  canManage: boolean;
}

export function ChainVerification({
  user,
  records,
  docs,
  txs,
  wallet,
  onConnectWallet,
  onMintRecord,
  onMintDoc,
  onMintAll,
  onCopyLink,
  canManage,
}: Props) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const pendingRecords = records.filter((record) => !record.onchain);
  const pendingDocs = docs.filter((doc) => !doc.onchain);
  const verifiedCount = records.filter((record) => record.onchain).length + docs.filter((doc) => doc.onchain).length;
  const totalCount = records.length + docs.length;

  const latestTxs = useMemo(() => [...txs].sort((a, b) => b.ts - a.ts).slice(0, 8), [txs]);
  const proofItems = useMemo(() => {
    const byHash = new Map<string, ChainTransaction>();
    latestTxs.forEach((tx) => byHash.set(tx.hash, tx));

    records.filter((record) => record.onchain).forEach((record, index) => {
      if (byHash.has(record.hash)) return;
      byHash.set(record.hash, {
        id: record.txId || `proof_record_${record.id || record.hash}`,
        entity: 'record',
        entityId: record.id || record.hash,
        hash: record.hash,
        title: `${record.subject} - ${record.semester}`,
        ownerEmail: user.email,
        ownerName: user.name,
        block: 420000 + index + 1,
        ts: record.verifiedAt || record.ts || Date.now(),
        wallet: wallet || '0x0000000000000000000000000000000000000000',
      });
    });

    docs.filter((doc) => doc.onchain).forEach((doc, index) => {
      if (byHash.has(doc.hash)) return;
      byHash.set(doc.hash, {
        id: doc.txId || `proof_doc_${doc.id || doc.hash}`,
        entity: 'document',
        entityId: doc.id || doc.hash,
        hash: doc.hash,
        title: doc.title,
        ownerEmail: user.email,
        ownerName: user.name,
        block: 430000 + index + 1,
        ts: doc.verifiedAt || Date.now(),
        wallet: wallet || '0x0000000000000000000000000000000000000000',
      });
    });

    return [...byHash.values()].sort((a, b) => b.ts - a.ts).slice(0, 6);
  }, [latestTxs, records, docs, user.email, user.name, wallet]);

  useEffect(() => {
    let mounted = true;
    async function makeQrCodes() {
      const entries = await Promise.all(proofItems.map(async (tx) => {
        const data = await QRCode.toDataURL(buildProofUrl(tx), {
          width: 150,
          margin: 1,
          color: { dark: '#0B1F3A', light: '#FFFFFF' },
        });
        return [tx.id, data] as const;
      }));
      if (mounted) {
        setQrMap(Object.fromEntries(entries));
      }
    }
    makeQrCodes();
    return () => {
      mounted = false;
    };
  }, [proofItems]);

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Web3 Verification</div>
          <h1>Verifikasi Chain</h1>
        </div>
        {canManage && (
          <div className="top-actions">
            <button className="btn-secondary" onClick={onConnectWallet}>
              <Wallet size={16} /> {wallet ? shortWallet(wallet) : 'Connect Wallet'}
            </button>
            <button className="btn-add" onClick={onMintAll} disabled={!pendingRecords.length && !pendingDocs.length}>
              <ShieldCheck size={16} /> Mint Pending
            </button>
          </div>
        )}
      </div>

      <div className="chain-summary">
        <div>
          <span>Status ledger</span>
          <strong>{verifiedCount}/{totalCount || 0}</strong>
          <small>catatan dan dokumen terverifikasi</small>
        </div>
        <div>
          <span>{canManage ? 'Wallet demo' : 'Mode akses'}</span>
          <strong>{canManage ? (wallet ? shortWallet(wallet) : 'Belum terhubung') : 'Read-only'}</strong>
          <small>{canManage ? (wallet ? 'Siap menandatangani transaksi simulasi' : 'Hubungkan wallet untuk mint') : 'Melihat bukti tanpa mengubah ledger'}</small>
        </div>
        <div>
          <span>Public proof</span>
          <strong>{txs.length}</strong>
          <small>link bukti siap dibagikan via QR</small>
        </div>
      </div>

      <div className="grid-2">
        {canManage && (
          <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Mint ke Ledger Simulasi</h3>
              <div className="ph-sub">Hash nilai dan dokumen dicatat sebagai transaksi immutable</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="mint-list">
              {[...pendingRecords.map((item) => ({ kind: 'record' as const, id: item.id || item.hash, title: `${item.subject} - ${item.semester}`, hash: item.hash })),
                ...pendingDocs.map((item) => ({ kind: 'document' as const, id: item.id || item.hash, title: item.title, hash: item.hash }))].map((item) => (
                <div className="mint-item" key={`${item.kind}-${item.id}`}>
                  <div>
                    <b>{item.title}</b>
                    <span>{shortHash(item.hash)}</span>
                  </div>
                  <button
                    className="mini-btn"
                    onClick={() => item.kind === 'record' ? onMintRecord(item.id) : onMintDoc(item.id)}
                  >
                    Mint
                  </button>
                </div>
              ))}
              {!pendingRecords.length && !pendingDocs.length && (
                <div className="empty small">
                  <CheckCircle2 size={34} />
                  <h4>Semua data sudah terverifikasi</h4>
                  <p>Ledger simulasi siap dipakai untuk QR dan share proof.</p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Verifikasi Publik & QR Code</h3>
              <div className="ph-sub">QR menyimpan full hash dan payload proof, tampilan hanya memendekkan hash</div>
            </div>
          </div>
          <div className="panel-body">
            {proofItems.length ? (
              <div className="qr-list">
                {proofItems.map((tx) => (
                  <div className="qr-card" key={tx.id}>
                    <div className="qr-img">
                      {qrMap[tx.id] ? <img src={qrMap[tx.id]} alt={`QR ${tx.title}`} /> : <QrCode size={48} />}
                    </div>
                    <div>
                      <b>{tx.title}</b>
                      <span>Block #{tx.block} - {shortHash(tx.hash)}</span>
                      <div className="qr-actions">
                        <button className="link-btn" onClick={() => onCopyLink(tx)}><Copy size={14} /> Copy</button>
                        <a className="link-btn" href={buildProofUrl(tx)} target="_blank" rel="noreferrer"><Link2 size={14} /> Buka</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty small">
                <QrCode size={34} />
                <h4>Belum ada QR proof</h4>
                <p>Mint nilai atau dokumen terlebih dahulu. Setelah on-chain, QR tampil otomatis di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-head">
          <div>
            <h3>Riwayat Ledger</h3>
            <div className="ph-sub">Transaksi terbaru dari catatan akademik</div>
          </div>
        </div>
        <div className="panel-body" style={{ padding: '18px 6px 6px' }}>
          {latestTxs.length ? (
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Entity</th>
                  <th>Block</th>
                  <th>Hash</th>
                  <th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {latestTxs.map((tx) => (
                  <tr key={tx.id}>
                    <td><span className="subj">{tx.title}</span></td>
                    <td>{tx.entity}</td>
                    <td>#{tx.block}</td>
                    <td><span className="hash">{shortHash(tx.hash)}</span></td>
                    <td><span className="hash">{shortWallet(tx.wallet)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty small">
              <ShieldCheck size={34} />
              <h4>Ledger masih kosong</h4>
              <p>Gunakan Mint Pending untuk mencatat hash ke ledger.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function shortWallet(wallet: string) {
  if (!wallet) return '-';
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}
