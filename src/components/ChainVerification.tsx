import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Copy, Link2, QrCode, ShieldCheck, Wallet } from 'lucide-react';
import { buildProofUrl } from '../lib/proof';
import { shortHash } from '../lib/crypto';
import { AcademicRecord, ChainTransaction, DocumentRecord } from '../types';

interface Props {
  records: AcademicRecord[];
  docs: DocumentRecord[];
  txs: ChainTransaction[];
  wallet: string | null;
  onConnectWallet: () => void;
  onMintRecord: (id: string) => void;
  onMintDoc: (id: string) => void;
  onMintAll: () => void;
  onCopyLink: (tx: ChainTransaction) => void;
}

export function ChainVerification({
  records,
  docs,
  txs,
  wallet,
  onConnectWallet,
  onMintRecord,
  onMintDoc,
  onMintAll,
  onCopyLink,
}: Props) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const pendingRecords = records.filter((record) => !record.onchain);
  const pendingDocs = docs.filter((doc) => !doc.onchain);
  const verifiedCount = records.filter((record) => record.onchain).length + docs.filter((doc) => doc.onchain).length;
  const totalCount = records.length + docs.length;

  const latestTxs = useMemo(() => [...txs].sort((a, b) => b.ts - a.ts).slice(0, 8), [txs]);

  useEffect(() => {
    let mounted = true;
    async function makeQrCodes() {
      const entries = await Promise.all(latestTxs.slice(0, 3).map(async (tx) => {
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
  }, [latestTxs]);

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Web3 Verification</div>
          <h1>Verifikasi Chain</h1>
        </div>
        <div className="top-actions">
          <button className="btn-secondary" onClick={onConnectWallet}>
            <Wallet size={16} /> {wallet ? shortWallet(wallet) : 'Connect Wallet'}
          </button>
          <button className="btn-add" onClick={onMintAll} disabled={!pendingRecords.length && !pendingDocs.length}>
            <ShieldCheck size={16} /> Mint Pending
          </button>
        </div>
      </div>

      <div className="chain-summary">
        <div>
          <span>Status ledger</span>
          <strong>{verifiedCount}/{totalCount || 0}</strong>
          <small>catatan dan dokumen terverifikasi</small>
        </div>
        <div>
          <span>Wallet demo</span>
          <strong>{wallet ? shortWallet(wallet) : 'Belum terhubung'}</strong>
          <small>{wallet ? 'Siap menandatangani transaksi simulasi' : 'Hubungkan wallet untuk mint'}</small>
        </div>
        <div>
          <span>Public proof</span>
          <strong>{txs.length}</strong>
          <small>link bukti siap dibagikan via QR</small>
        </div>
      </div>

      <div className="grid-2">
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

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>QR Public Verification</h3>
              <div className="ph-sub">Scan untuk membuka bukti hash dan transaksi</div>
            </div>
          </div>
          <div className="panel-body">
            {latestTxs.length ? (
              <div className="qr-list">
                {latestTxs.slice(0, 3).map((tx) => (
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
                <h4>Belum ada transaksi</h4>
                <p>Mint nilai atau dokumen untuk membuat QR proof.</p>
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
