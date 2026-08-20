import { useState } from 'react';
import {
  Activity, AlertCircle, ArrowUpRight, Bell, CheckCircle2, ClipboardList, Clock3,
  FlaskConical, MoreHorizontal, PackageSearch, Pencil, Plus, Search, TestTube2,
  Trash2, Users,
} from 'lucide-react';
import type { Analysis, AnalysisStatus, LabSection, Patient, Reagent, Sample } from './types';
import { analysisTypes } from './data';
import { Modal, SectionHeader, StatCard, StatusBadge, StatusPill } from './components';

type Props = {
  section: LabSection;
  analyses: Analysis[];
  setAnalyses: React.Dispatch<React.SetStateAction<Analysis[]>>;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  samples: Sample[];
  setSamples: React.Dispatch<React.SetStateAction<Sample[]>>;
  reagents: Reagent[];
  setReagents: React.Dispatch<React.SetStateAction<Reagent[]>>;
};

export function Laboratory({ section, analyses, setAnalyses, patients, setPatients, samples, setSamples, reagents, setReagents }: Props) {
  if (section === 'Vue d’ensemble') return <Overview analyses={analyses} patients={patients} samples={samples} reagents={reagents} onNewDemand={() => {}} />;
  if (section === 'Demandes d’analyses') return <DemandesAnalyses analyses={analyses} setAnalyses={setAnalyses} />;
  if (section === 'Résultats') return <Resultats analyses={analyses} />;
  if (section === 'Prélèvements') return <Prelevements samples={samples} setSamples={setSamples} />;
  if (section === 'Stock réactifs') return <StockReactifs reagents={reagents} setReagents={setReagents} />;
  if (section === 'Patients') return <Patients patients={patients} setPatients={setPatients} />;
  return null;
}

