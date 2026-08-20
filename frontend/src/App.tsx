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

function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<View>('modules');
  const [labSection, setLabSection] = useState<LabSection>('Vue d’ensemble');
  const [menuOpen, setMenuOpen] = useState(false);

  const [analyses, setAnalyses] = useState<Analysis[]>(initialAnalyses);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [reagents, setReagents] = useState<Reagent[]>(initialReagents);

  const activeModule = modules.find((m) => m.id === view);
  const showSidebar = view !== 'modules';

  const openModule = (id: ModuleId) => {
    const mod = modules.find((m) => m.id === id);
    if (!mod?.active) return;
    setView(id);
    setMenuOpen(false);
    if (id === 'laboratoire') setLabSection('Vue d’ensemble');
  };

  const backToModules = () => { setView('modules'); setMenuOpen(false); };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

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
            <button className="user-card" onClick={() => setAuthed(false)}><div className="avatar dark">JD</div><div><strong>Jean Dupont</strong><span>Administrateur</span></div><LogOut size={16} /></button>
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
            <div className="avatar">JD</div>
          </div>
        </header>

        {view === 'modules' ? (
          <ModulesHome modules={modules} onOpen={openModule} />
        ) : activeModule?.id === 'laboratoire' ? (
          <Laboratory
            section={labSection}
            analyses={analyses} setAnalyses={setAnalyses}
            patients={patients} setPatients={setPatients}
            samples={samples} setSamples={setSamples}
            reagents={reagents} setReagents={setReagents}
          />
        ) : activeModule ? (
          <DevModule module={activeModule} onBack={backToModules} />
        ) : null}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('jean.dupont@clinique.fr');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(onLogin, 700);
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
          <label><span>Adresse e-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label><span>Mot de passe</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button type="submit" className="primary-button full" disabled={loading}>
            {loading ? <><span className="spinner" />Connexion…</> : <><Lock size={16} />Se connecter</>}
          </button>
        </form>
        <p className="login-hint">Démo — utilisez n’importe quel identifiant pour entrer.</p>
      </div>
    </div>
  );
}

function ModulesHome({ modules, onOpen }: { modules: Module[]; onOpen: (id: ModuleId) => void }) {
  return (
    <section className="modules-page fade-in">
      <div className="modules-header">
        <p className="eyebrow">JEUDI 20 AOÛT 2026</p>
        <h1>Bonjour Jean, <em>bienvenue.</em></h1>
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
