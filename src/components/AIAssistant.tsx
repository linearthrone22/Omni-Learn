import { useState, useEffect } from 'react';
import { AcademicRecord, DocumentRecord, User } from '../types';
import { store } from '../lib/store';

interface Props {
  user: User;
  records: AcademicRecord[];
  docs: DocumentRecord[];
}

interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    subject: string;
    actionPlan: string;
    difficulty: string;
  }>;
  futureCareers: string[];
}

const RUNNING_TIPS = [
  "Membaca ledger akademis longitudinal...",
  "Menganalisis kekuatan kognitif & tren nilai...",
  "Mengumpulkan rekam jejak prestasi & sertifikat...",
  "Merancang peta kurikulum belajar adaptif personal...",
  "Mengompilasi opsi penjurusan studi lanjutan..."
];

export function AIAssistant({ user, records, docs }: Props) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [error, setError] = useState('');

  // Load cached analysis on mount if available
  useEffect(() => {
    async function loadCache() {
      const cached = await store.get<AIAnalysisResult>('ai_analysis_' + user.email);
      if (cached) {
        setAnalysis(cached);
      }
    }
    loadCache();
  }, [user.email]);

  // Handle loading text rotations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % RUNNING_TIPS.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const triggerAnalysis = async () => {
    if (records.length === 0) {
      setError("Belum ada data nilai akademis untuk dianalisis. Harap tambahkan nilai di tab 'Rekam Nilai' terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingTextIndex(0);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records,
          docs,
          userName: user.name,
          userRole: user.role
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Terjadi kesalahan saat memanggil asisten AI.");
      }

      const data = await response.json();
      setAnalysis(data);
      await store.set('ai_analysis_' + user.email, data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal terhubung dengan server kecerdasan buatan. Pastikan kunci API Gemini dikonfigurasi dengan benar.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (prio: string) => {
    const p = prio.toLowerCase();
    if (p.includes('sangat') || p.includes('tinggi')) return 'var(--rose)';
    if (p.includes('sedang')) return 'var(--amber)';
    return 'var(--chain)';
  };

  const getPriorityBg = (prio: string) => {
    const p = prio.toLowerCase();
    if (p.includes('sangat') || p.includes('tinggi')) return '#FDECEF';
    if (p.includes('sedang')) return 'var(--amber-soft)';
    return 'var(--chain-soft)';
  };

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">AI Learning Assistant</div>
          <h1>Analisis & Rekomendasi Personal</h1>
        </div>
        {analysis && !isLoading && (
          <button className="btn-add" style={{ background: 'var(--ink)' }} onClick={triggerAnalysis}>
            🔄 Analisis Ulang
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #EF4444', padding: '16px', borderRadius: '12px', color: '#991B1B', marginBottom: '20px', fontSize: '13.5px' }}>
          ⚠️ <strong>Kesalahan Analisis:</strong> {error}
        </div>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <div className="panel" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid #E2E8F0',
            borderTopColor: 'var(--chain)',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '20px', color: 'var(--ink)' }}>Asisten AI Sedang Meracik Rekomendasi</h3>
          <p style={{ color: 'var(--chain)', fontWeight: 600, fontSize: '14px', marginTop: '8px', minHeight: '24px' }}>
            {RUNNING_TIPS[loadingTextIndex]}
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '380px', marginTop: '4px', lineHeight: '1.5' }}>
            Kami menganalisis nilai secara longitudinal dan portofolio anak untuk merancang kurikulum belajar yang paling optimal. Proses ini memakan waktu sekitar 5-10 detik.
          </p>
        </div>
      )}

      {/* Empty State / Trigger Action */}
      {!analysis && !isLoading && (
        <div className="panel" style={{ padding: '50px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🤖</div>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '22px', fontWeight: 600, color: 'var(--ink)' }}>Dapatkan Rencana Belajar Personal</h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)', maxWidth: '520px', margin: '8px auto 20px', lineHeight: '1.6' }}>
            Omni Learn AI Assistant menganalisis transkrip nilai secara longitudinal, menelusuri performa kognitif, mengumpulkan portofolio pencapaian anak, dan merumuskan saran tindakan belajar adaptif secara privat.
          </p>
          <button className="btn-add" style={{ padding: '12px 24px', fontSize: '14.5px', margin: '0 auto', display: 'flex' }} onClick={triggerAnalysis}>
            Mulai Analisis Kecerdasan Buatan →
          </button>
        </div>
      )}

      {/* Analysis Dashboard */}
      {analysis && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Executive Summary panel */}
          <div className="panel" style={{ padding: '24px', background: 'linear-gradient(135deg, #FFF, #FAF8FF)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧠</span> Ringkasan Rekomendasi Akademik
            </h3>
            <div style={{ height: '1px', background: 'var(--line)', margin: '14px 0' }} />
            <p style={{ fontSize: '14.5px', color: 'var(--ink)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {analysis.summary}
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-2">
            <div className="panel" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', margin: 0, fontFamily: 'var(--display)' }}>
                <span>💪</span> Kekuatan Utama
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                {analysis.strengths.map((st, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--emerald)', fontWeight: 'bold' }}>✓</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose)', margin: 0, fontFamily: 'var(--display)' }}>
                <span>⚠️</span> Area Pengembangan (Kelemahan)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                {analysis.weaknesses.map((wk, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--rose)', fontWeight: 'bold' }}>•</span>
                    <span>{wk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable recommendations table */}
          <div className="panel">
            <div className="panel-head" style={{ paddingBottom: '14px' }}>
              <div>
                <h3>Rencana Tindakan Belajar Adaptif</h3>
                <div className="ph-sub">Panduan khusus materi dan langkah taktis belajar mandiri anak Anda</div>
              </div>
            </div>
            
            <div className="panel-body" style={{ padding: '0 20px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} style={{ border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', background: '#FFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                        📚 Bidang: {rec.subject}
                      </h4>
                      <span className="pill-ok" style={{ 
                        fontSize: '11px', 
                        color: getPriorityColor(rec.difficulty), 
                        background: getPriorityBg(rec.difficulty) 
                      }}>
                        Rekomendasi: {rec.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', lineHeight: '1.6' }}>
                      {rec.actionPlan}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Future Careers & Suggestions */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, fontFamily: 'var(--display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀</span> Saran Jalur Karir & Studi Lanjutan
            </h3>
            <p className="ph-sub" style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Disusun berdasarkan performa longitudinal, minat, dan portofolio anak Anda</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '16px' }}>
              {analysis.futureCareers.map((car, i) => (
                <div key={i} style={{ background: 'var(--chain-soft)', border: '1px solid #D6E2FF', color: 'var(--chain)', padding: '14px 16px', borderRadius: '10px', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>✨</span>
                  <span>{car}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