function Overview({ analyses, patients, samples, reagents, onNewDemand }: { analyses: Analysis[]; patients: Patient[]; samples: Sample[]; reagents: Reagent[]; onNewDemand: () => void }) {
  const pending = analyses.filter((a) => a.status === 'En attente' || a.status === 'En cours').length;
  const done = analyses.filter((a) => a.status === 'Terminé').length;
  const lowStock = reagents.filter((r) => r.quantity <= r.threshold).length;
  const receivedSamples = samples.filter((s) => s.status === 'Reçu').length;

  return (
    <section className="page-wrap fade-in">
      <SectionHeader
        eyebrow="ESPACE LABORATOIRE"
        title="Bonjour Jean, voici votre laboratoire."
        subheading="Suivez les analyses et les résultats de la clinique en un seul endroit."
        action={<button className="primary-button"><Plus size={17} />Nouvelle demande</button>}
      />
      <div className="stats-grid">
        <StatCard icon={<ClipboardList size={20} />} tone="blue" label="Analyses du jour" value={String(analyses.length)} trend="Total" />
        <StatCard icon={<Clock3 size={20} />} tone="orange" label="En attente" value={String(pending).padStart(2, '0')} trend="À traiter" />
        <StatCard icon={<CheckCircle2 size={20} />} tone="green" label="Résultats validés" value={String(done).padStart(2, '0')} trend="Terminés" />
        <StatCard icon={<AlertCircle size={20} />} tone="red" label="Stocks bas" value={String(lowStock).padStart(2, '0')} trend="À commander" />
      </div>
      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div><h2>Demandes récentes</h2><p>Les dernières analyses en cours</p></div>
            <button className="text-button">Voir tout <ArrowUpRight size={15} /></button>
          </div>
          <div className="analysis-list">
            {analyses.slice(0, 4).map((a) => (
              <div className="analysis-row" key={a.id}>
                <div className="avatar patient">{a.initials}</div>
                <div className="patient-details"><strong>{a.patient}</strong><span>{a.id} · {a.type}</span></div>
                <div className="doctor-details"><span>Prescrit par</span><strong>{a.doctor}</strong></div>
                <StatusBadge status={a.status} />
                <button className="row-more"><MoreHorizontal size={18} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="panel quick-panel">
          <div className="panel-header"><div><h2>Synthèse</h2><p>Vue d’ensemble du laboratoire</p></div></div>
          <div className="overview-mini">
            <div className="overview-item"><div className="quick-icon blue"><Users size={19} /></div><div><strong>{patients.length}</strong><span>Patients enregistrés</span></div></div>
            <div className="overview-item"><div className="quick-icon mint"><TestTube2 size={19} /></div><div><strong>{samples.length}</strong><span>Prélèvements</span></div></div>
            <div className="overview-item"><div className="quick-icon orange"><PackageSearch size={19} /></div><div><strong>{receivedSamples}</strong><span>Échantillons reçus</span></div></div>
            <div className="overview-item"><div className="quick-icon red"><FlaskConical size={19} /></div><div><strong>{lowStock}</strong><span>Réactifs à commander</span></div></div>
          </div>
          <div className="mini-notice">
            <div className="notice-icon"><Bell size={16} /></div>
            <div><strong>Rappel important</strong><p>{pending} analyses attendent votre validation.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemandesAnalyses({ analyses, setAnalyses }: { analyses: Analysis[]; setAnalyses: React.Dispatch<React.SetStateAction<Analysis[]>> }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Toutes' | AnalysisStatus>('Toutes');
  const [showNew, setShowNew] = useState(false);

  const filtered = analyses.filter((a) => {
    const matchSearch = `${a.patient} ${a.type} ${a.id}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Toutes' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const advance = (id: string) => {
    setAnalyses((cur) => cur.map((a) => {
      if (a.id !== id) return a;
      if (a.status === 'En attente') return { ...a, status: 'En cours' };
      if (a.status === 'En cours') return { ...a, status: 'Terminé', result: 'En attente de saisie', unit: '', reference: '' };
      return a;
    }));
  };

  const remove = (id: string) => setAnalyses((cur) => cur.filter((a) => a.id !== id));

  return (
    <section className="page-wrap fade-in">
      <SectionHeader
        eyebrow="LABORATOIRE — DEMANDES"
        title="Demandes d’analyses"
        subheading="Gérez et suivez toutes les demandes d’analyses du laboratoire."
        action={<button className="primary-button" onClick={() => setShowNew(true)}><Plus size={17} />Nouvelle demande</button>}
      />
      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un patient ou une analyse" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'Toutes' | AnalysisStatus)}>
            <option>Toutes</option>
            <option>En attente</option><option>En cours</option><option>Terminé</option>
          </select>
        </div>
        <div className="analysis-list">
          {filtered.map((a) => (
            <div className="analysis-row" key={a.id}>
              <div className="avatar patient">{a.initials}</div>
              <div className="patient-details"><strong>{a.patient}</strong><span>{a.id} · {a.type}</span></div>
              <div className="doctor-details"><span>Prescrit par</span><strong>{a.doctor}</strong></div>
              <div className="received"><span>Reçue le</span><strong>{a.received}</strong></div>
              <StatusBadge status={a.status} />
              <button className="row-action" onClick={() => advance(a.id)} title="Faire avancer le statut"><Activity size={15} /></button>
              <button className="row-action danger" onClick={() => remove(a.id)} title="Supprimer"><Trash2 size={15} /></button>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state">Aucune analyse ne correspond à votre recherche.</div>}
        </div>
      </div>
      {showNew && (
        <NewAnalysisModal
          onClose={() => setShowNew(false)}
          onCreate={(data) => {
            const initials = data.patient.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'NP';
            setAnalyses((cur) => [{
              id: `LAB-${24082 + cur.length}`, patient: data.patient, initials,
              type: data.type, doctor: data.doctor || 'Non assigné',
              received: "À l'instant", status: 'En attente',
            }, ...cur]);
            setShowNew(false);
          }}
        />
      )}
    </section>
  );
}

function NewAnalysisModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: { patient: string; type: string; doctor: string }) => void }) {
  const [patient, setPatient] = useState('');
  const [type, setType] = useState('');
  const [doctor, setDoctor] = useState('');

  return (
    <Modal onClose={onClose} icon={<FlaskConical size={22} />} eyebrow="NOUVELLE DEMANDE" title="Créer une analyse" copy="Ajoutez une demande à la file d’attente du laboratoire.">
      <label className="modal-field"><span>Patient</span><input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Nom du patient" /></label>
      <label className="modal-field"><span>Type d’analyse</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="">Sélectionner une analyse</option>{analysisTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label className="modal-field"><span>Médecin prescripteur</span><input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. ..." /></label>
      <button className="primary-button full" onClick={() => patient && type && onCreate({ patient, type, doctor })} disabled={!patient || !type}>Ajouter à la file <ArrowUpRight size={17} /></button>
    </Modal>
  );
}

function Resultats({ analyses }: { analyses: Analysis[] }) {
  const [search, setSearch] = useState('');
  const done = analyses.filter((a) => a.status === 'Terminé');
  const filtered = done.filter((a) => `${a.patient} ${a.type} ${a.id}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="page-wrap fade-in">
      <SectionHeader eyebrow="LABORATOIRE — RÉSULTATS" title="Résultats des analyses" subheading="Consultez les résultats validés et prêts à transmettre." />
      <div className="panel">
        <div className="toolbar">
          <div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un résultat" /></div>
        </div>
        <div className="analysis-list">
          {filtered.map((a) => (
            <div className="result-row" key={a.id}>
              <div className="avatar patient">{a.initials}</div>
              <div className="patient-details"><strong>{a.patient}</strong><span>{a.id} · {a.type}</span></div>
              <div className="result-value"><span>Résultat</span><strong>{a.result} {a.unit}</strong></div>
              <div className="result-ref"><span>Référence</span><strong>{a.reference}</strong></div>
              <StatusBadge status="Terminé" />
              <button className="text-button">Télécharger</button>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state">Aucun résultat validé pour le moment.</div>}
        </div>
      </div>
    </section>
  );
}

function Prelevements({ samples, setSamples }: { samples: Sample[]; setSamples: React.Dispatch<React.SetStateAction<Sample[]>> }) {
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = samples.filter((s) => `${s.patient} ${s.id} ${s.type}`.toLowerCase().includes(search.toLowerCase()));
  const advance = (id: string) => setSamples((cur) => cur.map((s) => {
    if (s.id !== id) return s;
    if (s.status === 'Reçu') return { ...s, status: 'En analyse' };
    if (s.status === 'En analyse') return { ...s, status: 'Archivé' };
    return s;
  }));
  const remove = (id: string) => setSamples((cur) => cur.filter((s) => s.id !== id));

  return (
    <section className="page-wrap fade-in">
      <SectionHeader
        eyebrow="LABORATOIRE — PRÉLÈVEMENTS"
        title="Prélèvements"
        subheading="Suivez les échantillons reçus et leur statut d’analyse."
        action={<button className="primary-button" onClick={() => setShowNew(true)}><Plus size={17} />Nouveau prélèvement</button>}
      />
      <div className="panel">
        <div className="toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un échantillon" /></div></div>
        <div className="analysis-list">
          {filtered.map((s) => (
            <div className="analysis-row" key={s.id}>
              <div className={`sample-icon ${s.type.toLowerCase()}`}><TestTube2 size={18} /></div>
              <div className="patient-details"><strong>{s.patient}</strong><span>{s.id} · {s.type} — {s.tube}</span></div>
              <div className="received"><span>Collecté le</span><strong>{s.collectedAt}</strong></div>
              <StatusPill status={s.status} />
              <button className="row-action" onClick={() => advance(s.id)} title="Faire avancer"><Activity size={15} /></button>
              <button className="row-action danger" onClick={() => remove(s.id)} title="Supprimer"><Trash2 size={15} /></button>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state">Aucun prélèvement trouvé.</div>}
        </div>
      </div>
      {showNew && <NewSampleModal onClose={() => setShowNew(false)} onCreate={(d) => { setSamples((cur) => [{ id: `ECH-${502 + cur.length}`, patient: d.patient, type: d.type, tube: d.tube, collectedAt: "À l'instant", status: 'Reçu' }, ...cur]); setShowNew(false); }} />}
    </section>
  );
}

function NewSampleModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: { patient: string; type: Sample['type']; tube: string }) => void }) {
  const [patient, setPatient] = useState('');
  const [type, setType] = useState<Sample['type']>('Sang');
  const [tube, setTube] = useState('');

  return (
    <Modal onClose={onClose} icon={<TestTube2 size={22} />} eyebrow="NOUVEAU PRÉLÈVEMENT" title="Enregistrer un prélèvement" copy="Ajoutez un échantillon au suivi du laboratoire.">
      <label className="modal-field"><span>Patient</span><input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Nom du patient" /></label>
      <label className="modal-field"><span>Type d’échantillon</span><select value={type} onChange={(e) => setType(e.target.value as Sample['type'])}><option>Sang</option><option>Urine</option><option>Salive</option><option>Tissu</option></select></label>
      <label className="modal-field"><span>Tube / Contenant</span><input value={tube} onChange={(e) => setTube(e.target.value)} placeholder="Ex : EDTA violet" /></label>
      <button className="primary-button full" onClick={() => patient && onCreate({ patient, type, tube })} disabled={!patient}>Enregistrer <ArrowUpRight size={17} /></button>
    </Modal>
  );
}

function StockReactifs({ reagents, setReagents }: { reagents: Reagent[]; setReagents: React.Dispatch<React.SetStateAction<Reagent[]>> }) {
  const [showNew, setShowNew] = useState(false);
  const remove = (id: string) => setReagents((cur) => cur.filter((r) => r.id !== id));
  const restock = (id: string) => setReagents((cur) => cur.map((r) => r.id === id ? { ...r, quantity: r.maxStock } : r));

  return (
    <section className="page-wrap fade-in">
      <SectionHeader
        eyebrow="LABORATOIRE — STOCK"
        title="Stock des réactifs"
        subheading="Surveillez vos réactifs et anticipez les ruptures."
        action={<button className="primary-button" onClick={() => setShowNew(true)}><Plus size={17} />Ajouter un réactif</button>}
      />
      <div className="panel">
        <div className="reagent-head">
          <span>Réactif</span><span>Référence</span><span>Quantité</span><span>État</span><span>Actions</span>
        </div>
        <div className="reagent-list">
          {reagents.map((r) => {
            const low = r.quantity <= r.threshold;
            return (
              <div className="reagent-row" key={r.id}>
                <div className="reagent-name"><strong>{r.name}</strong><span>{r.unit}</span></div>
                <span className="reagent-ref">{r.reference}</span>
                <div className="reagent-qty"><div className="qty-bar"><div className={low ? 'qty-fill low' : 'qty-fill'} style={{ width: `${Math.max(8, Math.min(100, (r.quantity / r.maxStock) * 100))}%` }} /></div><span className="qty-num">{r.quantity}/{r.maxStock}</span></div>
                <StatusPill status={low ? 'Stock bas' : 'En stock'} tone={low ? 'en-attente' : 'terminé'} />
                <div className="reagent-actions"><button className="row-action" onClick={() => restock(r.id)} title="Réapprovisionner"><PackageSearch size={15} /></button><button className="row-action danger" onClick={() => remove(r.id)} title="Supprimer"><Trash2 size={15} /></button></div>
              </div>
            );
          })}
          {reagents.length === 0 && <div className="empty-state">Aucun réactif en stock.</div>}
        </div>
      </div>
      {showNew && <NewReagentModal onClose={() => setShowNew(false)} onCreate={(d) => { setReagents((cur) => [{ id: `REA-${String(cur.length + 1).padStart(2, '0')}`, name: d.name, reference: d.reference, quantity: d.quantity, unit: d.unit, threshold: d.threshold, maxStock: d.maxStock }, ...cur]); setShowNew(false); }} />}
    </section>
  );
}

function NewReagentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: { name: string; reference: string; quantity: number; unit: string; threshold: number; maxStock: number }) => void }) {
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [unit, setUnit] = useState('tests');
  const [quantity, setQuantity] = useState('10');
  const [threshold, setThreshold] = useState('5');
  const [maxStock, setMaxStock] = useState('50');

  return (
    <Modal onClose={onClose} icon={<PackageSearch size={22} />} eyebrow="NOUVEAU RÉACTIF" title="Ajouter un réactif" copy="Enregistrez un nouveau réactif dans le stock.">
      <label className="modal-field"><span>Nom</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Réactif NFS" /></label>
      <label className="modal-field"><span>Référence</span><input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex : R-NFS-250" /></label>
      <div className="modal-row">
        <label className="modal-field"><span>Quantité</span><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
        <label className="modal-field"><span>Unité</span><input value={unit} onChange={(e) => setUnit(e.target.value)} /></label>
      </div>
      <div className="modal-row">
        <label className="modal-field"><span>Seuil d’alerte</span><input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} /></label>
        <label className="modal-field"><span>Stock maximum</span><input type="number" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} /></label>
      </div>
      <button className="primary-button full" onClick={() => name && onCreate({ name, reference, quantity: Number(quantity) || 0, unit, threshold: Number(threshold) || 0, maxStock: Number(maxStock) || 0 })} disabled={!name}>Ajouter <ArrowUpRight size={17} /></button>
    </Modal>
  );
}

function Patients({ patients, setPatients }: { patients: Patient[]; setPatients: React.Dispatch<React.SetStateAction<Patient[]>> }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const filtered = patients.filter((p) => `${p.name} ${p.id} ${p.phone} ${p.email}`.toLowerCase().includes(search.toLowerCase()));
  const remove = (id: string) => setPatients((cur) => cur.filter((p) => p.id !== id));

  const openEdit = (p: Patient) => { setEditing(p); setShowForm(true); };
  const openNew = () => { setEditing(null); setShowForm(true); };

  const save = (data: Patient) => {
    if (editing) {
      setPatients((cur) => cur.map((p) => p.id === editing.id ? data : p));
    } else {
      setPatients((cur) => [{ ...data, id: `PAT-${String(cur.length + 1).padStart(3, '0')}` }, ...cur]);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <section className="page-wrap fade-in">
      <SectionHeader
        eyebrow="LABORATOIRE — PATIENTS"
        title="Patients"
        subheading="Gérez les dossiers patients associés aux analyses."
        action={<button className="primary-button" onClick={openNew}><Plus size={17} />Nouveau patient</button>}
      />
      <div className="panel">
        <div className="toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un patient" /></div></div>
        <div className="patient-head">
          <span>Patient</span><span>Âge / Sexe</span><span>Groupe</span><span>Contact</span><span>Actions</span>
        </div>
        <div className="patient-list">
          {filtered.map((p) => (
            <div className="patient-row" key={p.id}>
              <div className="patient-cell"><div className="avatar patient">{p.initials}</div><div><strong>{p.name}</strong><span>{p.id}</span></div></div>
              <span className="patient-cell">{p.age} ans · {p.gender === 'M' ? 'Homme' : 'Femme'}</span>
              <span className="patient-cell blood">{p.bloodType}</span>
              <div className="patient-cell contact"><strong>{p.phone}</strong><span>{p.email}</span></div>
              <div className="patient-actions"><button className="row-action" onClick={() => openEdit(p)} title="Modifier"><Pencil size={15} /></button><button className="row-action danger" onClick={() => remove(p.id)} title="Supprimer"><Trash2 size={15} /></button></div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state">Aucun patient trouvé.</div>}
        </div>
      </div>
      {showForm && <PatientFormModal onClose={() => { setShowForm(false); setEditing(null); }} onSave={save} editing={editing} />}
    </section>
  );
}

function PatientFormModal({ onClose, onSave, editing }: { onClose: () => void; onSave: (p: Patient) => void; editing: Patient | null }) {
  const [name, setName] = useState(editing?.name ?? '');
  const [age, setAge] = useState(String(editing?.age ?? ''));
  const [gender, setGender] = useState<'M' | 'F'>(editing?.gender ?? 'M');
  const [phone, setPhone] = useState(editing?.phone ?? '');
  const [bloodType, setBloodType] = useState(editing?.bloodType ?? 'A+');
  const [email, setEmail] = useState(editing?.email ?? '');
  const [address, setAddress] = useState(editing?.address ?? '');

  const submit = () => {
    if (!name) return;
    const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'NP';
    onSave({
      id: editing?.id ?? '',
      name, initials, age: Number(age) || 0, gender, phone, bloodType, email, address,
    });
  };

  return (
    <Modal onClose={onClose} icon={<Users size={22} />} eyebrow={editing ? 'MODIFIER LE PATIENT' : 'NOUVEAU PATIENT'} title={editing ? 'Modifier le dossier' : 'Créer un patient'} copy={editing ? 'Mettez à jour les informations du patient.' : 'Ajoutez un nouveau dossier patient au laboratoire.'}>
      <label className="modal-field"><span>Nom complet</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Aïcha Benali" /></label>
      <div className="modal-row">
        <label className="modal-field"><span>Âge</span><input type="number" value={age} onChange={(e) => setAge(e.target.value)} /></label>
        <label className="modal-field"><span>Sexe</span><select value={gender} onChange={(e) => setGender(e.target.value as 'M' | 'F')}><option value="M">Homme</option><option value="F">Femme</option></select></label>
        <label className="modal-field"><span>Groupe sanguin</span><select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}</select></label>
      </div>
      <label className="modal-field"><span>Téléphone</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" /></label>
      <label className="modal-field"><span>E-mail</span><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@email.fr" /></label>
      <label className="modal-field"><span>Adresse</span><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse complète" /></label>
      <button className="primary-button full" onClick={submit} disabled={!name}>{editing ? 'Enregistrer les modifications' : 'Créer le patient'} <ArrowUpRight size={17} /></button>
    </Modal>
  );
}
