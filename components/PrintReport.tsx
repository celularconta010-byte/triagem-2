import React from 'react';
import { Attendee, EventMetadata, INSTRUMENT_GROUPS, Ministry, Level, Role } from '../types';
import { Button } from './Button';

interface PrintReportProps {
    attendees: Attendee[];
    eventMeta: EventMetadata;
    onBack: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ attendees, eventMeta, onBack }) => {
    console.log('PrintReport: Renderizando componente v3 (3 colunas)');
    const getInstrumentCount = (name: string) => attendees.filter(a => a.instrument === name).length;
    const getNaipeCount = (naipe: keyof typeof INSTRUMENT_GROUPS) => {
        return attendees.filter(a => INSTRUMENT_GROUPS[naipe].includes(a.instrument)).length;
    };

    const organistasCount = attendees.filter(a => a.role === Role.ORGANIST).length;
    const musicosCount = attendees.filter(a => a.role === Role.MUSICIAN).length;
    const totalGeral = attendees.length;

    // Calculate unique cities
    const uniqueCitiesCount = new Set(attendees.map(a => a.city)).size;

    const registeredCordas = INSTRUMENT_GROUPS.Cordas.filter(i => getInstrumentCount(i) > 0);
    const registeredMadeiras = INSTRUMENT_GROUPS.Madeiras.filter(i => getInstrumentCount(i) > 0);
    const registeredMetais = INSTRUMENT_GROUPS.Metais.filter(i => getInstrumentCount(i) > 0);
    const registeredOutros = INSTRUMENT_GROUPS.Outros.filter(i => getInstrumentCount(i) > 0);

    return (
        <div className="print-view bg-white min-h-screen text-black">
            <div className="no-print mb-8 p-6 bg-indigo-50 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm border border-indigo-100">
                <div className="flex-1">
                    <h3 className="font-bold text-indigo-900">Configuração de Impressão</h3>
                    <p className="text-xs text-indigo-700 mt-1">
                        💡 <strong>IMPORTANTE:</strong> Na tela que abrir, clique em <strong>"Mais definições"</strong> e marque a caixa <strong>"Gráficos de segundo plano"</strong> para as cores aparecerem no papel.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={onBack} variant="outline">Voltar</Button>
                    <Button onClick={() => window.print()} className="shadow-lg px-8 bg-indigo-600">IMPRIMIR RELATÓRIO</Button>
                </div>
            </div>

            <div className="max-w-full print:block">
                <div className="print-columns-wrapper">
                    {/* Coluna 1: ESQUERDA - Logo e Informações */}
                    <div className="print-column py-6">
                        <div className="flex flex-col items-center mb-8">
                            <div className="text-center border-k-double p-2 w-full">
                                <div className="font-bold text-[8pt] uppercase">Congregação Cristã no Brasil</div>
                            </div>
                            <div className="mt-8 text-center space-y-4">
                                <div className="font-bold text-[14pt] uppercase underline decoration-2">Ensaio Regional</div>
                                <div className="text-[11pt] font-bold uppercase mt-4">Local: {eventMeta.local || '___________________'}</div>
                                <div className="text-[11pt] font-bold uppercase">Ancião: {eventMeta.anciao || '___________________'}</div>
                                <div className="text-[11pt] font-bold uppercase">Palavra: {eventMeta.palavra || '___________________'}</div>
                                <div className="text-[11pt] font-bold uppercase">
                                    {eventMeta.date.split(/ às| at/i)[0]}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 border-k border-dashed mt-4"></div>
                    </div>

                    {/* Coluna 2: MEIO - Em Branco */}
                    <div className="print-column">
                        <div className="flex-1"></div>
                    </div>

                    {/* Coluna 3: DIREITA - Estatísticas */}
                    <div className="print-column py-6">
                        <div className="bg-header-gray p-2 border-k font-bold text-center mb-4 uppercase text-[10pt]">
                            Resumo
                        </div>

                        {/* 1. Ministério em Atendimento */}
                        <table className="border-k mb-4">
                            <thead>
                                <tr className="bg-header-gray">
                                    <th className="text-[8pt]">Ministério em Atendimento</th>
                                    <th className="w-12 text-[8pt]">Qtd.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="text-[8pt] font-medium">Anciães</td><td className="text-center font-bold">{attendees.filter(a => a.ministry === Ministry.ANCIAO).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Diáconos</td><td className="text-center font-bold">{attendees.filter(a => a.ministry === Ministry.DIACONO).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Coop. do Ofício Ministerial</td><td className="text-center font-bold">{attendees.filter(a => a.ministry === Ministry.COOPERADOR_OFICIO).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Coop. de Jovens e Menores</td><td className="text-center font-bold">{attendees.filter(a => a.ministry === Ministry.COOPERADOR_JOVENS).length}</td></tr>
                                <tr className="bg-slate-50 font-bold border-t-2 border-black">
                                    <td className="text-[8pt] uppercase">Total do Ministério</td>
                                    <td className="text-center">{
                                        attendees.filter(a => [
                                            Ministry.ANCIAO, Ministry.DIACONO, Ministry.COOPERADOR_OFICIO,
                                            Ministry.COOPERADOR_JOVENS
                                        ].includes(a.ministry)).length
                                    }</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 2. Resumo da Orquestra */}
                        <table className="border-k mb-4">
                            <thead>
                                <tr className="bg-header-gray">
                                    <th className="text-[8pt]">Resumo da Orquestra</th>
                                    <th className="w-12 text-[8pt]">Qtd.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="text-[8pt] font-medium">Encarregado Regional</td><td className="text-center font-bold">{attendees.filter(a => a.level === Level.REGIONAL).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Encarregado Local</td><td className="text-center font-bold">{attendees.filter(a => a.level === Level.LOCAL).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Examinadora</td><td className="text-center font-bold">{attendees.filter(a => a.ministry === Ministry.EXAMINADORA).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Instrutor</td><td className="text-center font-bold">{attendees.filter(a => a.level === Level.INSTRUCTOR).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Instrutora</td><td className="text-center font-bold">{attendees.filter(a => a.ministry === Ministry.INSTRUTORA).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Músico</td><td className="text-center font-bold">{attendees.filter(a => a.role === Role.MUSICIAN && ![Level.REGIONAL, Level.LOCAL, Level.INSTRUCTOR].includes(a.level)).length}</td></tr>
                                <tr><td className="text-[8pt] font-medium">Organista</td><td className="text-center font-bold">{attendees.filter(a => a.role === Role.ORGANIST && ![Ministry.EXAMINADORA, Ministry.INSTRUTORA].includes(a.ministry)).length}</td></tr>

                                <tr className="bg-summary-yellow font-bold border-t-2 border-black">
                                    <td className="uppercase text-[8pt]">Total da Orquestra</td>
                                    <td className="text-center">{
                                        attendees.filter(a => a.role === Role.MUSICIAN || a.role === Role.ORGANIST).length
                                    }</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 3. Distribuição / Naipes */}
                        <table className="border-k mb-4">
                            <thead>
                                <tr className="bg-header-gray">
                                    <th className="text-[8pt]">Distribuição / Naipes</th>
                                    <th className="w-12 text-[8pt]">Qtd.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="text-[9pt]">Cordas</td><td className="text-center font-bold bg-cordas">{getNaipeCount('Cordas')}</td></tr>
                                <tr><td className="text-[9pt]">Madeiras</td><td className="text-center font-bold bg-madeiras">{getNaipeCount('Madeiras')}</td></tr>
                                <tr><td className="text-[9pt]">Metais</td><td className="text-center font-bold bg-metais">{getNaipeCount('Metais')}</td></tr>
                                <tr><td className="text-[9pt]">Outros</td><td className="text-center font-bold bg-outros">{getNaipeCount('Outros')}</td></tr>
                            </tbody>
                        </table>

                        <div className="mt-auto pt-4 border-t border-black flex justify-between items-end">
                            <div className="text-[6pt] uppercase font-bold">Secretaria Musical</div>
                            <div className="text-[6pt] italic">Triagem Musical</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
