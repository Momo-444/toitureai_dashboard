import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'signe' | 'envoye' | 'accepte' | 'refuse' | 'payes' 
  | 'nouveau' | 'contacte' | 'qualifie' | 'devis_envoye' | 'chaud' | 'perdu';

interface StatusBadgeProps {
  statut: StatusType | string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  signe: { color: 'bg-purple-500 hover:bg-purple-600', label: 'Signé' },
  envoye: { color: 'bg-green-500 hover:bg-green-600', label: 'Envoyé' },
  accepte: { color: 'bg-emerald-500 hover:bg-emerald-600', label: 'Accepté' },
  refuse: { color: 'bg-red-500 hover:bg-red-600', label: 'Refusé' },
  payes: { color: 'bg-blue-500 hover:bg-blue-600', label: 'Payés' },

  nouveau: { color: 'bg-blue-500 hover:bg-blue-600', label: 'Nouveau' },
  contacte: { color: 'bg-purple-500 hover:bg-purple-600', label: 'Contacté' },
  qualifie: { color: 'bg-emerald-500 hover:bg-emerald-600', label: 'Qualifié' },
  devis_envoye: { color: 'bg-orange-500 hover:bg-orange-600', label: 'Devis envoyé' },
  chaud: { color: 'bg-lime-500 hover:bg-lime-600', label: 'Chaud' },
  perdu: { color: 'bg-gray-500 hover:bg-gray-600', label: 'Perdu' },
};

export const StatusBadge = ({ statut }: StatusBadgeProps) => {
  const config = statusConfig[statut] || { color: 'bg-gray-500 hover:bg-gray-600', label: statut || 'Inconnu' };

  return (
    <Badge className={cn("border-transparent text-white font-medium", config.color)}>
      {config.label}
    </Badge>
  );
};
