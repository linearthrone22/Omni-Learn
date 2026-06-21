import { AcademicRecord } from '../types';

interface Props {
  records: AcademicRecord[];
  onAddRecord: () => void;
}

export function Records({ records, onAddRecord }: Props) {
  const sorted = [...records].sort((a, b) => b.ts - a.ts);
  const gradeClass = (g: number) => g >= 85 ? 'g-a' : g >= 75 ? 'g-b' : g >= 65 ? 'g-c' : 'g-d';

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Rekam Jejak</div>
          <h1>Rekam Nilai</h1>
        </div>
        <button className="btn-add" onClick={onAddRecord}>＋ Tambah Nilai</button>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Seluruh Catatan Nilai</h3>
            <div className="ph-sub">{sorted.length} catatan · {sorted.filter(r => r.onchain).length} tercetak on-chain</div>
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
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span className="subj">{r.subject}</span>
                      {r.note && <div style={{ fontSize: '11.5px', color: 'var(--muted-2)', marginTop: '2px' }}>{r.note}</div>}
                    </td>
                    <td>{r.semester}</td>
                    <td><span className={`grade-pill ${gradeClass(r.grade)}`}>{r.grade}</span></td>
                    <td><span className="hash">{r.hash.slice(0, 16)}…</span></td>
                    <td>
                      {r.onchain ? (
                        <span className="pill-ok">⛓ On-chain</span>
                      ) : (
                        <span className="chain-tag">⏳ Menunggu Phase 2</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">
              <div className="ei">📑</div>
              <h4>Belum ada catatan nilai</h4>
              <p>Klik “Tambah Nilai” untuk mencatat nilai pertama.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
