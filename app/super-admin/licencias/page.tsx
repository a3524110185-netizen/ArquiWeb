'use client';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { FileCheck, Users, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function LicenciasPage() {
  const { licencias } = useStore();
  const toast = useToast();

  const handleUpgrade = (empresa: string) => {
    toast.info('Actualización de plan', `Se ha enviado la solicitud de upgrade para ${empresa}.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {licencias.map(lic => {
          const isWarning = lic.estado === 'Por Vencer';
          return (
            <Card key={lic.id} className={`flex flex-col ${isWarning ? 'border-amber-500 shadow-amber-500/10 shadow-lg' : ''}`}>
              <CardHeader className="pb-4 border-b border-default">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={lic.plan === 'Empresarial' ? 'info' : lic.plan === 'Profesional' ? 'success' : 'gray'}>
                    Plan {lic.plan}
                  </Badge>
                  <Badge variant={isWarning ? 'warning' : 'success'}>
                    {lic.estado}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{lic.empresaNombre}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <Users size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Usuarios Activos</p>
                      <p className="font-semibold text-primary">
                        {lic.usuariosActuales} / {lic.maxUsuarios === 999 ? 'Ilimitado' : lic.maxUsuarios}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-12 h-12">
                    {/* Circle Progress simple */}
                    <svg viewBox="0 0 36 36" className="w-full h-full stroke-current text-blue-500">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                        strokeDasharray={`${(lic.usuariosActuales / (lic.maxUsuarios === 999 ? 100 : lic.maxUsuarios)) * 100}, 100`}
                        className="animate-[spin_1s_ease-out]"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-default pt-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Calendar size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Vencimiento</p>
                    <p className={`font-semibold ${isWarning ? 'text-amber-500' : 'text-primary'}`}>
                      {new Date(lic.fechaVencimiento).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {isWarning && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    Renovación requerida próximamente.
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <Button variant="secondary" className="w-full justify-center" onClick={() => handleUpgrade(lic.empresaNombre)}>
                    Cambiar Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
