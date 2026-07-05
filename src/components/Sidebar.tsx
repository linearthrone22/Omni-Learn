import { User } from '../types';

interface Props {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Sidebar({ user, currentView, onNavigate, onLogout }: Props) {
  const ROLE_META = {
    siswa: { label: 'Siswa', icon: '🎓', note: '🎓 Tampilan untuk Siswa' },
    ortu: { label: 'Orang Tua', icon: '👪', note: '👪 Tampilan untuk Orang Tua — memantau anak' },
    admin: { label: 'Admin Sekolah', icon: '🏫', note: '🏫 Tampilan untuk Sekolah — kelola data siswa' }
  };

  const navClass = (v: string) => `nav-item ${currentView === v ? 'on' : ''}`;

  return (
    <aside className="sidebar">
      <div className="logo-mark"><div className="logo-seal">⬡</div><b>Omni Learn</b></div>
      
      <div className="nav-label">Menu</div>
      <button className={navClass('dashboard')} onClick={() => onNavigate('dashboard')}><span className="ni">▦</span> Dashboard</button>
      <button className={navClass('records')} onClick={() => onNavigate('records')}><span className="ni">📑</span> Rekam Nilai</button>
      <button className={navClass('documents')} onClick={() => onNavigate('documents')}><span className="ni">🎖</span> Prestasi & Dokumen</button>
      
      <div className="nav-label">Fitur Cerdas (Phase 2–3)</div>
      <button className={navClass('chain')} onClick={() => onNavigate('chain')}><span className="ni">⛓</span> Verifikasi Chain</button>
      <button className={navClass('ai')} onClick={() => onNavigate('ai')}><span className="ni">🤖</span> AI Assistant</button>
      
      <div className="sidebar-user">
        <div className="avatar">{user.name[0].toUpperCase()}</div>
        <div>
          <div className="su-name">{user.name}</div>
          <div className="su-role">{ROLE_META[user.role].label}</div>
        </div>
        <button className="logout" onClick={onLogout} title="Keluar">⏻</button>
      </div>
    </aside>
  );
}
