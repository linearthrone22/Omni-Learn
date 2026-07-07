import { Plus, ShieldCheck } from 'lucide-react';
import { shortHash } from '../lib/crypto';
import { AcademicRecord } from '../types';

interface Props {
  records: AcademicRecord[];
  onAddRecord: () => void;
  onMintRecord: (id: string) => void;
}

export function RecordsClean({ records, onAddRecord, onMintRecord }: Props) {
  const sorted = [...records].sort((a, b) => b.ts - a.ts);
  const gradeClass = (grade: number) => grade >= 85 ? 'g-a' : grade >= 75 ? 'g-b' : grade >= 65 ? 'g-c' : 'g-d';

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Rekam Jejak</div>
          <h1>Rekam Nilai</h1>
        </div>
        <button className="btn-add" onClick={onAddRecord}><Plus size={16} /> Tambah Nilai</button>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Seluruh Catatan Nilai</h3>
            <div className="ph-sub">{sorted.length} catatan - {sorted.filter((record) => record.onchain).length} tercatat on-chain</div>
          </div>
        </div>
        <div className="panel-body" style={{ padding: '18px 6px 6px' }}>
          {sorted.length ? (
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Mata Pelajaran</th>
                  <th>Semester</th>
                  <th>Nilai</th>
                  <th>Sidik Jari</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((record) => (
                  <tr key={record.id || record.hash}>
                    <td>
                      <span className="subj">{record.subject}</span>
                      {record.note && <div className="cell-note">{record.note}</div>}
                    </td>
                    <td>{record.semester}</td>
                    <td><span className={`grade-pill ${gradeClass(record.grade)}`}>{record.grade}</span></td>
                    <td><span className="hash">{shortHash(record.hash)}</span></td>
                    <td>
                      {record.onchain ? (
                        <span className="pill-ok"><ShieldCheck size={13} /> On-chain</span>
                      ) : (
                        <span className="chain-tag">Pending mint</span>
                      )}
                    </td>
                    <td>
                      {!record.onchain && (
                        <button className="mini-btn" onClick={() => onMintRecord(record.id || record.hash)}>
                          Mint
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">
              <ShieldCheck size={38} />
              <h4>Belum ada catatan nilai</h4>
              <p>Klik Tambah Nilai untuk mencatat nilai pertama.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
