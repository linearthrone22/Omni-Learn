import { useState } from 'react';
import { ArrowRight, Bot, GraduationCap, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { Role, User } from '../types';
import { getUsers, seedFor, store } from '../lib/store';

interface Props {
  onLogin: (user: User) => void;
}

const roleOptions: { value: Role; label: string; icon: typeof GraduationCap }[] = [
  { value: 'siswa', label: 'Siswa', icon: GraduationCap },
  { value: 'ortu', label: 'Orang Tua', icon: Users },
  { value: 'admin', label: 'Sekolah', icon: ShieldCheck },
];

export function AuthScreenClean({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState<Role>('siswa');
  const [err, setErr] = useState('');

  const submitAuth = async () => {
    setErr('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      setErr('Email dan password wajib diisi.');
      return;
    }

    const users = await getUsers();
    if (mode === 'register') {
      const cleanName = name.trim();
      if (!cleanName) {
        setErr('Nama lengkap wajib diisi.');
        return;
      }
      if (users[cleanEmail]) {
        setErr('Email sudah terdaftar. Silakan masuk.');
        return;
      }
      const newUser: User = { name: cleanName, email: cleanEmail, pass, role };
      users[cleanEmail] = newUser;
      await store.set('users', users);
      await seedFor(cleanEmail, false);
      onLogin(newUser);
      return;
    }

    if (!users[cleanEmail] || users[cleanEmail].pass !== pass) {
      setErr('Email atau password salah.');
      return;
    }
    onLogin(users[cleanEmail]);
  };

  return (
    <div id="auth-screen">
      <div className="auth-brand">
        <div className="logo-mark">
          <div className="logo-seal"><GraduationCap size={20} /></div>
          <b>Omni Learn</b>
        </div>

        <div className="auth-hero">
          <div className="eyebrow">Future Education - Web3 + AI</div>
          <h1>Rekam jejak akademik yang <em>aman, permanen, dan personal.</em></h1>
          <p>
            Nilai, rapor, sertifikat, dan prestasi siswa tersimpan sebagai portofolio digital
            dengan sidik jari kriptografis dan rekomendasi belajar adaptif.
          </p>
        </div>

        <div className="auth-points">
          <div className="auth-point"><span className="dot"><ShieldCheck size={13} /></span><span>SHA-256 fingerprint untuk setiap catatan akademik.</span></div>
          <div className="auth-point"><span className="dot"><LockKeyhole size={13} /></span><span>Ledger simulasi untuk status on-chain dan bukti publik.</span></div>
          <div className="auth-point"><span className="dot"><Bot size={13} /></span><span>AI Assistant lokal membaca pola belajar tanpa mengirim data keluar.</span></div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="tabs">
            <button className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); }}>Masuk</button>
            <button className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr(''); }}>Daftar</button>
          </div>

          <h2>{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun Omni Learn'}</h2>
          <p className="sub">{mode === 'login' ? 'Masuk untuk melihat rekam jejak akademik.' : 'Pilih peran dan mulai bangun portofolio akademik.'}</p>

          {err && <div className="auth-err" style={{ display: 'block' }}>{err}</div>}

          {mode === 'register' && (
            <div className="field">
              <label>Nama Lengkap</label>
              <input placeholder="cth. Andini Pratama" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="nama@sekolah.id" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="minimal 6 karakter"
              value={pass}
              onChange={(event) => setPass(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') submitAuth(); }}
            />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label>Peran</label>
              <div className="role-grid">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      type="button"
                      className={`role-opt ${role === option.value ? 'on' : ''}`}
                      onClick={() => setRole(option.value)}
                      key={option.value}
                    >
                      <div className="ri"><Icon size={18} /></div>
                      <div className="rl">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={submitAuth}>
            <span>{mode === 'login' ? 'Masuk' : 'Daftar'}</span> <ArrowRight size={16} />
          </button>

          <div className="seed-hint">
            <b>Akun demo siap pakai:</b><br />
            Siswa <code>andini@sekolah.id</code> - <code>demo123</code><br />
            Orang tua <code>ortu@sekolah.id</code> - <code>demo123</code> (pilih Andini/Raka)<br />
            Sekolah <code>sekolah@sekolah.id</code> - <code>demo123</code> (overview semua siswa)
          </div>
          <div className="auth-foot">Cygnus Team - IT Fair XIV Hackathon Prototype</div>
        </div>
      </div>
    </div>
  );
}
