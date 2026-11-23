import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { Activity, BookOpen, Clock, Download, TrendingUp, Users } from 'lucide-react';
import { diagnosticoAPI } from '../../../services/api';
import { gerarRelatorioDiagnosticoPDF } from '../../../components/Relatorios';
import './ResultadosDiagnostico.css';

const ResultadosDiagnostico = () => {
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarResultados();
    }, []);

    const carregarResultados = async () => {
        try {
            setLoading(true);
            const response = await diagnosticoAPI.buscarTodos();
            setResultados(response.data);
        } catch (error) {
            console.error("Erro ao carregar os resultados do diagnóstico", error);
        } finally {
            setLoading(false);
        }
    };

    // ── Lógica Matemática para KPIs e Gráficos ──
    const stats = useMemo(() => {
        if (!resultados || resultados.length === 0) return null;

        let totalSatisfacao = 0;
        let totalHoras = 0;
        const gargalosCount = {};
        const iaExperienciaCount = {};

        resultados.forEach(r => {
            totalSatisfacao += r.satisfacaoFerramentas || 0;
            totalHoras += r.horasPerdidasSemana || 0;

            const gargalo = r.etapaMaisDemorada || 'Não Informado';
            gargalosCount[gargalo] = (gargalosCount[gargalo] || 0) + 1;

            const expIA = r.nivelExperienciaIA || 'Não Informado';
            iaExperienciaCount[expIA] = (iaExperienciaCount[expIA] || 0) + 1;
        });

        const totalRespostas = resultados.length;

        // Dados para o Gráfico de Rosca (Gargalos)
        const gargalosChart = {
            labels: Object.keys(gargalosCount),
            datasets: [{
                data: Object.values(gargalosCount),
                backgroundColor: ['#ef4444', '#f97316', '#facc15', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'],
                borderWidth: 0
            }]
        };

        // Dados para o Gráfico de Barras (Experiência IA)
        const iaChart = {
            labels: Object.keys(iaExperienciaCount),
            datasets: [{
                label: 'Usuários por Nível de IA',
                data: Object.values(iaExperienciaCount),
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        };

        return {
            totalRespostas,
            mediaSatisfacao: (totalSatisfacao / totalRespostas).toFixed(1),
            totalHoras,
            gargalosChart,
            iaChart
        };
    }, [resultados]);

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { display: false } },
            y: { ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
    };

    const pieOptions = {
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 14 }
                }
            }
        },
        layout: { padding: 0 }
    };

    const chipsTemplate = (rowData, field) => {
        if (!rowData[field] || rowData[field].length === 0) return <span>-</span>;
        return (
            <div className="custom-tags-container">
                {rowData[field].map(tech => (
                    <Tag key={tech} value={tech} className="custom-tech-tag" />
                ))}
            </div>
        );
    };

    const ratingTemplate = (rowData) => {
        return <Rating value={rowData.satisfacaoFerramentas} readOnly cancel={false} stars={5} />;
    };

    const dataTemplate = (rowData) => {
        if (!rowData.dataCriacao) return "-";
        return new Date(rowData.dataCriacao).toLocaleDateString('pt-BR');
    };

    const horasPerdidasTemplate = (rowData) => {
        return <span className="horas-badge">{rowData.horasPerdidasSemana}h</span>;
    };

    const header = (
        <div className="table-header-admin">
            <div className="header-text">
                <h2>📋 Detalhamento do Formulário</h2>
                <p>Lista completa de todos os questionários submetidos.</p>
            </div>
            <div className="flex gap-2">
                <Button icon="pi pi-refresh" rounded raised className="btn-refresh" aria-label="Refresh" onClick={carregarResultados} tooltip="Atualizar Dados" tooltipOptions={{ position: 'bottom' }} />
            </div>
        </div>
    );

    return (
        <div className="resultados-diagnostico-container fade-in">

            {/* NOVO: HEADER DO DASHBOARD */}
            <div className="dashboard-header-modern">
                <div>
                    <h1><Activity size={28} color="#60a5fa" className="mr-2 inline-block align-middle" style={{ marginTop: '-4px' }} /> Painel do Diagnóstico</h1>
                    <p>Análise estratégica da eficiência da equipe técnica</p>
                </div>
                <button className="btn-pdf-export" onClick={() => gerarRelatorioDiagnosticoPDF(resultados, stats, 'Admin DGTI')}>
                    <Download size={18} /> Baixar Relatório (PDF)
                </button>
            </div>

            {/* NOVO: KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon icon-blue"><Users size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-value">{stats?.totalRespostas || 0}</span>
                        <span className="kpi-label">Respostas Coletadas</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon icon-orange"><BookOpen size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-value">{stats?.mediaSatisfacao || '0.0'}</span>
                        <span className="kpi-label">Média Satisfação (1-5)</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon icon-red"><Clock size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-value">{stats?.totalHoras || 0}h</span>
                        <span className="kpi-label">Soma Horas Perdidas (Semanal)</span>
                    </div>
                </div>
            </div>

            {/* NOVO: GRÁFICOS */}
            {stats && (
                <div className="dashboard-row mb-4">
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3><TrendingUp size={20} color="#f59e0b" /> Principais Gargalos (Tempo)</h3>
                        </div>
                        <div className="chart-body" style={{ height: '380px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Chart type="doughnut" data={stats.gargalosChart} options={pieOptions} style={{ width: '100%', height: '100%' }} />
                        </div>
                    </div>
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3><Activity size={20} color="#3b82f6" /> Familiaridade com I.A.</h3>
                        </div>
                        <div className="chart-body" style={{ height: '380px' }}>
                            <Chart type="bar" data={stats.iaChart} options={chartOptions} style={{ width: '100%', height: '100%' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* TABELA ORIGINAL REBAIXADA */}
            <div className="card-admin-table">
                <DataTable value={resultados} loading={loading} header={header}
                    paginator rows={10} 
                    paginatorTemplate={{
                        layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
                        RowsPerPageDropdown: (options) => {
                            const dropdownOptions = [
                                { label: 10, value: 10 },
                                { label: 25, value: 25 },
                                { label: 50, value: 50 }
                            ];
                            return (
                                <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} appendTo="self" className="p-paginator-rpp-options" style={{ marginLeft: '1rem', width: '4.5rem' }} />
                            );
                        }
                    }}
                    emptyMessage="Nenhuma resposta encontrada no banco de dados."
                    className="p-datatable-admin"
                    stripedRows>

                    <Column field="usuarioId" header="Usuário" sortable style={{ width: '14%' }}></Column>
                    <Column field="papel" header="Papel Principal" sortable style={{ width: '16%' }}></Column>
                    <Column header="Tecnologias" body={(r) => chipsTemplate(r, 'tecnologiasPrincipais')} style={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="satisfacaoFerramentas" header="Satisfação" body={ratingTemplate} sortable style={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="etapaMaisDemorada" header="Maior Gargalo" sortable style={{ width: '14%' }}></Column>
                    <Column field="horasPerdidasSemana" header="Tempo Perdido" body={horasPerdidasTemplate} sortable style={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="nivelExperienciaIA" header="Fam. IA" sortable style={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="dataCriacao" header="Data" body={dataTemplate} sortable style={{ width: '10%', textAlign: 'center' }}></Column>

                </DataTable>
            </div>
        </div>
    );
};

export default ResultadosDiagnostico;
