import { useEffect, useState } from 'react';
import { Save, ShieldCheck, X } from 'lucide-react';
import { makeId, sha256 } from '../lib/crypto';
import { User } from '../types';

interface Props {
  user: User;
  onClose: () => void;
  onSave: (record: { id: string; subject: string; semester: string; grade: number; note: string; hash: string }) => void;
}

export function AddRecordModalClean({ user, onClose, onSave }: Props) {
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [grade, setGrade] = useState('');
  const [note, setNote] = useState('');
  const [hash, setHash] = useState('Isi data untuk membuat sidik jari.');

  useEffect(() => {
    let active = true;
    async function updateHash() {
      if (!subject || grade === '') {
        setHash('Isi mata pelajaran dan nilai untuk membuat sidik jari.');
        return;
      }
      const payload = `${user.email}|${subject}|${semester}|${grade}|${note}|preview`;
      const nextHash = await sha256(payload);
      if (active) setHash(nextHash);
    }
    updateHash();
    return () => {
      active = false;
    };
  }, [subject, semester, grade, note, user.email]);

  const handleSave = async () => {
    const cleanSubject = subject.trim();
    const parsedGrade = Number.parseInt(grade, 10);
    const cleanNote = note.trim();
    if (!cleanSubject || Number.isNaN(parsedGrade)) {
      alert('Lengkapi mata pelajaran dan nilai.');
      return;
    }
    if (parsedGrade < 0 || parsedGrade > 100) {
      alert('Nilai harus berada di rentang 0-100.');
      return;
    }

    const id = makeId('rec');
    const finalHash = await sha256(`${user.email}|${cleanSubject}|${semester}|${parsedGrade}|${cleanNote}|${Date.now()}`);
    onSave({ id, subject: cleanSubject, semester, grade: parsedGrade, note: cleanNote, hash: finalHash });
  };

  return (
    <div className="modal-bg on">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3>Tambah Catatan Nilai</h3>
            <p>Setiap catatan diberi sidik jari SHA-256 sebelum masuk ledger.</p>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Mata Pelajaran</label>
            <input placeholder="cth. Matematika" value={subject} onChange={(event) => setSubject(event.target.value)} />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Semester</label>
              <select value={semester} onChange={(event) => setSemester(event.target.value)}>
                <option>Semester 1</option>
                <option>Semester 2</option>
                <option>Semester 3</option>
                <option>Semester 4</option>
                <option>Semester 5</option>
                <option>Semester 6</option>
              </select>
            </div>
            <div className="field">
              <label>Nilai (0-100)</label>
              <input type="number" min="0" max="100" placeholder="0" value={grade} onChange={(event) => setGrade(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Catatan Guru (opsional)</label>
            <input placeholder="cth. Konsisten meningkat" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>

          <div className="fingerprint">
            <div className="fp-label"><ShieldCheck size={14} /> Sidik jari kriptografis <span className="chain-tag">PREVIEW</span></div>
            <div className="fp-hash">{hash}</div>
            <div className="fp-foot">Hash ini menjadi bukti data tidak berubah saat diverifikasi ke ledger.</div>
          </div>

          <button className="btn-primary" style={{ marginTop: '18px' }} onClick={handleSave}>
            <Save size={17} /> Simpan Catatan
          </button>
        </div>
      </div>
    </div>
  );
}
