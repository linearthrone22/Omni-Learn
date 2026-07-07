import { ArrowLeft, Download, GraduationCap, QrCode, ShieldCheck } from 'lucide-react';
import { AcademicRecord, DocumentRecord } from '../types';
import { shortHash } from '../lib/crypto';

interface Props {
  email: string;
  name: string;
  records: AcademicRecord[];
  docs: DocumentRecord[];
  onBack: () => void;
}

export function PublicPortfolio({ email, name, records, docs, onBack }: Props) {
  const average = records.length ? records.reduce((sum, record) => sum + record.grade, 0) / records.length : 0;
  const verifiedRecords = records.filter((record) => record.onchain).length;
  const verifiedDocs = docs.filter((doc) => doc.onchain).length;
  const shareUrl = window.location.href;

  return (
    <div className="public-profile">
      <div className="public-toolbar no-print">
        <button className="link-btn" onClick={onBack}><ArrowLeft size={15} /> Masuk aplikasi</button>
        <button className="btn-secondary" onClick={() => window.print()}><Download size={15} /> Simpan PDF</button>
      </div>

      <section className="public-sheet">
        <div className="public-head">
          <div>
            <div className="public-brand"><GraduationCap size={18} /> Omni Learn Web3 Ledger</div>
            <h1>Transkrip & Portofolio Akademik</h1>
            <p>{name} - {email}</p>
          </div>
          <div className="public-qr">
            <QrCode size={50} />
            <span>{shortHash(shareUrl, 12)}</span>
          </div>
        </div>

        <div className="chain-summary public">
          <div>
            <span>Rata-rata nilai</span>
            <strong>{average ? average.toFixed(1) : '-'}</strong>
            <small>{records.length} catatan akademik</small>
          </div>
          <div>
            <span>Nilai verified</span>
            <strong>{verifiedRecords}/{records.length}</strong>
            <small>tercatat di ledger simulasi</small>
          </div>
          <div>
            <span>Dokumen verified</span>
            <strong>{verifiedDocs}/{docs.length}</strong>
            <small>sertifikat dan rapor</small>
          </div>
        </div>

        <h2>Rekam Nilai</h2>
        <table className="rec-table public-table">
          <thead>
            <tr>
              <th>Mata Pelajaran</th>
              <th>Semester</th>
              <th>Nilai</th>
              <th>Hash</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id || record.hash}>
                <td><span className="subj">{record.subject}</span></td>
                <td>{record.semester}</td>
                <td>{record.grade}</td>
                <td><span className="hash">{shortHash(record.hash)}</span></td>
                <td>{record.onchain ? <span className="pill-ok"><ShieldCheck size={13} /> On-chain</span> : <span className="chain-tag">Local</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Prestasi & Dokumen</h2>
        <div className="doc-grid public-docs">
          {docs.map((doc) => (
            <div className="doc-card" key={doc.id || doc.hash}>
              <div className="doc-meta">
                <div className="dm-t">{doc.title}</div>
                <div className="dm-s">{doc.type} - {doc.sem}</div>
                <div className="dm-h">{shortHash(doc.hash)}</div>
              </div>
            </div>
          ))}
        </div>

        <footer className="proof-foot">
          <ShieldCheck size={16} />
          Dokumen ini adalah public portfolio prototype Omni Learn dengan hash akademik terverifikasi.
        </footer>
      </section>
    </div>
  );
}
