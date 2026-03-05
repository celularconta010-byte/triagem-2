import React, { useState, useEffect, useRef } from 'react';
import { Attendee, Role, Level, ViewState, INSTRUMENTS, Ministry, EventMetadata } from './types';
import { Button } from './components/Button';
import { BRAZILIAN_CITIES } from './services/cities';
import { EventDashboard } from './components/EventDashboard';
import { PrintReport } from './components/PrintReport';
import { fetchAttendees, addAttendee, clearAllAttendees, fetchEventMetadata, saveEventMetadata, clearEventMetadata } from './services/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [ministry, setMinistry] = useState<Ministry>(Ministry.NONE);
  const [instrument, setInstrument] = useState('');
  const [level, setLevel] = useState<Level>(Level.MUSICIAN);
  const [city, setCity] = useState('');
  const [reflection, setReflection] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Custom Dropdown States for City
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const initialMeta: EventMetadata = {
    eventTitle: 'Ensaio Regional',
    local: '',
    date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    anciao: '',
    regionais: '',
    palavra: '',
    hinos: ''
  };

  // Event Metadata
  const [eventMeta, setEventMeta] = useState<EventMetadata>(initialMeta);

  // Dinamic Title for Printing - Helps naming the PDF file
  useEffect(() => {
    if (view === 'print') {
      const originalTitle = document.title;
      const cleanLocal = eventMeta.local.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      document.title = `Relatorio_Triagem_${cleanLocal || 'Ensaio'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`;
      return () => { document.title = originalTitle; };
    }
  }, [view, eventMeta.local]);

  // Carregar dados do Supabase ao iniciar
  useEffect(() => {
    const loadData = async () => {
      const [attendeesData, metaData] = await Promise.all([
        fetchAttendees(),
        fetchEventMetadata()
      ]);

      if (attendeesData.length > 0) {
        setAttendees(attendeesData);
      }

      if (metaData) {
        setEventMeta(metaData);
      }
    };

    loadData();
  }, []);

  // Salvar metadados do evento quando mudarem
  useEffect(() => {
    if (eventMeta.local || eventMeta.anciao || eventMeta.regionais || eventMeta.palavra || eventMeta.hinos) {
      saveEventMetadata(eventMeta);
    }
  }, [eventMeta]);

  // Click outside listener for city dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRegister = (role: Role) => {
    setSelectedRole(role);
    setInstrument(role === Role.ORGANIST ? 'Órgão' : '');
    setMinistry(Ministry.NONE);
    setLevel(Level.NONE);
    setCity('');
    setCitySearchTerm('');
    setView('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    const newAttendee: Attendee = {
      id: crypto.randomUUID(),
      ministry,
      role: selectedRole!,
      instrument: instrument || (selectedRole === Role.ORGANIST ? 'Órgão' : 'Não informado'),
      level: selectedRole === Role.ORGANIST ? Level.MUSICIAN : level,
      city,
      timestamp: Date.now(),
    };

    // Adicionar ao Supabase
    const success = await addAttendee(newAttendee);

    if (success) {
      setAttendees(prev => [newAttendee, ...prev]);
      setShowSuccess(true);

      // Reset Completo do formulário após registro
      setCity('');
      setCitySearchTerm('');
      setMinistry(Ministry.NONE);
      setInstrument(selectedRole === Role.ORGANIST ? 'Órgão' : '');
      setLevel(Level.NONE);

      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      alert('Erro ao salvar participante. Tente novamente.');
    }
  };


  const clearAllData = async () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os registros para iniciar um NOVO evento. Deseja continuar?')) {
      // Limpar dados do Supabase
      await Promise.all([
        clearAllAttendees(),
        clearEventMetadata()
      ]);

      // Limpar estado local
      setAttendees([]);
      setEventMeta({
        ...initialMeta,
        date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      });
      setReflection('');
      setView('landing');
    }
  };


  const filteredCities = BRAZILIAN_CITIES.filter(c =>
    c.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <style>{`
        /* Cores de Fundo (Grayscale) */
        .bg-gray-light { background-color: #f7fafc !important; }
        .bg-header-gray { background-color: #edf2f7 !important; }
        .bg-summary-gray { background-color: #f7fafc !important; }
        
        /* Utilitários de Borda */
        .border-k { border: 1px solid black !important; }
        .border-k-2 { border: 2px solid black !important; }
        .border-k-double { border: 4px double black !important; }

        /* Reset Geral para Impressão e Preview */
        * { box-sizing: border-box !important; }

        /* Container Principal do Relatório (Simula folha A4) */
        .print-view {
          background: white;
          color: black;
          font-family: "Times New Roman", serif;
          margin: 0 auto;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          width: 29.7cm;
          height: 21cm;
          overflow: hidden;
        }

        .print-columns-wrapper {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          width: 100% !important;
          height: 100% !important;
          background: white;
        }

        .print-column {
          flex: 0 0 33.33% !important;
          height: 100% !important;
          padding: 1cm 0.6cm;
          display: flex;
          flex-direction: column;
          border-right: 1px solid black !important;
        }

        .print-column:last-child {
          border-right: none !important;
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th, td { border: 1px solid black; padding: 4px 6px; font-size: 8.5pt; color: black; line-height: 1.2; }
        th { font-weight: bold; text-align: left; }

        @media print {
          @page { margin: 0; size: A4 landscape; }
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-view { box-shadow: none !important; border: none !important; margin: 0 !important; width: 29.7cm !important; height: 21cm !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .print-only { display: none; }
        @media print { .print-only { display: block !important; } }
      `}</style>

      {/* Main UI */}
      {view !== 'print' && (
        <header className="w-full max-w-4xl px-6 py-8 flex flex-col items-center no-print">
          <div className="bg-white p-3 rounded-full shadow-sm mb-4">
            <span className="text-3xl">🎺</span>
          </div>
          <h1 className="title-font text-3xl font-bold text-slate-800">Triage Musical</h1>
          <p className="text-slate-400">CCB - Regional</p>
        </header>
      )}

      <main className={`w-full ${view === 'print' ? 'max-w-none p-0' : 'max-w-2xl px-4'} mb-20`}>

        {view === 'landing' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleRegister(Role.MUSICIAN)}
                className="h-48 bg-white border-2 border-indigo-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:shadow-xl transition-all group"
              >
                <div className="p-4 bg-indigo-50 rounded-full group-hover:bg-indigo-100">
                  <span className="text-4xl">🎻</span>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xl text-slate-800">Irmãos</h3>
                  <p className="text-slate-500">Músicos</p>
                </div>
              </button>

              <button
                onClick={() => handleRegister(Role.ORGANIST)}
                className="h-48 bg-white border-2 border-emerald-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-emerald-400 hover:shadow-xl transition-all group"
              >
                <div className="p-4 bg-emerald-50 rounded-full group-hover:bg-emerald-100">
                  <span className="text-4xl">🎹</span>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xl text-slate-800">Irmãs</h3>
                  <p className="text-slate-500">Organistas</p>
                </div>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Painel do Evento</h4>
                <p className="text-sm text-slate-500">{attendees.length} presentes registrados</p>
              </div>
              <Button onClick={() => setView('dashboard')} variant="outline">Configurar e Relatórios</Button>
            </div>
          </div>
        )}

        {view === 'form' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <Button onClick={() => setView('landing')} variant="outline" className="px-2 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Button>
              <h2 className="text-2xl font-bold text-slate-800">Registro: {selectedRole}</h2>
            </div>

            {showSuccess && (
              <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mb-6 text-center font-bold animate-in fade-in zoom-in-95 duration-200">
                Inscrito com sucesso!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  {selectedRole === Role.ORGANIST ? 'Cargo' : 'Ministério'}
                </label>
                <select
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value as Ministry)}
                  className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  {(selectedRole === Role.ORGANIST
                    ? [Ministry.NONE, Ministry.EXAMINADORA, Ministry.INSTRUTORA, Ministry.ORGANISTA]
                    : [Ministry.NONE, Ministry.ANCIAO, Ministry.DIACONO, Ministry.COOPERADOR_OFICIO, Ministry.COOPERADOR_JOVENS]
                  ).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {selectedRole === Role.MUSICIAN && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Instrumento</label>
                    <select
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value)}
                      className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      <option value="">Selecione o Instrumento</option>
                      {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Cargo</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as Level)}
                      className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="relative" ref={cityDropdownRef}>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Cidade / Localidade <span className="text-rose-500">*</span></label>
                <div
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className={`w-full p-4 bg-white border rounded-xl flex justify-between items-center cursor-pointer ${!city ? 'border-amber-300' : 'border-slate-300'}`}
                >
                  <span className={city ? 'text-slate-900' : 'text-slate-400'}>{city || 'Selecione a cidade'}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
                {isCityDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                    <div className="p-3 border-b sticky top-0 bg-white">
                      <input
                        autoFocus
                        type="text"
                        value={citySearchTerm}
                        onChange={e => setCitySearchTerm(e.target.value)}
                        placeholder="Buscar cidade..."
                        className="w-full p-2 border rounded-lg focus:border-indigo-400 outline-none"
                      />
                    </div>
                    {filteredCities.map(c => (
                      <div key={c} onClick={() => { setCity(c); setIsCityDropdownOpen(false); }} className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0">
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={!city}
                className="w-full py-5 text-xl font-bold rounded-2xl shadow-lg"
                variant={selectedRole === Role.MUSICIAN ? 'primary' : 'secondary'}
              >
                REGISTRAR PRESENÇA
              </Button>
            </form>
          </div>
        )}

        {view === 'dashboard' && (
          <EventDashboard
            attendees={attendees}
            eventMeta={eventMeta}
            onUpdateMeta={setEventMeta}
            reflection={reflection}
            onUpdateReflection={setReflection}
            onClearData={clearAllData}
            onGenerateReport={() => setView('print')}
            onBack={() => setView('landing')}
          />
        )}

        {view === 'print' && (
          <PrintReport
            attendees={attendees}
            eventMeta={eventMeta}
            onBack={() => setView('dashboard')}
          />
        )}
      </main>

      {view !== 'landing' && view !== 'print' && (
        <div className="fixed bottom-6 right-6 no-print">
          <Button
            onClick={() => setView('landing')}
            className="w-14 h-14 rounded-full flex items-center justify-center p-0 shadow-2xl bg-indigo-600 text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;
