import { useState } from 'react';
import { Award, FileText, X } from 'lucide-react';
import { sha256 } from '../lib/crypto';
import { DocumentRecord, User } from '../types';

interface Props {
  user: User;
  onClose: () => void;
  onSave: (doc: DocumentRecord) => void;
}

export function AddDocumentModal({ user, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Sertifikat');
  const [sem, setSem] = useState('Semester 1');

  const submit = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      alert('Nama dokumen wajib diisi.');
      return;
    }

    const hash = await sha256(`${user.email}|${cleanTitle}|${type}|${sem}|${Date.now()}`);
    onSave({
      id: `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      title: cleanTitle,
      type,
      sem,
      hash,
      onchain: false,
      icon: type === 'Penghargaan' ? 'award' : 'file',
    });
  };

  return (
    <div className="modal-bg on">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3>Tambah Dokumen</h3>
            <p>Sertifikat, rapor, atau penghargaan akan diberi hash unik.</p>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Nama Dokumen</label>
            <input
              placeholder="cth. Juara 1 Lomba Sains"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Jenis</label>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option>Sertifikat</option>
                <option>Rapor</option>
                <option>Penghargaan</option>
                <option>Portofolio</option>
              </select>
            </div>
            <div className="field">
              <label>Semester</label>
              <select value={sem} onChange={(event) => setSem(event.target.value)}>
                <option>Semester 1</option>
                <option>Semester 2</option>
                <option>Semester 3</option>
                <option>Semester 4</option>
                <option>Semester 5</option>
                <option>Semester 6</option>
              </select>
            </div>
          </div>

          <div className="fingerprint">
            <div className="fp-label">
              <FileText size={14} /> Metadata portofolio
            </div>
            <div className="fp-foot">
              Hash SHA-256 dibuat saat dokumen disimpan, lalu bisa dimint ke ledger simulasi.
            </div>
          </div>

          <button className="btn-primary" style={{ marginTop: '18px' }} onClick={submit}>
            <Award size={17} /> Simpan Dokumen
          </button>
        </div>
      </div>
    </div>
  );
}
