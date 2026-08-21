-- Fixed role / permission catalog for the laboratory management application.
-- Permissions follow a MODULE_ACTION naming convention so future modules
-- (pharmacie, hopital, imagerie, ...) can extend this table without
-- touching the roles already granted here.

INSERT INTO roles (name, description) VALUES
    ('SUPER_ADMIN', 'Acces complet a l''application, gestion des utilisateurs et des roles'),
    ('ADMIN', 'Administration du laboratoire et des comptes utilisateurs'),
    ('BIOLOGISTE', 'Validation des resultats d''analyses'),
    ('TECHNICIEN', 'Gestion des prelevements et du stock de reactifs'),
    ('RECEPTIONNISTE', 'Gestion des patients et des demandes d''analyses');

INSERT INTO permissions (code, description) VALUES
    ('USERS_MANAGE', 'Creer, modifier et desactiver les comptes utilisateurs'),
    ('ROLES_VIEW', 'Consulter les roles et permissions disponibles'),
    ('LAB_OVERVIEW_VIEW', 'Consulter la vue d''ensemble du laboratoire'),
    ('LAB_ANALYSES_VIEW', 'Consulter les demandes d''analyses'),
    ('LAB_ANALYSES_MANAGE', 'Creer et modifier les demandes d''analyses'),
    ('LAB_RESULTS_VIEW', 'Consulter les resultats'),
    ('LAB_RESULTS_MANAGE', 'Saisir et valider les resultats'),
    ('LAB_SAMPLES_VIEW', 'Consulter les prelevements'),
    ('LAB_SAMPLES_MANAGE', 'Enregistrer et suivre les prelevements'),
    ('LAB_REAGENTS_VIEW', 'Consulter le stock de reactifs'),
    ('LAB_REAGENTS_MANAGE', 'Gerer le stock de reactifs'),
    ('LAB_PATIENTS_VIEW', 'Consulter les dossiers patients'),
    ('LAB_PATIENTS_MANAGE', 'Creer et modifier les dossiers patients');

-- SUPER_ADMIN: every permission.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'SUPER_ADMIN';

-- ADMIN: every permission (day-to-day administration), assigning the
-- SUPER_ADMIN role itself is additionally restricted in application code.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'BIOLOGISTE'
  AND p.code IN ('LAB_OVERVIEW_VIEW', 'LAB_ANALYSES_VIEW', 'LAB_RESULTS_VIEW', 'LAB_RESULTS_MANAGE', 'LAB_SAMPLES_VIEW');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'TECHNICIEN'
  AND p.code IN ('LAB_OVERVIEW_VIEW', 'LAB_SAMPLES_VIEW', 'LAB_SAMPLES_MANAGE', 'LAB_REAGENTS_VIEW', 'LAB_REAGENTS_MANAGE', 'LAB_ANALYSES_VIEW');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'RECEPTIONNISTE'
  AND p.code IN ('LAB_OVERVIEW_VIEW', 'LAB_PATIENTS_VIEW', 'LAB_PATIENTS_MANAGE', 'LAB_ANALYSES_VIEW', 'LAB_ANALYSES_MANAGE', 'LAB_SAMPLES_VIEW');
