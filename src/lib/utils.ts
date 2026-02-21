import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins} min`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const gradients = [
  'from-primary-400 to-utah-red-400',
  'from-utah-navy-400 to-primary-400',
  'from-utah-red-400 to-primary-300',
  'from-primary-500 to-utah-navy-400',
  'from-utah-navy-300 to-utah-red-300',
  'from-primary-300 to-utah-navy-300',
];

export function getGradient(seed: string): string {
  const index = seed.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export const PACK_CATEGORIES = [
  { value: 'comunicacion', label: 'Comunicacion Digital' },
  { value: 'tecnologia', label: 'Tecnologia y Adolescentes' },
  { value: 'emocional', label: 'Inteligencia Emocional' },
  { value: 'educacion', label: 'Motivacion Escolar' },
  { value: 'relaciones', label: 'Relaciones Familiares' },
  { value: 'bienestar', label: 'Bienestar Familiar' },
];
