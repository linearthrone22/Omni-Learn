import { Award, Bot, FileBadge2, Link2, Plus, School, ShieldCheck, TrendingUp, Trophy, Users } from 'lucide-react';
import { AcademicRecord, DocumentRecord, StudentSnapshot, User } from '../types';
import { ChartClean } from './ChartClean';

interface Props {
  user: User;
  activeStudent: User;
  studentOptions: User[];
  selectedStudentEmail: string;
  onSelectStudent: (email: string) => void;
  schoolSnapshots: StudentSnapshot[];
  records: AcademicRecord[];
  docs: DocumentRecord[];
  onAddRecord: () => void;
  onSharePortfolio: () => void;
  onNavigate: (view: string) => void;
  canManage: boolean;
}

const roleNotes = {
  siswa: 'Tampilan siswa - melihat progres, portofolio, dan rekomendasi belajar.',
  ortu: 'Tampilan orang tua - pilih anak yang ingin dipantau, lalu cek progres akademik, bukti on-chain, dan rekomendasi AI.',
  admin: 'Tampilan sekolah - pantau seluruh siswa, prestasi, aktivitas akademik, dan validasi ledger.',
};

export function DashboardClean({
  user,
  activeStudent,
  studentOptions,
  selectedStudentEmail,
  onSelectStudent,
  schoolSnapshots,
  records,
  docs,
  onAddRecord,
  onSharePortfolio,
  onNavigate,
  canManage,
}: Props) {
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
          <h1>{user.role === 'admin' ? 'Dashboard Sekolah' : `Halo, ${user.name.split(' ')[0]}`}</h1>
        </div>
        <div className="top-actions">
          {studentOptions.length > 1 && (
            <select className="student-select" value={selectedStudentEmail} onChange={(event) => onSelectStudent(event.target.value)}>
              {studentOptions.map((student) => (
                <option key={student.email} value={student.email}>{student.name} - {student.className || 'Siswa'}</option>
              ))}
            </select>
          )}
          {canManage && <button className="btn-add" onClick={onAddRecord}><Plus size={16} /> Tambah Nilai</button>}
        </div>
      </div>

      <div className="role-note">{roleNotes[user.role]}</div>

      {user.role === 'admin' && (
        <SchoolOverview snapshots={schoolSnapshots} selectedStudent={activeStudent} onSelectStudent={onSelectStudent} />
      )}

      {user.role !== 'siswa' && (
        <div className="student-focus">
          <div>
            <span>Siswa dipantau</span>
            <strong>{activeStudent.name}</strong>
          </div>
          <div>
            <span>Kelas</span>
            <strong>{activeStudent.className || '-'}</strong>
          </div>
          <div>
            <span>Email ledger</span>
            <strong>{activeStudent.email}</strong>
          </div>
        </div>
      )}

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
        <button onClick={onSharePortfolio}><Link2 size={17} /> Salin link portofolio publik</button>
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

function SchoolOverview({
  snapshots,
  selectedStudent,
  onSelectStudent,
}: {
  snapshots: StudentSnapshot[];
  selectedStudent: User;
  onSelectStudent: (email: string) => void;
}) {
  const totalStudents = snapshots.length;
  const allRecords = snapshots.flatMap((snapshot) => snapshot.records);
  const allDocs = snapshots.flatMap((snapshot) => snapshot.docs);
  const schoolAverage = allRecords.length ? allRecords.reduce((sum, record) => sum + record.grade, 0) / allRecords.length : 0;
  const verifiedItems = allRecords.filter((record) => record.onchain).length + allDocs.filter((doc) => doc.onchain).length;
  const pendingItems = allRecords.filter((record) => !record.onchain).length + allDocs.filter((doc) => !doc.onchain).length;
  const topStudents = snapshots
    .map((snapshot) => ({
      ...snapshot,
      average: snapshot.records.length ? snapshot.records.reduce((sum, record) => sum + record.grade, 0) / snapshot.records.length : 0,
      achievements: snapshot.docs.filter((doc) => doc.type !== 'Rapor').length,
      verified: snapshot.records.filter((record) => record.onchain).length + snapshot.docs.filter((doc) => doc.onchain).length,
    }))
    .sort((a, b) => b.average - a.average);
  const recentAchievements = snapshots.flatMap((snapshot) => snapshot.docs.map((doc) => ({ doc, student: snapshot.user }))).slice(0, 5);
  const recentActivities = snapshots
    .flatMap((snapshot) => snapshot.records.map((record) => ({ record, student: snapshot.user })))
    .sort((a, b) => b.record.ts - a.record.ts)
    .slice(0, 6);

  return (
    <div className="school-overview">
      <div className="school-hero">
        <div>
          <div className="school-mark"><School size={19} /> SMA Negeri 1 Jakarta</div>
          <h2>Overview Prestasi & Validasi Akademik Sekolah</h2>
          <p>Ringkasan lintas siswa untuk memantau performa akademik, portofolio, dan kesiapan dokumen terverifikasi.</p>
        </div>
        <div className="school-pulse">
          <span>Prioritas hari ini</span>
          <strong>{pendingItems}</strong>
          <small>item menunggu validasi ledger</small>
        </div>
      </div>

      <div className="school-stat-grid">
        <div><Users size={18} /><span>Total siswa</span><strong>{totalStudents}</strong></div>
        <div><TrendingUp size={18} /><span>Rata-rata sekolah</span><strong>{schoolAverage ? schoolAverage.toFixed(1) : '-'}</strong></div>
        <div><Trophy size={18} /><span>Portofolio prestasi</span><strong>{allDocs.filter((doc) => doc.type !== 'Rapor').length}</strong></div>
        <div><ShieldCheck size={18} /><span>Proof verified</span><strong>{verifiedItems}</strong></div>
      </div>

      <div className="school-grid">
        <div className="panel school-panel">
          <div className="panel-head">
            <div>
              <h3>Leaderboard Akademik</h3>
              <div className="ph-sub">Klik siswa untuk membuka detail operasionalnya</div>
            </div>
          </div>
          <div className="school-list">
            {topStudents.map((snapshot, index) => (
              <button
                className={`school-row ${selectedStudent.email === snapshot.user.email ? 'on' : ''}`}
                key={snapshot.user.email}
                onClick={() => onSelectStudent(snapshot.user.email)}
              >
                <span>#{index + 1}</span>
                <b>{snapshot.user.name}</b>
                <em>{snapshot.user.className || 'Siswa'}</em>
                <strong>{snapshot.average.toFixed(1)}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="panel school-panel">
          <div className="panel-head">
            <div>
              <h3>Prestasi Terbaru</h3>
              <div className="ph-sub">Portofolio yang siap dipakai untuk showcase sekolah</div>
            </div>
          </div>
          <div className="school-achievements">
            {recentAchievements.map(({ doc, student }) => (
              <div key={`${student.email}-${doc.id || doc.hash}`}>
                <Award size={16} />
                <div>
                  <b>{doc.title}</b>
                  <span>{student.name} - {doc.onchain ? 'on-chain' : 'pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel school-panel">
        <div className="panel-head">
          <div>
            <h3>Aktivitas Seluruh Siswa</h3>
            <div className="ph-sub">Nilai terbaru, status hash, dan antrian validasi dari semua siswa</div>
          </div>
        </div>
        <div className="school-activity-grid">
          {recentActivities.map(({ record, student }) => (
            <button className="school-activity" key={`${student.email}-${record.id || record.hash}`} onClick={() => onSelectStudent(student.email)}>
              <span>{student.name}</span>
              <b>{record.subject} - {record.semester}</b>
              <em>{record.grade}</em>
              <strong>{record.onchain ? 'On-chain' : 'Pending'}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
