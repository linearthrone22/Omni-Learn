import { useEffect, useState } from 'react';
import { Brain, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { analyzeLearning } from '../lib/analysis';
import { store } from '../lib/store';
import { AcademicRecord, DocumentRecord, User } from '../types';

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

export function AIAssistant({ user, records, docs }: Props) {
  const insight = analyzeLearning(records);
  const verifiedDocs = docs.filter((doc) => doc.onchain).length;
  const verifiedRecords = records.filter((record) => record.onchain).length;
  const TrendIcon = insight.trend === 'down' ? TrendingDown : TrendingUp;
  const [serverAnalysis, setServerAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    store.get<AIAnalysisResult>('ai_analysis_' + user.email).then((cached) => {
      if (cached) setServerAnalysis(cached);
    });
  }, [user.email]);

  const runServerAnalysis = async () => {
    if (!records.length) {
      setError('Tambahkan nilai terlebih dahulu sebelum menjalankan AI server.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records,
          docs,
          userName: user.name,
          userRole: user.role,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'AI server belum siap.');
      }

      setServerAnalysis(payload);
      await store.set('ai_analysis_' + user.email, payload);
    } catch (err: any) {
      setError(err.message || 'AI server belum dapat dihubungi. Rekomendasi lokal tetap tersedia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">AI Learning Assistant</div>
          <h1>Rekomendasi Belajar Personal</h1>
        </div>
        <button className="status-badge" onClick={runServerAnalysis} disabled={isLoading}>
          {isLoading ? <RefreshCw size={16} /> : <Sparkles size={16} />}
          {serverAnalysis ? 'Analisis ulang AI' : 'Jalankan AI Server'}
        </button>
      </div>

      {error && (
        <div className="inline-alert">
          <ShieldCheck size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="ai-hero">
        <div>
          <div className="ai-icon"><Brain size={24} /></div>
          <h2>{user.name.split(' ')[0]}, ini pola belajarmu saat ini.</h2>
          <p>{insight.summary}</p>
        </div>
        <div className="ai-score">
          <span>Rata-rata</span>
          <strong>{insight.average ? insight.average.toFixed(1) : '-'}</strong>
          <small><TrendIcon size={14} /> {insight.trendLabel}</small>
        </div>
      </div>

      <div className="stat-grid compact">
        <div className="stat">
          <div className="st-icon"><TrendingUp size={17} /></div>
          <div className="st-val sm">{insight.strongestSubject}</div>
          <div className="st-lbl">Kekuatan utama</div>
        </div>
        <div className="stat">
          <div className="st-icon amber"><Target size={17} /></div>
          <div className="st-val sm">{insight.focusSubject}</div>
          <div className="st-lbl">Fokus peningkatan</div>
        </div>
        <div className="stat">
          <div className="st-icon emerald"><CheckCircle2 size={17} /></div>
          <div className="st-val">{verifiedRecords}/{records.length}</div>
          <div className="st-lbl">Nilai siap diverifikasi</div>
        </div>
        <div className="stat">
          <div className="st-icon chain"><ShieldCheck size={17} /></div>
          <div className="st-val">{verifiedDocs}/{docs.length}</div>
          <div className="st-lbl">Dokumen on-chain</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Rekomendasi Adaptif</h3>
              <div className="ph-sub">Fallback lokal yang tetap berjalan tanpa API key</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="recommend-list">
              {insight.recommendations.map((item) => (
                <div className="recommend" key={item}>
                  <CheckCircle2 size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Rencana 5 Hari</h3>
              <div className="ph-sub">Target mikro untuk minggu ini</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="plan-list">
              {insight.weeklyPlan.map((item) => (
                <div className="plan-item" key={item.day}>
                  <b>{item.day}</b>
                  <span>{item.task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {serverAnalysis && (
        <div className="panel" style={{ marginTop: '20px' }}>
          <div className="panel-head">
            <div>
              <h3>Analisis AI Server</h3>
              <div className="ph-sub">Hasil dari endpoint Vercel/Express saat GEMINI_API_KEY tersedia</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="server-ai">
              <p>{serverAnalysis.summary}</p>
              <div className="grid-2">
                <div>
                  <h4>Kekuatan</h4>
                  {serverAnalysis.strengths.map((item) => <div className="recommend" key={item}><CheckCircle2 size={16} /><span>{item}</span></div>)}
                </div>
                <div>
                  <h4>Area pengembangan</h4>
                  {serverAnalysis.weaknesses.map((item) => <div className="recommend" key={item}><Target size={16} /><span>{item}</span></div>)}
                </div>
              </div>
              <div className="recommend-list">
                {serverAnalysis.recommendations.map((item) => (
                  <div className="plan-item" key={`${item.subject}-${item.difficulty}`}>
                    <b>{item.subject} - {item.difficulty}</b>
                    <span>{item.actionPlan}</span>
                  </div>
                ))}
              </div>
              <div className="career-list">
                {serverAnalysis.futureCareers.map((career) => <span key={career}>{career}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
