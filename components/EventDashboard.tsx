import React, { useState } from 'react';
import { Attendee, EventMetadata } from '../types';
import { Button } from './Button';
import { generateMusicalReflection } from '../services/geminiService';

interface EventDashboardProps {
  attendees: Attendee[];
  eventMeta: EventMetadata;
  onUpdateMeta: (meta: EventMetadata) => void;
  reflection: string;
  onUpdateReflection: (reflection: string) => void;
  onClearData: () => void;
  onGenerateReport: () => void;
  onBack: () => void;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({
  attendees,
  eventMeta,
  onUpdateMeta,
  reflection,
  onUpdateReflection,
  onClearData,
  onGenerateReport,
  onBack
}) => {
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);

  const handleGenerateReflection = async () => {
    setIsLoadingReflection(true);
    const text = await generateMusicalReflection(attendees);
    onUpdateReflection(text);
    setIsLoadingReflection(false);
  };

  const exportData = () => {
    const data = {
      metadata: eventMeta,
      attendees: attendees,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-ensaio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 no-print">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">Voltar</Button>
        <h2 className="text-2xl font-bold text-slate-800">Painel do Evento</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-700 border-b pb-2">Informações de Cabeçalho</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Título da Reunião (Ex: Ensaio Regional, Reunião de Encarregados...)</label>
            <input
              value={eventMeta.eventTitle}
              onChange={e => onUpdateMeta({ ...eventMeta, eventTitle: e.target.value })}
              className="w-full p-3 border rounded-xl font-bold text-indigo-700 bg-indigo-50/30 focus:bg-white transition-colors"
              placeholder="Digite o nome da reunião ou ensaio"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Local do Evento</label>
            <input
              value={eventMeta.local}
              onChange={e => onUpdateMeta({ ...eventMeta, local: e.target.value })}
              className="w-full p-3 border rounded-xl"
              placeholder="Ex: Treze de Maio (Bairro Alto) - Central de Piracicaba/SP"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">ANCIÃO ATENDENTE</label>
            <input
              value={eventMeta.anciao}
              onChange={e => onUpdateMeta({ ...eventMeta, anciao: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">ENCARREGADOS REGIONAIS</label>
            <input
              value={eventMeta.regionais}
              onChange={e => onUpdateMeta({ ...eventMeta, regionais: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1 block">PALAVRA (EX: SALMOS 148)</label>
            <input
              value={eventMeta.palavra}
              onChange={e => onUpdateMeta({ ...eventMeta, palavra: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1 block">HINOS ENSAIADOS (EX: 267, 194, 247...)</label>
            <textarea
              value={eventMeta.hinos}
              onChange={e => onUpdateMeta({ ...eventMeta, hinos: e.target.value })}
              className="w-full p-3 border rounded-xl h-24"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
          <Button onClick={onGenerateReport} className="flex-1">GERAR RELATÓRIO OFICIAL</Button>
        </div>
      </div>

      <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <h3 className="font-bold text-indigo-400 mb-4 flex items-center gap-2">
          <span className="text-xl">✨</span> Mensagem para o Ensaio
        </h3>
        {reflection ? (
          <div className="text-sm leading-relaxed text-slate-300 italic mb-4">{reflection}</div>
        ) : (
          <p className="text-sm text-slate-400 italic mb-4">Gere um encorajamento baseado nos presentes.</p>
        )}
        <Button
          onClick={handleGenerateReflection}
          disabled={isLoadingReflection || attendees.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 text-sm py-2 px-6"
        >
          {isLoadingReflection ? 'Gerando...' : 'Gerar com IA'}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl border-2 border-rose-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h3 className="font-bold">Finalizar Ensaio</h3>
        </div>
        <p className="text-sm text-slate-600">
          Use esta opção apenas quando o ensaio terminar. Recomendamos baixar o backup antes de resetar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={exportData} variant="outline" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            BAIXAR BACKUP (JSON)
          </Button>
          <Button onClick={onClearData} variant="danger" className="flex-1">
            RESETAR PARA NOVO EVENTO
          </Button>
        </div>
      </div>
    </div>
  );
};
