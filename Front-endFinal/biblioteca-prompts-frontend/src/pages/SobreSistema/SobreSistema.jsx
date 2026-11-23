import React from 'react';
import { Shield, BrainCircuit, Database, Zap, Layout, Users, Activity, BarChart, Lock } from 'lucide-react';
import "./SobreSistema.css";

const SobreSistema = () => {
  return (
    //  Adiciona a classe 'horizontal-layout' para ativar o novo estilo
    <div className="sobre-container horizontal-layout">
      <div className="sobre-card-principal">
        <div className="sobre-banner">
          <h2>A Biblioteca de Prompts</h2>
          <p>Plataforma de Produtividade e Inteligência Técnica</p>
        </div>

        <div className="sobre-conteudo">
          <p className="sobre-texto-destaque">
            A <strong>Biblioteca de Prompts</strong> é a plataforma institucional da Diretoria Geral de
            Tecnologia da Informação (DGTI) da UERJ para o uso de inteligência artificial no trabalho.
            Reúne um acervo compartilhado de prompts, organizado por área de atuação, e um Arquiteto
            Virtual que executa os modelos em infraestrutura da própria Universidade — sem que código
            ou dado institucional saia do perímetro da rede da UERJ.
          </p>

          <div className="sobre-grid">
            {/* ── Cards Operacionais ── */}
            <div className="sobre-feature">
              <span className="selo-estado selo-operacional">Operacional</span>
              <div className="feature-icone icon-purple"><Database size={28} /></div>
              <h3>Gestão do Conhecimento</h3>
              <p>Repositório central de prompts, padrões arquiteturais e requisitos, com versionamento e histórico de autoria.</p>
            </div>
            <div className="sobre-feature">
              <span className="selo-estado selo-operacional">Operacional</span>
              <div className="feature-icone icon-blue"><BrainCircuit size={28} /></div>
              <h3>IA Local (Ollama)</h3>
              <p>Geração assistida por modelos self-hosted via Ollama (Llama e Qwen3), executados em servidor interno.</p>
            </div>
            <div className="sobre-feature">
              <span className="selo-estado selo-operacional">Operacional</span>
              <div className="feature-icone icon-green"><Shield size={28} /></div>
              <h3>Soberania de Dados</h3>
              <p>Nenhum dado institucional é enviado a nuvens externas. A inferência ocorre integralmente em servidor da DGTI, dentro do perímetro da rede da UERJ.</p>
            </div>
            <div className="sobre-feature">
              <span className="selo-estado selo-operacional">Operacional</span>
              <div className="feature-icone icon-orange"><Zap size={28} /></div>
              <h3>Produtividade</h3>
              <p>Modelos de prompt prontos para as etapas recorrentes do ciclo de desenvolvimento, reduzindo o tempo de escrita de documentação técnica.</p>
            </div>
            <div className="sobre-feature">
              <span className="selo-estado selo-operacional">Operacional</span>
              <div className="feature-icone icon-indigo"><Layout size={28} /></div>
              <h3>Padronização Técnica</h3>
              <p>Aplica automaticamente, a cada geração, a persona e as diretrizes técnicas definidas pela DGTI para a categoria selecionada.</p>
            </div>
            <div className="sobre-feature">
              <span className="selo-estado selo-operacional">Operacional</span>
              <div className="feature-icone icon-pink"><Users size={28} /></div>
              <h3>Cultura Colaborativa</h3>
              <p>Espaço para a equipe compartilhar e evoluir o conhecimento técnico do ecossistema UERJ.</p>
            </div>
            <div className="sobre-feature">
              <span className="selo-estado selo-operacional">Operacional</span>
              <div className="feature-icone icon-purple"><Lock size={28} /></div>
              <h3>Segurança (SSO)</h3>
              <p>Autenticação única via Keycloak (OIDC) com segundo fator e controle de acesso por papéis. Solução open source, sem custo de licenciamento.</p>
            </div>
            {/* ── Cards Em Desenvolvimento ── */}
            <div className="sobre-feature card-em-desenvolvimento">
              <span className="selo-estado selo-desenvolvimento">Em desenvolvimento</span>
              <div className="feature-icone icon-blue"><Activity size={28} /></div>
              <h3>Diagnóstico Contínuo</h3>
              <p>Pesquisas integradas para mapear gargalos operacionais e identificar oportunidades de melhoria técnica na equipe.</p>
            </div>
            <div className="sobre-feature card-em-desenvolvimento">
              <span className="selo-estado selo-desenvolvimento">Em desenvolvimento</span>
              <div className="feature-icone icon-orange"><BarChart size={28} /></div>
              <h3>Dashboards Gerenciais</h3>
              <p>Monitoramento em tempo real de KPIs de engenharia com geração automatizada de relatórios executivos em PDF.</p>
            </div>
          </div>

          <div className="sobre-rodape">
            {/* Rodapé técnico em duas colunas */}
            <div className="rodape-coluna">
              <h4>Informações Técnicas</h4>
              <ul>
                <li><strong>Versão:</strong> 1.0.0</li>
                <li><strong>Desenvolvimento:</strong> Leonardo Silva de Melo</li>
              </ul>
            </div>
            <div className="rodape-coluna">
              <h4>Stack &amp; Instituição</h4>
              <ul>
                <li><strong>Stack:</strong> React, Spring Boot 3, Java 17, PostgreSQL, Keycloak, Docker</li>
                <li><strong>Instituição:</strong> Universidade do Estado do Rio de Janeiro (UERJ)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SobreSistema;