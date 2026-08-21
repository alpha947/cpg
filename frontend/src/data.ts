import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Hospital,
  LayoutDashboard,
  Microscope,
  PackageSearch,
  Pill,
  Stethoscope,
  TestTube2,
  Users,
  UserCog,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import type { Analysis, Module, Patient, Reagent, Sample } from './types';

export const modules: Module[] = [
  { id: 'pharmacie', name: 'Pharmacie', description: 'Stocks, délivrances et commandes', icon: Pill, tone: 'blue', count: 'En développement', active: false, submenu: ['Inventaire', 'Délivrance', 'Commandes', 'Fournisseurs'] },
  { id: 'hopital', name: 'Hôpital', description: 'Admissions et parcours patients', icon: Hospital, tone: 'mint', count: 'En développement', active: false, submenu: ['Admissions', 'Chambres', 'Sorties', 'Transferts'] },
  { id: 'laboratoire', name: 'Laboratoire', description: 'Analyses, résultats et suivi', icon: FlaskConical, tone: 'orange', count: '4 nouvelles', active: true, submenu: ['Vue d’ensemble', 'Demandes d’analyses', 'Résultats', 'Prélèvements', 'Stock réactifs', 'Patients'] },
  { id: 'urgences', name: 'Urgences', description: 'Priorités et prise en charge', icon: HeartPulse, tone: 'red', count: 'En développement', active: false, submenu: ['Tri', 'Salles', 'Ambulances', 'Code rouge'] },
  { id: 'consultations', name: 'Consultations', description: 'Rendez-vous et dossiers patients', icon: Stethoscope, tone: 'purple', count: 'En développement', active: false, submenu: ['Planning', 'Dossiers', 'Ordonnances', 'Suivi'] },
  { id: 'imagerie', name: 'Imagerie médicale', description: 'Examens et comptes rendus', icon: Activity, tone: 'teal', count: 'En développement', active: false, submenu: ['Radiologie', 'Échographie', 'IRM', 'Comptes rendus'] },
  { id: "utilisateurs", name: "Utilisateurs", description: "Comptes, roles et permissions", icon: UserCog, tone: "slate", count: "Administration", active: true, submenu: ["Comptes"] },
];

export const initialAnalyses: Analysis[] = [
  { id: 'LAB-24081', patient: 'Aïcha Benali', initials: 'AB', type: 'NFS complète', doctor: 'Dr. M. Diallo', received: 'Aujourd’hui, 09:42', status: 'En cours' },
  { id: 'LAB-24080', patient: 'Thomas Martin', initials: 'TM', type: 'Bilan lipidique', doctor: 'Dr. S. Laurent', received: 'Aujourd’hui, 09:18', status: 'En attente' },
  { id: 'LAB-24079', patient: 'Fatou Ndiaye', initials: 'FN', type: 'Glycémie à jeun', doctor: 'Dr. A. Morel', received: "Aujourd'hui, 08:56", status: 'Terminé', result: '0,92', unit: 'g/L', reference: '0,70 – 1,10' },
  { id: 'LAB-24078', patient: 'Lucas Bernard', initials: 'LB', type: 'CRP', doctor: 'Dr. N. Traoré', received: 'Hier, 17:24', status: 'Terminé', result: '4,2', unit: 'mg/L', reference: '< 5,0' },
  { id: 'LAB-24077', patient: 'Mariam Sy', initials: 'MS', type: 'Sérologie VIH', doctor: 'Dr. K. Fall', received: 'Hier, 16:47', status: 'En attente' },
];

