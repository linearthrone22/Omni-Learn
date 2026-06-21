import { DocumentRecord } from '../types';

interface Props {
  docs: DocumentRecord[];
  onAddDoc: () => void;
}

export function Documents({ docs, onAddDoc }: Props) {
  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Portofolio</div>
          <h1>Prestasi & Dokumen</h1>
        </div>
        <button className="btn-add" onClick={onAddDoc}>＋ Tambah Dokumen</button>
      </div>
      <div className="panel">
        <div className="panel-body">
          {docs.length ? (
            <div className="doc-grid">
              {docs.map((d, i) => (
                <div className="doc-card" key={i}>
                  <div className="doc-thumb">
                    {d.icon || '📄'}
                    {d.onchain && <div className="doc-seal">✓</div>}
                  </div>
                  <div className="doc-meta">
                    <div className="dm-t">{d.title}</div>
                    <div className="dm-s">{d.type} · {d.sem}</div>
                    <div className="dm-h">{d.onchain ? '⛓ ' + d.hash : '⏳ belum dicetak'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="ei">🎖</div>
              <h4>Belum ada dokumen</h4>
              <p>Tambahkan sertifikat atau rapor untuk membangun portofolio.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
