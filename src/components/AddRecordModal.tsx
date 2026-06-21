import { useState, useEffect } from 'react';
import { sha256 } from '../lib/crypto';
import { User } from '../types';

interface Props {
  user: User;
  onClose: () => void;
  onSave: (record: { subject: string; semester: string; grade: number; note: string; hash: string }) => void;
}

export function AddRecordModal({ user, onClose, onSave }: Props) {
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [grade, setGrade] = useState('');
  const [note, setNote] = useState('');
  const [hash, setHash] = useState('Isi data untuk membuat sidik jari…');

  useEffect(() => {
    async function updateHash() {
      if (!subject || grade === '') {
        setHash('Isi mata pelajaran & nilai untuk membuat sidik jari…');
        return;
      }
      const payload = `${user.email}|${subject}|${semester}|${grade}|${note}|${new Date().toDateString()}`;
      setHash(await sha256(payload));
    }
    updateHash();
  }, [subject, semester, grade, note, user.email]);

  const handleSave = async () => {
    const s = subject.trim();
    const g = parseInt(grade);
    const n = note.trim();
    if (!s || isNaN(g)) {
      alert('Lengkapi mata pelajaran & nilai');
      return;
    }
    if (g < 0 || g > 100) {
      alert('Nilai harus 0–100');
      return;
    }
    
    // Hash based on current timestamp to make it unique per save as in original logic
    const finalHash = await sha256(`${user.email}|${s}|${semester}|${g}|${n}|${Date.now()}`);
    onSave({ subject: s, semester, grade: g, note: n, hash: finalHash });
  };

  return (
    <div className="modal-bg on">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3>Tambah Catatan Nilai</h3>
            <p>Setiap catatan akan diberi sidik jari kriptografis.</p>
          </div>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Mata Pelajaran</label>
            <input 
              placeholder="cth. Matematika" 
              value={subject}
              onChange={e => setSubject(e.target.value)} 
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Semester</label>
              <select value={semester} onChange={e => setSemester(e.target.value)}>
                <option>Semester 1</option>
                <option>Semester 2</option>
                <option>Semester 3</option>
                <option>Semester 4</option>
                <option>Semester 5</option>
                <option>Semester 6</option>
              </select>
            </div>
            <div className="field">
              <label>Nilai (0–100)</label>
              <input 
                type="number" 
                min="0" max="100" 
                placeholder="0" 
                value={grade}
                onChange={e => setGrade(e.target.value)} 
              />
            </div>
          </div>
          <div className="field">
            <label>Catatan Guru (opsional)</label>
            <input 
              placeholder="cth. Konsisten meningkat" 
              value={note}
              onChange={e => setNote(e.target.value)} 
            />
          </div>

          <div className="fingerprint">
            <div className="fp-label">⛓ Sidik jari kriptografis (SHA-256) <span className="chain-tag">PREVIEW</span></div>
            <div className="fp-hash">{hash}</div>
            <div className="fp-foot">Hash ini yang akan dicetak ke blockchain pada Phase 2 — menjamin catatan tak dapat diubah.</div>
          </div>

          <button className="btn-primary" style={{ marginTop: '18px' }} onClick={handleSave}>
            Simpan & Cetak Sidik Jari →
          </button>
        </div>
      </div>
    </div>
  );
}
