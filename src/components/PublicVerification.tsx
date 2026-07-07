import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { decodeProof } from '../lib/proof';
import { shortHash } from '../lib/crypto';
import { ChainTransaction } from '../types';

interface Props {
  txs: ChainTransaction[];
  onBack: () => void;
}

export function PublicVerification({ txs, onBack }: Props) {
  const params = new URLSearchParams(window.location.search);
  const verifyId = params.get('verify') || '';
  const proof = decodeProof(params.get('proof'));
  const localTx = txs.find((tx) => tx.id === verifyId || tx.hash === verifyId);
  const tx = proof || localTx;
  const matches = !!tx && (!proof || proof.id === verifyId) && (!localTx || localTx.hash === tx.hash);

  return (
    <div className="proof-page">
      <div className="proof-card">
        <button className="link-btn" onClick={onBack}><ArrowLeft size={15} /> Kembali ke aplikasi</button>
        <div className={`proof-seal ${matches ? 'ok' : 'bad'}`}>
          {matches ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
        </div>
        <h1>{matches ? 'Bukti Akademik Terverifikasi' : 'Bukti Tidak Valid'}</h1>
        <p>
          {matches
            ? 'Hash dan metadata transaksi cocok dengan payload verifikasi Omni Learn.'
            : 'Payload verifikasi tidak ditemukan atau tidak cocok dengan ledger lokal.'}
        </p>

        {tx && (
          <div className="proof-grid">
            <div><span>Nama Item</span><b>{tx.title}</b></div>
            <div><span>Pemilik</span><b>{tx.ownerName}</b></div>
            <div><span>Entity</span><b>{tx.entity}</b></div>
            <div><span>Block</span><b>#{tx.block}</b></div>
            <div><span>Wallet</span><b>{tx.wallet}</b></div>
            <div><span>Hash</span><b className="hash-text">{shortHash(tx.hash, 14)}</b></div>
          </div>
        )}

        <div className="proof-foot">
          <ShieldCheck size={16} />
          Public verification prototype - dibuat untuk demo Phase 1 Omni Learn.
        </div>
      </div>
    </div>
  );
}
