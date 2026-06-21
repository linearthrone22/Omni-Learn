import { useState } from 'react';
import { Role, User } from '../types';
import { getUsers, store, seedFor } from '../lib/store';

interface Props {
  onLogin: (user: User) => void;
}

export function AuthScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState<Role>('siswa');
  const [err, setErr] = useState('');

  const submitAuth = async () => {
    setErr('');
    const mEmail = email.trim().toLowerCase();
    
    if (!mEmail || !pass) {
      return setErr('Email dan password wajib diisi.');
    }
    
    const users = await getUsers();

    if (mode === 'register') {
      const mName = name.trim();
      if (!mName) return setErr('Nama lengkap wajib diisi.');
      if (users[mEmail]) return setErr('Email sudah terdaftar. Silakan masuk.');
      
      const newUser: User = { name: mName, email: mEmail, pass, role };
      users[mEmail] = newUser;
      await store.set('users', users);
      await seedFor(mEmail, false);
      onLogin(newUser);
    } else {
      if (!users[mEmail] || users[mEmail].pass !== pass) {
        return setErr('Email atau password salah.');
      }
      onLogin(users[mEmail]);
    }
  };

  return (
    <div id="auth-screen">
      <div className="auth-brand">
        <div className="logo-mark"><div className="logo-seal">⬡</div><b>Omni Learn</b></div>
        <div className="auth-hero">
          <div className="eyebrow">Beyond the Horizon · Web3 + AI</div>
          <h1>Rekam jejak akademik yang <em>tak bisa hilang.</em></h1>
          <p>Setiap nilai, rapor, dan prestasi anak dicetak sebagai portofolio digital permanen — terverifikasi, aman, dan siap dibawa hingga dunia kerja.</p>
        </div>
        <div className="auth-points">
          <div className="auth-point"><span className="dot">⛓</span><span>Setiap catatan diberi sidik jari kriptografis untuk dicetak ke blockchain.</span></div>
          <div className="auth-point"><span className="dot">🔒</span><span>Data terenkripsi, immutable, tidak dapat dipalsukan.</span></div>
          <div className="auth-point"><span className="dot">🤖</span><span>AI Assistant menganalisis perkembangan & memberi rekomendasi belajar.</span></div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="tabs">
            <button className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); }}>Masuk</button>
            <button className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr(''); }}>Daftar</button>
          </div>
          
          <h2>{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun Omni Learn'}</h2>
          <p className="sub">{mode === 'login' ? 'Masuk untuk melihat rekam jejak akademik.' : 'Mulai catat perjalanan akademik dengan aman.'}</p>

          {err && <div className="auth-err" style={{ display: 'block' }}>{err}</div>}

          {mode === 'register' && (
            <div className="field">
              <label>Nama Lengkap</label>
              <input placeholder="cth. Andini Pratama" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="nama@sekolah.id" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter') submitAuth(); }}
            />
          </div>
          
          {mode === 'register' && (
            <div className="field">
              <label>Peran</label>
              <div className="role-grid">
                <div className={`role-opt ${role === 'siswa' ? 'on' : ''}`} onClick={() => setRole('siswa')}>
                  <div className="ri">🎓</div><div className="rl">Siswa</div>
                </div>
                <div className={`role-opt ${role === 'ortu' ? 'on' : ''}`} onClick={() => setRole('ortu')}>
                  <div className="ri">👪</div><div className="rl">Orang Tua</div>
                </div>
                <div className={`role-opt ${role === 'admin' ? 'on' : ''}`} onClick={() => setRole('admin')}>
                  <div className="ri">🏫</div><div className="rl">Sekolah</div>
                </div>
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={submitAuth}>
            <span>{mode === 'login' ? 'Masuk' : 'Daftar'}</span> <span>→</span>
          </button>

          <div className="seed-hint">
            <b>Akun demo siap pakai:</b><br />
            Email <code>andini@sekolah.id</code> · Password <code>demo123</code><br />
            Berisi data nilai & dokumen contoh untuk screenshot checkpoint.
          </div>
          <div className="auth-foot">Omni Learn · IT Fair XIV · Hackathon Prototype</div>
        </div>
      </div>
    </div>
  );
}
