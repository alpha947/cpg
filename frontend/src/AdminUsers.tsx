import { useEffect, useMemo, useState } from 'react';
import {
  Check, Copy, KeyRound, Lock, Pencil, Plus, Search, Unlock,
} from 'lucide-react';
import type { AppRole, AppUser } from './types';
import { apiFetch, ApiError } from './lib/api';
import { Modal, SectionHeader, StatusPill } from './components';

function initialsOf(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type FormState = {
  email: string;
  fullName: string;
  roleIds: Set<number>;
};

const EMPTY_FORM: FormState = { email: '', fullName: '', roleIds: new Set() };

type RevealState = { email: string; password: string };

export function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [reveal, setReveal] = useState<RevealState | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, roleList] = await Promise.all([
        apiFetch<AppUser[]>('/api/users'),
        apiFetch<AppRole[]>('/api/roles'),
      ]);
      setUsers(userList);
      setRoles(roleList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(
    () => users.filter((u) => `${u.fullName} ${u.email}`.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (user: AppUser) => {
    const roleIds = new Set(roles.filter((r) => user.roles.includes(r.name)).map((r) => r.id));
    setEditingUser(user);
    setForm({ email: user.email, fullName: user.fullName, roleIds });
    setFormError(null);
    setShowForm(true);
  };

  const toggleRole = (roleId: number) => {
    setForm((current) => {
      const next = new Set(current.roleIds);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return { ...current, roleIds: next };
    });
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.roleIds.size === 0) {
      setFormError('Selectionnez au moins un role');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingUser) {
        await apiFetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          body: { fullName: form.fullName, roleIds: Array.from(form.roleIds) },
        });
        setShowForm(false);
        await loadData();
      } else {
        const response = await apiFetch<{ user: AppUser; temporaryPassword: string }>('/api/users', {
          method: 'POST',
          body: { email: form.email, fullName: form.fullName, roleIds: Array.from(form.roleIds) },
        });
        setShowForm(false);
        setReveal({ email: response.user.email, password: response.temporaryPassword });
        await loadData();
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (user: AppUser) => {
    try {
      const response = await apiFetch<{ temporaryPassword: string }>(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
      });
      setReveal({ email: user.email, password: response.temporaryPassword });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de reinitialiser le mot de passe');
    }
  };

  const toggleEnabled = async (user: AppUser) => {
    try {
      await apiFetch(`/api/users/${user.id}`, { method: 'PATCH', body: { enabled: !user.enabled } });
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de modifier ce compte');
    }
  };

  const copyPassword = async () => {
    if (!reveal) return;
    try {
      await navigator.clipboard.writeText(reveal.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied by the browser; the user can still select the text manually.
    }
  };

  return (
    <section className="page-wrap fade-in">
      <SectionHeader
        eyebrow="ADMINISTRATION"
        title="Utilisateurs"
        subheading="Gerez les comptes, les roles et les privileges d acces a l application."
        action={<button className="primary-button" onClick={openCreate}><Plus size={17} />Nouvel utilisateur</button>}
      />

      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={15} />
            <input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Aucun utilisateur trouve</div>
        ) : (
          <>
            <div className="patient-head">
              <span>Utilisateur</span>
              <span>Roles</span>
              <span>Statut</span>
              <span>Cree le</span>
              <span></span>
            </div>
            {filtered.map((user) => (
              <div className="patient-row" key={user.id}>
                <div className="patient-cell">
                  <div className="avatar patient">{initialsOf(user.fullName)}</div>
                  <div>
                    <strong>{user.fullName}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="patient-cell contact">
                  {user.roles.map((r) => (
                    <span className="status-pill en-stock" key={r} style={{ marginBottom: 3 }}>{r}</span>
                  ))}
                </div>
                <div className="patient-cell">
                  <StatusPill status={user.enabled ? 'Actif' : 'Inactif'} tone={user.enabled ? 'en-stock' : 'stock-bas'} />
                  {user.mustChangePassword && (
                    <span className="status-pill en-attente" style={{ marginLeft: 6 }}>Mdp a changer</span>
                  )}
                </div>
                <div className="patient-cell">
                  <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="patient-actions">
                  <button className="row-action" title="Reinitialiser le mot de passe" onClick={() => resetPassword(user)}>
                    <KeyRound size={16} />
                  </button>
                  <button className="row-action" title="Modifier les roles" onClick={() => openEdit(user)}>
                    <Pencil size={16} />
                  </button>
                  <button
                    className={user.enabled ? 'row-action danger' : 'row-action'}
                    title={user.enabled ? 'Desactiver le compte' : 'Reactiver le compte'}
                    onClick={() => toggleEnabled(user)}
                  >
                    {user.enabled ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          icon={<Plus size={20} />}
          eyebrow={editingUser ? 'MODIFIER' : 'NOUVEL UTILISATEUR'}
          title={editingUser ? 'Modifier les roles' : 'Creer un utilisateur'}
          copy={editingUser ? undefined : 'Un mot de passe temporaire sera genere et affiche une seule fois.'}
        >
          <form onSubmit={submitForm}>
            <label className="modal-field">
              Adresse e-mail
              <input
                type="email"
                required
                disabled={!!editingUser}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label className="modal-field">
              Nom complet
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </label>
            <div className="modal-field">
              Roles
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="status-pill en-attente"
                    style={{ cursor: 'pointer', gap: 6 }}
                  >
                    <input
                      type="checkbox"
                      checked={form.roleIds.has(role.id)}
                      onChange={() => toggleRole(role.id)}
                      style={{ width: 13, height: 13 }}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
            {formError && <p style={{ color: '#d46767', fontSize: 12 }}>{formError}</p>}
            <button type="submit" className="primary-button full" disabled={saving}>
              {saving ? 'Enregistrement...' : editingUser ? 'Enregistrer' : 'Creer le compte'}
            </button>
          </form>
        </Modal>
      )}

      {reveal && (
        <Modal
          onClose={() => setReveal(null)}
          icon={<KeyRound size={20} />}
          eyebrow="MOT DE PASSE TEMPORAIRE"
          title={reveal.email}
          copy="Ce mot de passe ne sera plus jamais affiche. Transmettez-le a l utilisateur par un canal securise, il devra le changer a sa premiere connexion."
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <code
              style={{
                flex: 1,
                background: '#f3f6f7',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                letterSpacing: 0.5,
                wordBreak: 'break-all',
              }}
            >
              {reveal.password}
            </code>
            <button type="button" className="row-action" onClick={copyPassword} title="Copier">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <button type="button" className="primary-button full" onClick={() => setReveal(null)}>
            Fermer
          </button>
        </Modal>
      )}
    </section>
  );
}
