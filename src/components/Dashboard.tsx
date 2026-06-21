import { AcademicRecord, DocumentRecord, User } from '../types';
import { Chart } from './Chart';

interface Props {
  user: User;
  records: AcademicRecord[];
  docs: DocumentRecord[];
  onAddRecord: () => void;
}

export function Dashboard({ user, records, docs, onAddRecord }: Props) {
  const avg = records.length ? records.reduce((s, r) => s + r.grade, 0) / records.length : 0;
  const onchain = records.filter(draft => draft.onchain).length;
  const subjectsStr = new Set(records.map(r => r.subject)).size;

  const acts = [...records].sort((a, b) => b.ts - a.ts).slice(0, 5);

  const gradeClass = (g: number) => g >= 85 ? 'g-a' : g >= 75 ? 'g-b' : g >= 65 ? 'g-c' : 'g-d';
  
  const timeAgo = (ts: number) => {
    const d = Math.floor((Date.now() - ts) / 86400000);
    if (d <= 0) return 'hari ini';
    if (d === 1) return 'kemarin';
    return d + ' hari lalu';
  };

  const ROLE_META = {
    siswa: { label: 'Siswa', icon: '🎓', note: '🎓 Tampilan untuk Siswa' },
    ortu: { label: 'Orang Tua', icon: '👪', note: '👪 Tampilan untuk Orang Tua — memantau anak' },
    admin: { label: 'Admin Sekolah', icon: '🏫', note: '🏫 Tampilan untuk Sekolah — kelola data siswa' }
  };

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Ringkasan Akademik</div>
          <h1>Halo, {user.name.split(' ')[0]} 👋</h1>
        </div>
        <button className="btn-add" onClick={onAddRecord}>＋ Tambah Nilai</button>
      </div>
      <div className="role-note">{ROLE_META[user.role].note}</div>

      <div className="stat-grid">
        <div className="stat">
          <div className="st-icon" style={{ background: 'var(--chain-soft)', color: 'var(--chain)' }}>📊</div>
          <div className="st-val">{avg.toFixed(1)}</div>
          <div className="st-lbl">Rata-rata nilai</div>
          <div className="st-delta up">▲ {records.length ? '+' + (avg - 78 > 0 ? (avg - 78).toFixed(1) : '0') + ' dari awal' : '—'}</div>
        </div>
        
        <div className="stat">
          <div className="st-icon" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)' }}>⛓</div>
          <div className="st-val">{onchain}/{records.length}</div>
          <div className="st-lbl">Tercatat on-chain</div>
          <div className="st-delta up">▲ {records.length ? Math.round(onchain / records.length * 100) + '% terverifikasi' : '—'}</div>
        </div>

        <div className="stat">
          <div className="st-icon" style={{ background: '#F3EAFE', color: '#7C3AED' }}>📚</div>
          <div className="st-val">{subjectsStr}</div>
          <div className="st-lbl">Mata pelajaran</div>
          <div className="st-delta up">▲ aktif dipantau</div>
        </div>

        <div className="stat">
          <div className="st-icon" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>🎖</div>
          <div className="st-val">{docs.length}</div>
          <div className="st-lbl">Dokumen prestasi</div>
          <div className="st-delta up">▲ {docs.filter(d => d.onchain).length} terverifikasi</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Tren Nilai Rata-rata</h3>
              <div className="ph-sub">Perkembangan per semester</div>
            </div>
          </div>
          <div className="chart-wrap">
            <Chart records={records} />
          </div>
          <div className="chart-legend">
            <span><i style={{ background: 'var(--chain)' }}></i>Rata-rata nilai</span>
            <span><i style={{ background: 'var(--emerald)' }}></i>Tercatat on-chain</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Aktivitas Terbaru</h3>
              <div className="ph-sub">Catatan & verifikasi</div>
            </div>
          </div>
          <div className="panel-body">
            {acts.length > 0 ? acts.map((r, i) => (
              <div className="act" key={i}>
                <div className="ai" style={{ background: r.onchain ? 'var(--emerald-soft)' : 'var(--amber-soft)', color: r.onchain ? 'var(--emerald)' : 'var(--amber)' }}>
                  {r.onchain ? '⛓' : '⏳'}
                </div>
                <div>
                  <div className="at">Nilai <b>{r.subject}</b> · {r.semester} <span className={`grade-pill ${gradeClass(r.grade)}`} style={{ fontSize: '11px', padding: '1px 7px', minWidth: 0 }}>{r.grade}</span></div>
                  <div className="am">{r.onchain ? 'tercetak on-chain' : 'menunggu verifikasi'} · {timeAgo(r.ts)}</div>
                </div>
              </div>
            )) : (
              <div className="empty">
                <div className="ei">🗂</div>
                <h4>Belum ada aktivitas</h4>
                <p>Tambahkan nilai pertama untuk memulai rekam jejak.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
