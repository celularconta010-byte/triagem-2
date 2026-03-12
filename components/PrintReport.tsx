import React from 'react';
import { Attendee, EventMetadata, INSTRUMENT_GROUPS, Ministry, Level, Role } from '../types';
import { Button } from './Button';


interface PrintReportProps {
    attendees: Attendee[];
    eventMeta: EventMetadata;
    onBack: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ attendees, eventMeta, onBack }) => {
    const getInstrumentCount = (name: string) => attendees.filter(a => a.instrument === name).length;

    const getNaipeCount = (naipe: keyof typeof INSTRUMENT_GROUPS) => {
        return attendees.filter(a => INSTRUMENT_GROUPS[naipe].includes(a.instrument)).length;
    };

    const organistasCount = attendees.filter(a => a.role === Role.ORGANIST).length;
    const musicosCount = attendees.filter(a => a.role === Role.MUSICIAN).length;
    const uniqueCitiesCount = new Set(attendees.map(a => a.city)).size;

    const registeredInstruments = [
        ...INSTRUMENT_GROUPS.Cordas,
        ...INSTRUMENT_GROUPS.Madeiras,
        ...INSTRUMENT_GROUPS.Metais
    ].filter(i => getInstrumentCount(i) > 0);



    return (
        <div className="min-h-screen bg-slate-100 p-4 print:p-0 no-print-bg">
            <div className="max-w-[29.7cm] mx-auto mb-6 flex justify-between items-center no-print">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg text-xl">
                        🖨️
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Relatório de Ensaio</h1>
                        <p className="text-sm text-slate-500">Visualização de Impressão A4 Paisagem</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onBack} className="px-4 py-2 border rounded-lg hover:bg-white transition-colors">Voltar</button>
                    <Button onClick={() => window.print()} className="shadow-lg px-8 bg-indigo-600 text-white">IMPRIMIR RELATÓRIO</Button>
                </div>
            </div>

            <div className="print-canvas shadow-2xl h-[21cm] w-[29.7cm] mx-auto relative overflow-hidden flex bg-white bg-[url('/bg-relatorio.png')] bg-[length:100%_100%] bg-center bg-no-repeat">
                <div className="canvas-content w-full h-full grid grid-cols-[8cm_1fr_1fr] gap-4 p-4 z-10">
                    {/* Coluna 1: Identidade */}
                    <div className="print-column flex flex-col h-full border-r border-slate-300 pr-4">
                        <div className="mb-8 flex-1 mt-40">
                            <h1 className="text-3xl font-black uppercase text-slate-800 tracking-tight leading-none mb-12 text-center">
                                {eventMeta.eventTitle || 'ENSAIO REGIONAL'}
                            </h1>
                            
                            <div className="space-y-6 px-4">
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Atendimento</span>
                                    <span className="block text-xl font-bold uppercase text-slate-700">{eventMeta.regionais || 'Não informado'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Ancião</span>
                                    <span className="block text-xl font-bold uppercase text-slate-700">{eventMeta.anciao || 'Não informado'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Palavra</span>
                                    <span className="block text-xl font-bold uppercase text-slate-700">{eventMeta.palavra || 'Não informado'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-200 text-center">
                            <div className="text-xl font-bold text-slate-900">{eventMeta.local || 'Local não informado'}</div>
                            <div className="text-md text-slate-600 mt-1">{eventMeta.date || ''}</div>
                        </div>
                    </div>

                    {/* Coluna 2: Instrumental */}
                    <div className="print-column">
                        <div className="section-header">Instrumentos</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th className="qty-cell">Qtd.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredInstruments.map((inst, idx) => (
                                    <tr key={inst} className={idx % 2 !== 0 ? 'row-alt' : ''}>
                                        <td className="uppercase font-medium">{inst}</td>
                                        <td className="qty-cell">{getInstrumentCount(inst)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="section-header mt-4">Categoria</div>
                        <table>
                            <tbody>
                                <tr><td>Cordas</td><td className="qty-cell">{getNaipeCount('Cordas')}</td></tr>
                                <tr className="row-alt"><td>Madeiras</td><td className="qty-cell">{getNaipeCount('Madeiras')}</td></tr>
                                <tr><td>Metais</td><td className="qty-cell">{getNaipeCount('Metais')}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Coluna 3: Resumo */}
                    <div className="print-column">
                        <div className="section-header">Resumo</div>

                        <table className="mb-4">
                            <thead><tr><th>Ministério</th><th className="qty-cell">Qtd.</th></tr></thead>
                            <tbody>
                                <tr><td>Anciães</td><td className="qty-cell">{attendees.filter(a => a.ministry === Ministry.ANCIAO).length}</td></tr>
                                <tr className="row-alt"><td>Diáconos</td><td className="qty-cell">{attendees.filter(a => a.ministry === Ministry.DIACONO).length}</td></tr>
                                <tr><td>Coop. do Ofício Ministerial</td><td className="qty-cell">{attendees.filter(a => a.ministry === Ministry.COOPERADOR_OFICIO).length}</td></tr>
                                <tr className="row-alt"><td>Coop. de Jovens e Menores</td><td className="qty-cell">{attendees.filter(a => a.ministry === Ministry.COOPERADOR_JOVENS).length}</td></tr>
                                <tr className="font-bold bg-slate-200"><td>Total do Ministério</td><td className="qty-cell">{attendees.filter(a => [Ministry.ANCIAO, Ministry.DIACONO, Ministry.COOPERADOR_OFICIO, Ministry.COOPERADOR_JOVENS].includes(a.ministry)).length}</td></tr>
                            </tbody>
                        </table>

                        <table className="mb-4">
                            <thead><tr><th>Cargos</th><th className="qty-cell">Qtd.</th></tr></thead>
                            <tbody>
                                <tr><td>Encarregado Regional</td><td className="qty-cell">{attendees.filter(a => a.level === Level.REGIONAL).length}</td></tr>
                                <tr className="row-alt"><td>Encarregado Local</td><td className="qty-cell">{attendees.filter(a => a.level === Level.LOCAL).length}</td></tr>
                                <tr><td>Examinadora</td><td className="qty-cell">{attendees.filter(a => a.ministry === Ministry.EXAMINADORA).length}</td></tr>
                                <tr className="row-alt"><td>Instrutor</td><td className="qty-cell">{attendees.filter(a => a.level === Level.INSTRUCTOR).length}</td></tr>
                                <tr><td>Instrutora</td><td className="qty-cell">{attendees.filter(a => a.ministry === Ministry.INSTRUTORA).length}</td></tr>
                            </tbody>
                        </table>

                        <table className="mb-4">
                            <thead><tr><th>Orquestra</th><th className="qty-cell">Qtd.</th></tr></thead>
                            <tbody>
                                <tr><td>Músicos</td><td className="qty-cell">{musicosCount}</td></tr>
                                <tr className="row-alt"><td>Organistas</td><td className="qty-cell">{organistasCount}</td></tr>
                                <tr className="font-bold bg-slate-200"><td>Total Geral</td><td className="qty-cell">{attendees.length}</td></tr>
                            </tbody>
                        </table>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <table className="mb-0">
                                <thead><tr><th>Cidades</th><th className="qty-cell">Qtd.</th></tr></thead>
                                <tbody><tr><td>Localidades</td><td className="qty-cell">{uniqueCitiesCount}</td></tr></tbody>
                            </table>
                            <table className="mb-0">
                                <thead><tr><th>Hinos</th><th className="qty-cell">Tot.</th></tr></thead>
                                <tbody><tr><td className="text-[6pt] truncate max-w-[80px]">{eventMeta.hinos || '-'}</td><td className="qty-cell">{eventMeta.hinos ? eventMeta.hinos.split(/[,;| ]+/).filter(h => h.trim() !== '').length : 0}</td></tr></tbody>
                            </table>
                        </div>

                        <div className="col-3-footer">
                            <span>Secretaria Musical</span>
                            <span className="brand-italic">Triagem Musical</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