export const initialPatients: Patient[] = [
  { id: 'PAT-001', name: 'Aïcha Benali', initials: 'AB', age: 34, gender: 'F', phone: '06 12 34 56 78', bloodType: 'A+', email: 'aicha.benali@email.fr', address: '12 rue des Lilas, Paris' },
  { id: 'PAT-002', name: 'Thomas Martin', initials: 'TM', age: 52, gender: 'M', phone: '06 98 76 54 32', bloodType: 'O-', email: 'thomas.martin@email.fr', address: '45 av. Foch, Lyon' },
  { id: 'PAT-003', name: 'Fatou Ndiaye', initials: 'FN', age: 28, gender: 'F', phone: '07 11 22 33 44', bloodType: 'B+', email: 'fatou.ndiaye@email.fr', address: '8 impasse du Jardin, Marseille' },
  { id: 'PAT-004', name: 'Lucas Bernard', initials: 'LB', age: 41, gender: 'M', phone: '06 55 66 77 88', bloodType: 'AB+', email: 'lucas.bernard@email.fr', address: '23 bd Voltaire, Lille' },
  { id: 'PAT-005', name: 'Mariam Sy', initials: 'MS', age: 37, gender: 'F', phone: '07 44 55 66 77', bloodType: 'A-', email: 'mariam.sy@email.fr', address: '67 rue Pasteur, Bordeaux' },
];

export const initialSamples: Sample[] = [
  { id: 'ECH-501', patient: 'Aïcha Benali', type: 'Sang', tube: 'EDTA violet', collectedAt: "Aujourd'hui, 09:35", status: 'En analyse' },
  { id: 'ECH-500', patient: 'Thomas Martin', type: 'Sang', tube: 'Sérum rouge', collectedAt: "Aujourd'hui, 09:10", status: 'Reçu' },
  { id: 'ECH-499', patient: 'Fatou Ndiaye', type: 'Urine', tube: 'Flacon stérile', collectedAt: "Aujourd'hui, 08:50", status: 'Archivé' },
  { id: 'ECH-498', patient: 'Lucas Bernard', type: 'Sang', tube: 'Citrate bleu', collectedAt: 'Hier, 17:20', status: 'Archivé' },
  { id: 'ECH-497', patient: 'Mariam Sy', type: 'Salive', tube: 'Tube sec', collectedAt: 'Hier, 16:40', status: 'Reçu' },
];

export const initialReagents: Reagent[] = [
  { id: 'REA-01', name: 'Réactif NFS', reference: 'R-NFS-250', quantity: 42, unit: 'tests', threshold: 20, maxStock: 100 },
  { id: 'REA-02', name: 'Colorant Giemsa', reference: 'C-GSM-100', quantity: 8, unit: 'flacons', threshold: 10, maxStock: 50 },
  { id: 'REA-03', name: 'Tampon phosphate', reference: 'T-PH-500', quantity: 65, unit: 'L', threshold: 15, maxStock: 80 },
  { id: 'REA-04', name: 'Anticorps anti-CRP', reference: 'AC-CRP-50', quantity: 3, unit: 'tests', threshold: 5, maxStock: 30 },
  { id: 'REA-05', name: 'Contrôle glycémie', reference: 'CT-GLY-20', quantity: 28, unit: 'tests', threshold: 10, maxStock: 40 },
];

export const analysisTypes = ['NFS complète', 'Bilan lipidique', 'Glycémie à jeun', 'CRP', 'Sérologie VIH', 'Bilan hépatique', 'Ionogramme', 'Hémoglobine glyquée'];

export function submenuIcon(item: string) {
  const map: Record<string, typeof Pill> = {
    'Vue d’ensemble': LayoutDashboard,
    'Demandes d’analyses': ClipboardList,
    'Résultats': CheckCircle2,
    'Prélèvements': TestTube2,
    'Stock réactifs': PackageSearch,
    'Patients': Users,
    'Inventaire': PackageSearch,
    'Délivrance': Pill,
    'Commandes': ClipboardList,
    'Fournisseurs': Users,
    'Admissions': Users,
    'Chambres': Hospital,
    'Sorties': CheckCircle2,
    'Transferts': ArrowUpRight,
    'Tri': AlertCircle,
    'Salles': Hospital,
    'Ambulances': HeartPulse,
    'Code rouge': AlertCircle,
    'Planning': CalendarDays,
    'Dossiers': Users,
    'Ordonnances': ClipboardList,
    'Suivi': Activity,
    'Radiologie': Activity,
    'Échographie': Activity,
    'IRM': Microscope,
    'Comptes rendus': ClipboardList,
    "Comptes": UserCog,
  };
  return map[item] ?? LayoutDashboard;
}
