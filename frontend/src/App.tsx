import { useState } from 'react';
import {
  ArrowLeft, Bell, ChevronRight, Lock, LogOut, Menu, Plus,
  Settings2, ShieldCheck, X,
} from 'lucide-react';
import type { LabSection, ModuleId, View, Analysis, Patient, Sample, Reagent, Module } from './types';
import {
  modules, initialAnalyses, initialPatients, initialSamples, initialReagents, submenuIcon,
} from './data';
import { Laboratory } from './Laboratory';
import { AdminUsers } from './AdminUsers';
import { useAuth } from './auth/AuthContext';
import { ApiError } from './lib/api';

function initialsOf(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function App() {
  const { user, loading, hasPermission, logout } = useAuth();
  const [view, setView] = useState<View>('modules');
  const [labSection, setLabSection] = useState<LabSection>('Vue d’ensemble');
  const [menuOpen, setMenuOpen] = useState(false);

  const [analyses, setAnalyses] = useState<Analysis[]>(initialAnalyses);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [reagents, setReagents] = useState<Reagent[]>(initialReagents);

  const visibleModules = modules.filter((m) => m.id !== 'utilisateurs' || hasPermission('USERS_MANAGE'));
  const activeModule = visibleModules.find((m) => m.id === view);
  const showSidebar = view !== 'modules';

  const openModule = (id: ModuleId) => {
    const mod = visibleModules.find((m) => m.id === id);
    if (!mod?.active) return;
    setView(id);
    setMenuOpen(false);
    if (id === 'laboratoire') setLabSection('Vue d’ensemble');
  };

  const backToModules = () => { setView('modules'); setMenuOpen(false); };

  if (loading) {
    return (
      <div className="login-shell">
        <div className="spinner" style={{ borderTopColor: '#fff', width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (user.mustChangePassword) return <ChangePasswordGate />;

  return (
    <div className="app-shell">
      {showSidebar && activeModule && (
        <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
          <div className="brand-block">
            <div className="brand-mark"><Plus size={22} strokeWidth={3} /></div>
            <div><strong>Clinique</strong><span>Pasteur</span></div>
            <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu"><X size={19} /></button>
          </div>
          <div className="sidebar-label">{activeModule.name.toUpperCase()}</div>
          <nav className="main-nav">
            <button className="nav-item back" onClick={backToModules}><ArrowLeft size={16} />Tous les modules</button>
            {activeModule.submenu.map((item) => {
              const isActive = activeModule.id === 'laboratoire' && item === labSection;
              const handleClick = () => {
                if (activeModule.id === 'laboratoire') setLabSection(item as LabSection);
                setMenuOpen(false);
              };
              const Icon = submenuIcon(item);
              return (
                <button key={item} className={isActive ? 'nav-item active' : 'nav-item'} onClick={handleClick}>
                  <Icon size={17} />{item}
                  {item === 'Demandes d’analyses' && <span className="nav-badge">{analyses.length}</span>}
                  {item === 'Patients' && <span className="nav-badge">{patients.length}</span>}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <button className="nav-item muted"><Settings2 size={18} />Paramètres</button>
            <div className="help-card"><ShieldCheck size={20} /><div><strong>Données sécurisées</strong><span>Votre espace est protégé</span></div></div>
            <button className="user-card" onClick={() => logout()}>
              <div className="avatar dark">{initialsOf(user.fullName)}</div>
              <div><strong>{user.fullName}</strong><span>{user.roles[0] ?? 'Utilisateur'}</span></div>
              <LogOut size={16} />
            </button>
          </div>
        </aside>
      )}

      <main className={showSidebar ? 'main-content' : 'main-content full'}>
        <header className={showSidebar ? 'topbar' : 'topbar modules-topbar'}>
          {showSidebar && <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu"><Menu size={22} /></button>}
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={backToModules}>Clinique Pasteur</button>
            {showSidebar && activeModule && <><ChevronRight size={15} /><strong>{activeModule.name}</strong></>}
          </div>
          <div className="topbar-actions">
            <button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button>
            <div className="avatar">{initialsOf(user.fullName)}</div>
          </div>
        </header>

        {view === 'modules' ? (
          <ModulesHome modules={visibleModules} onOpen={openModule} />
        ) : activeModule?.id === 'laboratoire' ? (
          <Laboratory
            section={labSection}
            analyses={analyses} setAnalyses={setAnalyses}
            patients={patients} setPatients={setPatients}
            samples={samples} setSamples={setSamples}
            reagents={reagents} setReagents={setReagents}
          />
        ) : activeModule?.id === 'utilisateurs' ? (
          <AdminUsers />
        ) : activeModule ? (
          <DevModule module={activeModule} onBack={backToModules} />
        ) : null}
      </main>
    </div>
  );
}

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible, reessayez plus tard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-bg">
        <div className="login-orb orb-a" />
        <div className="login-orb orb-b" />
        <div className="login-grid" />
      </div>
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark large"><Plus size={26} strokeWidth={3} /></div>
          <strong>Clinique Pasteur</strong>
          <span>Portail de soins</span>
        </div>
        <form onSubmit={submit}>
          <label><span>Adresse e-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
          <label><span>Mot de passe</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
          {error && <p style={{ color: '#d46767', fontSize: 12, margin: 0 }}>{error}</p>}
          <button type="submit" className="primary-button full" disabled={loading}>
            {loading ? <><span className="spinner" />Connexion…</> : <><Lock size={16} />Se connecter</>}
          </button>
        </form>
        <p className="login-hint">Acces reserve au personnel autorise de la clinique.</p>
      </div>
    </div>
  );
}

function ChangePasswordGate() {
  const { changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de changer le mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-bg">
        <div className="login-orb orb-a" />
        <div className="login-orb orb-b" />
        <div className="login-grid" />
      </div>
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark large"><Lock size={26} strokeWidth={3} /></div>
          <strong>Nouveau mot de passe</strong>
          <span>Premiere connexion</span>
        </div>
        <form onSubmit={submit}>
          <label><span>Mot de passe temporaire</span><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" /></label>
          <label><span>Nouveau mot de passe</span><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" /></label>
          <label><span>Confirmer le mot de passe</span><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" /></label>
          {error && <p style={{ color: '#d46767', fontSize: 12, margin: 0 }}>{error}</p>}
          <button type="submit" className="primary-button full" disabled={loading}>
            {loading ? <><span className="spinner" />Enregistrement…</> : 'Definir le mot de passe'}
          </button>
        </form>
        <p className="login-hint">Au moins 10 caracteres, avec majuscule, minuscule, chiffre et caractere special.</p>
        <button type="button" className="text-button" style={{ margin: '14px auto 0' }} onClick={() => logout()}>Se deconnecter</button>
      </div>
    </div>
  );
}

function ModulesHome({ modules, onOpen }: { modules: Module[]; onOpen: (id: ModuleId) => void }) {
  return (
    <section className="modules-page fade-in">
      <div className="modules-header">
        <p className="eyebrow">JEUDI 20 AOÛT 2026</p>
        <h1>Bonjour, <em>bienvenue.</em></h1>
        <p className="subheading">Sélectionnez un module pour accéder à son espace de travail.</p>
      </div>
      <div className="modules-grid">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button key={mod.id} className={`module-card ${mod.active ? 'featured' : ''}`} onClick={() => onOpen(mod.id)}>
              <div className={`module-icon ${mod.tone}`}><Icon size={28} /></div>
              <h3>{mod.name}</h3>
              <p>{mod.description}</p>
              <span className={`module-count ${mod.active ? 'highlight' : ''}`}>
                {mod.active && <span className="live-dot mini" />}
                {mod.count}
              </span>
              <ChevronRight className="module-arrow" size={20} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DevModule({ module: mod, onBack }: { module: Module; onBack: () => void }) {
  const Icon = mod.icon;
  return (
    <section className="page-wrap fade-in">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} />Tous les modules</button>
      <div className="dev-card">
        <div className={`module-icon ${mod.tone} large`}><Icon size={36} /></div>
        <p className="eyebrow">{mod.name.toUpperCase()}</p>
        <h2>Module en cours de développement</h2>
        <p className="dev-copy">Cet espace sera bientôt disponible. Seul le module <strong>Laboratoire</strong> est actif dans cette démo.</p>
        <div className="dev-submenu">
          {mod.submenu.map((item) => <span key={item} className="dev-sub-tag">{item}</span>)}
        </div>
        <button className="primary-button" onClick={onBack}><ArrowLeft size={16} />Retour aux modules</button>
      </div>
    </section>
  );
}

export default App;
