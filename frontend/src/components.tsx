import type { AnalysisStatus } from './types';

export function StatCard({ icon, tone, label, value, trend }: { icon: React.ReactNode; tone: string; label: string; value: string; trend: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <strong>{value}</strong>
      <span className={tone === 'red' || tone === 'orange' ? 'stat-note warm' : 'stat-note'}>{trend}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: AnalysisStatus }) {
  return <span className={`status ${status.toLowerCase().replace(/\s/g, '-')}`}><i />{status}</span>;
}

export function StatusPill({ status, tone }: { status: string; tone?: string }) {
  const cls = tone ?? status.toLowerCase().replace(/\s/g, '-');
  return <span className={`status-pill ${cls}`}><i />{status}</span>;
}

export function SectionHeader({ eyebrow, title, subheading, action }: { eyebrow?: string; title: string; subheading?: string; action?: React.ReactNode }) {
  return (
    <div className="lab-title-row">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subheading && <p className="subheading">{subheading}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ onClose, children, icon, title, eyebrow, copy }: {
  onClose: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  eyebrow: string;
  copy?: string;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer"><span className="modal-x">×</span></button>
        <div className="modal-icon">{icon}</div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {copy && <p className="modal-copy">{copy}</p>}
        {children}
      </div>
    </div>
  );
}
