import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Users, BookOpen, Star, Activity, Eye, TrendingUp, Trophy, Heart, Download } from 'lucide-react';
import { gerarRelatorioPDF } from '../../Relatorios';
import { Chart } from 'primereact/chart';
import './DashboardEstatisticas.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, LineElement, PointElement);

const DashboardEstatisticas = ({ stats, nomeUsuario }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
      x: { grid: { display: false }, ticks: { color: '#64748b' } }
    }
  };

  const doughnutData = {
    labels: ['5 Excelente', '4 Muito Bom', '3 Razoável', '2 Ruim', '1 Péssimo'],
    datasets: [{
      data: [
        stats?.distribuicaoNotas?.cincoEstrelas || 0,
        stats?.distribuicaoNotas?.quatroEstrelas || 0,
        stats?.distribuicaoNotas?.tresEstrelas || 0,
        stats?.distribuicaoNotas?.duasEstrelas || 0, 
        stats?.distribuicaoNotas?.umaEstrela || 0    
      ],
      backgroundColor: ['#10b981', '#3b82f6', '#facc15', '#f97316', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels: stats?.evolucaoAnual?.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Acessos',
        data: stats?.evolucaoAnual?.acessos || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="admin-stats-container">
      
      {/* HEADER */}
      <div className="stats-header">
        <div>
          <h2><Activity size={28} color="#60a5fa" /> Painel de Controle DGTI</h2>
          <p>Dados reais extraídos do banco de dados da Biblioteca de Prompts</p>
        </div>
        <button className="btn-pdf-export" onClick={() => gerarRelatorioPDF(stats, nomeUsuario)}>
          <Download size={18} /> Baixar Relatório PDF
        </button>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-blue"><BookOpen size={24} /></div>
          <div className="kpi-info"><span className="kpi-value">{stats?.totalPrompts || 0}</span><span className="kpi-label">Prompts</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon icon-purple"><Users size={24} /></div>
          <div className="kpi-info"><span className="kpi-value">{stats?.contribuidoresAtivos || 0}</span><span className="kpi-label">Autores</span></div>
        </div>

        {/* ALTERADO: Agora exibe "Usos" no lugar de "Visualizações" */}
        <div className="kpi-card">
          <div className="kpi-icon icon-green"><TrendingUp size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-value">{stats?.totalUsosSemana || 0}</span>
            <span className="kpi-label">Usos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-orange"><Star size={24} /></div>
          <div className="kpi-info"><span className="kpi-value">{stats?.mediaSatisfacao || "0.0"}</span><span className="kpi-label">Média</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon icon-red"><Heart size={24} /></div>
          <div className="kpi-info"><span className="kpi-value">{stats?.totalFavoritos || 0}</span><span className="kpi-label">Favoritos</span></div>
        </div>
      </div>

      {/* LINHA 1: USO POR CATEGORIA E EVOLUÇÃO */}
      <div className="dashboard-row">
        <div className="chart-card">
          <div className="chart-header"><h3><TrendingUp size={20} color="#3b82f6"/> Uso por Categoria</h3></div>
          <div className="chart-body">
            <Bar data={{
              labels: stats?.usoPorCategoria ? Object.keys(stats.usoPorCategoria) : [],
              datasets: [{ label: 'Usos', data: stats?.usoPorCategoria ? Object.values(stats.usoPorCategoria) : [], backgroundColor: '#3b82f6', borderRadius: 6 }]
            }} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3><Activity size={20} color="#60a5fa"/> Evolução de Adoção (2026)</h3></div>
          <div className="chart-body">
            <Chart type="line" data={lineData} options={chartOptions} style={{height: '100%'}} />
          </div>
        </div>
      </div>

      {/* LINHA 2: QUALIDADE E TOP RANKING */}
      <div className="dashboard-row">
        <div className="chart-card">
          <div className="chart-header"><h3><Star size={20} color="#f59e0b"/> Qualidade dos Prompts</h3></div>
          <div className="chart-body">
            <Doughnut data={doughnutData} options={{...chartOptions, scales: {}}} />
          </div>
        </div>

        <div className="recent-activity-card">
          <div className="chart-header"><h3><Trophy size={20} color="#fbbf24"/> Top 5 Prompts Mais Usados</h3></div>
          <ul className="activity-list">
            {stats?.topPrompts?.map((prompt, index) => (
              <li key={index}>
                <div>
                  <strong style={{ color: index === 0 ? '#fbbf24' : 'white' }}>{index + 1}º {prompt.titulo}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{prompt.categoria}</div>
                </div>
                <span className="badge-usos">🔥 {prompt.usos}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
    </div>
  );
};

export default DashboardEstatisticas;