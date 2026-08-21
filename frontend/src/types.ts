import type { LucideIcon } from 'lucide-react';

export type ModuleId = 'pharmacie' | 'hopital' | 'laboratoire' | 'urgences' | 'consultations' | 'imagerie' | 'utilisateurs';
export type View = 'modules' | ModuleId;
export type LabSection =
  | 'Vue d’ensemble'
  | 'Demandes d’analyses'
  | 'Résultats'
  | 'Prélèvements'
  | 'Stock réactifs'
  | 'Patients';
export type AnalysisStatus = 'En attente' | 'En cours' | 'Terminé';

export type Analysis = {
  id: string;
  patient: string;
  initials: string;
  type: string;
  doctor: string;
  received: string;
  status: AnalysisStatus;
  result?: string;
  unit?: string;
  reference?: string;
};

export type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  bloodType: string;
  email: string;
  address: string;
};

export type Sample = {
  id: string;
  patient: string;
  type: 'Sang' | 'Urine' | 'Salive' | 'Tissu';
  tube: string;
  collectedAt: string;
  status: 'Reçu' | 'En analyse' | 'Archivé';
};

export type Reagent = {
  id: string;
  name: string;
  reference: string;
  quantity: number;
  unit: string;
  threshold: number;
  maxStock: number;
};

export type Module = {
  id: ModuleId;
  name: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  count: string;
  active: boolean;
  submenu: string[];
};

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  enabled: boolean;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
};

export type AppRole = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
};
