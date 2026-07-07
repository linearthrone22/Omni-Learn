import { Award, Bot, FileBadge2, Plus, ShieldCheck, TrendingUp } from 'lucide-react';
import { AcademicRecord, DocumentRecord, User } from '../types';
import { ChartClean } from './ChartClean';

interface Props {
  user: User;
  records: AcademicRecord[];
  docs: DocumentRecord[];
  onAddRecord: () => void;
  onNavigate: (view: string) => void;
}

const roleNotes = {
  siswa: 'Tampilan siswa - melihat progres, portofolio, dan rekomendasi belajar.',
  ortu: 'Tampilan orang tua - memantau perkembangan dan bukti akademik anak.',
  admin: 'Tampilan sekolah - mengelola catatan nilai dan dokumen siswa.',
};

export function DashboardClean({ user, records, docs, onAddRecord, onNavigate }: Props) {
  const avg = records.length ? records.reduce((sum, record) => sum + record.grade, 0) / records.length : 0;
  const onchainRecords = records.filter((record) => record.onchain).length;
  const onchainDocs = docs.filter((doc) => doc.onchain).length;
  const subjectsCount = new Set(records.map((record) => record.subject)).size;
  const acts = [...records].sort((a, b) => b.ts - a.ts).slice(0, 5);

  const gradeClass = (grade: number) => grade >= 85 ? 'g-a' : grade >= 75 ? 'g-b' : grade >= 65 ? 'g-c' : 'g-d';
  const timeAgo = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 86400000);
    if (diff <= 0) return 'hari ini';
    if (diff === 1) return 'kemarin';
    return `${diff} hari lalu`;
  };

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">Ringkasan Akademik</div>
          <h1>Halo, {user.name.split(' ')[0]}</h1>
        </div>
        <button className="btn-add" onClick={onAddRecord}><Plus size={16} /> Tambah Nilai</button>
      </div>

      <div className="role-note">{roleNotes[user.role]}</div>

      <div className="stat-grid">
        <div className="stat">
          <div className="st-icon chain"><TrendingUp size={17} /></div>
          <div className="st-val">{avg ? avg.toFixed(1) : '-'}</div>
          <div className="st-lbl">Rata-rata nilai</div>
          <div className="st-delta up">{records.length ? `${records.length} catatan aktif` : 'Belum ada data'}</div>
        </div>
        <div className="stat">
          <div className="st-icon emerald"><ShieldCheck size={17} /></div>
          <div className="st-val">{onchainRecords}/{records.length}</div>
          <div className="st-lbl">Nilai on-chain</div>
          <div className="st-delta up">{records.length ? `${Math.round((onchainRecords / records.length) * 100)}% terverifikasi` : 'Menunggu input'}</div>
        </div>
        <div className="stat">
          <div className="st-icon"><FileBadge2 size={17} /></div>
          <div className="st-val">{subjectsCount}</div>
          <div className="st-lbl">Mata pelajaran</div>
          <div className="st-delta up">dipantau per semester</div>
        </div>
        <div className="stat">
          <div className="st-icon amber"><Award size={17} /></div>
          <div className="st-val">{docs.length}</div>
          <div className="st-lbl">Dokumen portofolio</div>
          <div className="st-delta up">{onchainDocs} sudah terverifikasi</div>
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={() => onNavigate('chain')}><ShieldCheck size={17} /> Verifikasi hash ke ledger</button>
        <button onClick={() => onNavigate('ai')}><Bot size={17} /> Buka AI Assistant</button>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Tren Nilai Rata-rata</h3>
              <div className="ph-sub">Perkembangan akademik per semester</div>
            </div>
          </div>
          <div className="chart-wrap">
            <ChartClean records={records} />
          </div>
          <div className="chart-legend">
            <span><i style={{ background: 'var(--chain)' }}></i>Rata-rata nilai</span>
            <span><i style={{ background: 'var(--emerald)' }}></i>Semester fully verified</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Aktivitas Terbaru</h3>
              <div className="ph-sub">Catatan dan verifikasi</div>
            </div>
          </div>
          <div className="panel-body">
            {acts.length ? acts.map((record) => (
              <div className="act" key={record.id || record.hash}>
                <div className={`ai ${record.onchain ? 'ok' : 'pending'}`}>
                  {record.onchain ? <ShieldCheck size={15} /> : <FileBadge2 size={15} />}
                </div>
                <div>
                  <div className="at">
                    Nilai <b>{record.subject}</b> - {record.semester}{' '}
                    <span className={`grade-pill ${gradeClass(record.grade)}`} style={{ fontSize: '11px', padding: '1px 7px', minWidth: 0 }}>{record.grade}</span>
                  </div>
                  <div className="am">{record.onchain ? 'tercatat on-chain' : 'menunggu verifikasi'} - {timeAgo(record.ts)}</div>
                </div>
              </div>
            )) : (
              <div className="empty">
                <FileBadge2 size={38} />
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
