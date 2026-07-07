import { BarChart3, Bot, FileBadge2, GraduationCap, LogOut, ShieldCheck, TableProperties } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const roleLabels = {
  siswa: 'Siswa',
  ortu: 'Orang Tua',
  admin: 'Admin Sekolah',
};

export function AppSidebar({ user, currentView, onNavigate, onLogout }: Props) {
  const navClass = (view: string) => `nav-item ${currentView === view ? 'on' : ''}`;

  return (
    <aside className="sidebar">
      <div className="logo-mark">
        <div className="logo-seal"><GraduationCap size={19} /></div>
        <b>Omni Learn</b>
      </div>

      <div className="nav-label">Menu</div>
      <button className={navClass('dashboard')} onClick={() => onNavigate('dashboard')}>
        <span className="ni"><BarChart3 size={17} /></span> Dashboard
      </button>
      <button className={navClass('records')} onClick={() => onNavigate('records')}>
        <span className="ni"><TableProperties size={17} /></span> Rekam Nilai
      </button>
      <button className={navClass('documents')} onClick={() => onNavigate('documents')}>
        <span className="ni"><FileBadge2 size={17} /></span> Portofolio
      </button>

      <div className="nav-label">Phase 2-3</div>
      <button className={navClass('chain')} onClick={() => onNavigate('chain')}>
        <span className="ni"><ShieldCheck size={17} /></span> Verifikasi Chain
      </button>
      <button className={navClass('ai')} onClick={() => onNavigate('ai')}>
        <span className="ni"><Bot size={17} /></span> AI Assistant
      </button>

      <div className="sidebar-user">
        <div className="avatar">{user.name[0].toUpperCase()}</div>
        <div>
          <div className="su-name">{user.name}</div>
          <div className="su-role">{roleLabels[user.role]}</div>
        </div>
        <button className="logout" onClick={onLogout} title="Keluar" aria-label="Keluar">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
