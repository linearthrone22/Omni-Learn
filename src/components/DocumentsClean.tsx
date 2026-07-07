import { Award, Code2, Download, FileText, Plus, ShieldCheck } from 'lucide-react';
import { shortHash } from '../lib/crypto';
import { DocumentRecord } from '../types';

interface Props {
  docs: DocumentRecord[];
  onAddDoc: () => void;
  onMintDoc: (id: string) => void;
  onExportPortfolio: () => void;
  canManage: boolean;
}

export function DocumentsClean({ docs, onAddDoc, onMintDoc, onExportPortfolio, canManage }: Props) {
  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Portofolio</div>
          <h1>Prestasi & Dokumen</h1>
        </div>
        <div className="top-actions">
          <button className="btn-secondary" onClick={onExportPortfolio}><Download size={16} /> Export PDF</button>
          {canManage && <button className="btn-add" onClick={onAddDoc}><Plus size={16} /> Tambah Dokumen</button>}
        </div>
      </div>
      <div className="panel">
        <div className="panel-body">
          {docs.length ? (
            <div className="doc-grid">
              {docs.map((doc) => {
                const Icon = pickIcon(doc);
                return (
                  <div className="doc-card" key={doc.id || doc.hash}>
                    <div className="doc-thumb">
                      <Icon size={34} />
                      {doc.onchain && <div className="doc-seal"><ShieldCheck size={13} /></div>}
                    </div>
                    <div className="doc-meta">
                      <div className="dm-t">{doc.title}</div>
                      <div className="dm-s">{doc.type} - {doc.sem}</div>
                      <div className="dm-h">{doc.onchain ? shortHash(doc.hash) : 'belum dicetak ke ledger'}</div>
                      {canManage && !doc.onchain && (
                        <button className="mini-btn full" onClick={() => onMintDoc(doc.id || doc.hash)}>
                          Mint dokumen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty">
              <Award size={38} />
              <h4>Belum ada dokumen</h4>
              <p>{canManage ? 'Tambahkan sertifikat atau rapor untuk membangun portofolio.' : 'Belum ada dokumen yang diterbitkan sekolah.'}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function pickIcon(doc: DocumentRecord) {
  if (doc.icon === 'code' || doc.title.toLowerCase().includes('coding')) return Code2;
  if (doc.icon === 'award' || doc.type === 'Penghargaan' || doc.title.toLowerCase().includes('juara')) return Award;
  return FileText;
}
