import { Brain, CheckCircle2, ShieldCheck, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { analyzeLearning } from '../lib/analysis';
import { AcademicRecord, DocumentRecord, User } from '../types';

interface Props {
  user: User;
  records: AcademicRecord[];
  docs: DocumentRecord[];
}

export function AIAssistant({ user, records, docs }: Props) {
  const insight = analyzeLearning(records);
  const verifiedDocs = docs.filter((doc) => doc.onchain).length;
  const verifiedRecords = records.filter((record) => record.onchain).length;
  const TrendIcon = insight.trend === 'down' ? TrendingDown : TrendingUp;

  return (
    <section className="view on">
      <div className="topbar">
        <div>
          <div className="crumb">AI Learning Assistant</div>
          <h1>Rekomendasi Belajar Personal</h1>
        </div>
        <div className="status-badge">
          <ShieldCheck size={16} /> Analisis lokal
        </div>
      </div>

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
              <div className="ph-sub">Dihitung dari ledger akademik lokal</div>
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
    </section>
  );
}
