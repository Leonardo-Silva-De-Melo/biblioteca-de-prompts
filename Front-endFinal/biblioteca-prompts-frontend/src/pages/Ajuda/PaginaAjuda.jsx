import React, { useState } from 'react';
import { 
  Home, HelpCircle, Sparkles, Settings, MessageCircle, LifeBuoy,
  ChevronRight, CheckCircle, Star, Clock, Heart, FileText, History,
  Sun, Moon, Copy, Edit, Trash2, Eye, Search, Filter, Download, Beaker, ArrowRight, Database, Shield, Lock
} from 'lucide-react';
import './PaginaAjuda.css';

const PaginaAjuda = () => {
  const [secaoAberta, setSecaoAberta] = useState('inicio');
  const [faqAberta, setFaqAberta] = useState(null);

  const toggleFaq = (index) => {
    setFaqAberta(faqAberta === index ? null : index);
  };

  const secoes = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'o-que-e', label: 'O que é a Biblioteca de Prompts', icon: HelpCircle },
    { id: 'como-usar', label: 'Como Usar', icon: Sparkles },
    { id: 'arquiteto-virtual', label: 'Arquiteto Virtual IA', icon: Sparkles },
    { id: 'meu-historico', label: 'Meu Histórico', icon: History },
    { id: 'meus-prompts', label: 'Meus Prompts', icon: FileText },
    { id: 'modo-tema', label: 'Modo Claro/Escuro', icon: Sun },
    { id: 'boas-praticas', label: 'Guia Institucional', icon: Shield },
    { id: 'funcionalidades', label: 'Funcionalidades', icon: Settings },
    { id: 'faq', label: 'FAQ', icon: MessageCircle },
    { id: 'suporte', label: 'Suporte', icon: LifeBuoy },
  ];

  return (
    <div className="pagina-ajuda">
      
      {/* HEADER */}
      <div className="ajuda-header">
        <HelpCircle size={48} />
        <div>
          <h1>Central de Ajuda</h1>
          <p>Tudo que você precisa saber sobre a Biblioteca de Prompts</p>
        </div>
        <span className="badge-versao">v1.2.0</span>
      </div>

      {/* LAYOUT: SIDEBAR + CONTEÚDO */}
      <div className="ajuda-layout">
        
        {/* SIDEBAR DE NAVEGAÇÃO */}
        <aside className="ajuda-sidebar">
          {secoes.map((secao) => {
            const Icon = secao.icon;
            return (
              <button
                key={secao.id}
                className={`sidebar-btn ${secaoAberta === secao.id ? 'active' : ''}`}
                onClick={() => setSecaoAberta(secao.id)}
              >
                <Icon size={18} />
                {secao.label}
                <ChevronRight size={16} className="chevron" />
              </button>
            );
          })}
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="ajuda-conteudo">
          
          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: INÍCIO */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'inicio' && (
            <div className="secao" id="inicio">
              <h2>🏠 Bem-vindo à Central de Ajuda</h2>
              <p className="intro">
                A Biblioteca de Prompts é o sistema oficial da DGTI/UERJ para gerenciar prompts técnicos com inteligência artificial local.
              </p>

              <div className="cards-grid">
                <div className="card-destaque" onClick={() => setSecaoAberta('o-que-e')}>
                  <HelpCircle size={32} />
                  <h3>O que é a Biblioteca de Prompts?</h3>
                  <p>Conheça o sistema e seus benefícios</p>
                </div>

                <div className="card-destaque" onClick={() => setSecaoAberta('como-usar')}>
                  <Sparkles size={32} />
                  <h3>Como Usar</h3>
                  <p>Guia passo a passo para começar</p>
                </div>

                <div className="card-destaque" onClick={() => setSecaoAberta('arquiteto-virtual')}>
                  <Sparkles size={32} />
                  <h3>Arquiteto Virtual IA</h3>
                  <p>Gere especificações automaticamente</p>
                </div>

                <div className="card-destaque" onClick={() => setSecaoAberta('boas-praticas')}>
                  <Shield size={32} />
                  <h3>Guia Institucional</h3>
                  <p>Boas práticas de uso da IA na DGTI</p>
                </div>

                <div className="card-destaque" onClick={() => setSecaoAberta('faq')}>
                  <MessageCircle size={32} />
                  <h3>Perguntas Frequentes</h3>
                  <p>Respostas para dúvidas comuns</p>
                </div>
              </div>

              <div className="alerta-info">
                <HelpCircle size={20} />
                <p>Use o menu lateral para navegar entre as seções ou clique nos cards acima.</p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: O QUE É */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'o-que-e' && (
            <div className="secao" id="o-que-e">
              <h2>❓ O que é a Biblioteca de Prompts?</h2>
              
              <p className="intro">
                A <strong>Biblioteca de Prompts</strong> é uma plataforma desenvolvida
                pela DGTI/UERJ que centraliza e organiza prompts técnicos, além de gerar especificações
                automaticamente usando IA local.
              </p>

              <h3>🎯 Objetivo do Sistema</h3>
              <p>
                Reduzir o tempo gasto na criação de especificações técnicas, padronizar documentação, 
                e preservar conhecimento institucional através de uma biblioteca centralizada.
              </p>

              <h3>⚡ Recursos Principais</h3>
              <div className="recursos-lista">
                <div className="recurso-item">
                  <CheckCircle size={20} />
                  <div>
                    <strong>Biblioteca Centralizada</strong>
                    <p>Todos os prompts validados em um só lugar, organizados por categoria.</p>
                  </div>
                </div>

                <div className="recurso-item">
                  <CheckCircle size={20} />
                  <div>
                    <strong>Arquiteto Virtual IA</strong>
                    <p>Gera especificações técnicas automaticamente usando Ollama + Llama 3.2 (100% local).</p>
                  </div>
                </div>

                <div className="recurso-item">
                  <CheckCircle size={20} />
                  <div>
                    <strong>Meu Histórico</strong>
                    <p>Rastreie todos os prompts que você já utilizou com filtros por data e categoria.</p>
                  </div>
                </div>

                <div className="recurso-item">
                  <CheckCircle size={20} />
                  <div>
                    <strong>Meus Prompts</strong>
                    <p>Visualize e gerencie todos os prompts que você criou, com estatísticas de uso.</p>
                  </div>
                </div>

                <div className="recurso-item">
                  <CheckCircle size={20} />
                  <div>
                    <strong>Modo Claro/Escuro</strong>
                    <p>Alternância suave entre temas para conforto visual em qualquer ambiente.</p>
                  </div>
                </div>
              </div>

              <h3>💰 Benefícios</h3>
              <div className="cards-grid">
                <div className="card-beneficio">
                  <Clock size={32} style={{ color: '#10b981' }} />
                  <h4>480h/ano economizadas</h4>
                  <p>Por servidor técnico (equivalente a 1 servidor full-time liberado)</p>
                </div>

                <div className="card-beneficio">
                  <CheckCircle size={32} style={{ color: '#3b82f6' }} />
                  <h4>100% Padrões DGTI</h4>
                  <p>Especificações seguem stack oficial (Java 17, Spring Boot 3.2, PostgreSQL 15+)</p>
                </div>

                <div className="card-beneficio">
                  <Star size={32} style={{ color: '#f59e0b' }} />
                  <h4>Custo Zero</h4>
                  <p>100% Open Source, sem licenças ou licitações necessárias</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: COMO USAR */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'como-usar' && (
            <div className="secao" id="como-usar">
              <h2>📖 Como Usar a Biblioteca de Prompts</h2>

              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker">1</div>
                  <div className="timeline-content">
                    <h3>🔍 Pesquisar Prompts</h3>
                    <p>
                      Use a barra de busca no topo da tela para encontrar prompts por título, 
                      descrição ou tags. Você também pode filtrar por uma das 8 categorias disponíveis.
                    </p>
                    <div className="exemplo-visual">
                      <Search size={18} />
                      <span>Digite: "API REST", "Spring Boot", "PostgreSQL"...</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-marker">2</div>
                  <div className="timeline-content">
                    <h3>👁️ Visualizar e Avaliar</h3>
                    <p>
                      Clique em um prompt para ver todos os detalhes: descrição completa, tags, 
                      histórico de versões, comentários e avaliações de outros usuários.
                    </p>
                    <div className="acoes-exemplo">
                      <button className="btn-secondary"><Star size={16} /> Avaliar (1-5 estrelas)</button>
                      <button className="btn-secondary"><MessageCircle size={16} /> Comentar</button>
                      <button className="btn-secondary"><Heart size={16} /> Favoritar</button>
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-marker">3</div>
                  <div className="timeline-content">
                    <h3>📋 Copiar e Usar</h3>
                    <p>
                      Clique no botão "Copiar Prompt" para copiar o texto para sua área de transferência. 
                      O uso será automaticamente registrado no seu histórico.
                    </p>
                    <div className="dica-box">
                      <CheckCircle size={18} />
                      <strong>Dica:</strong> Adapte o prompt às suas necessidades específicas antes de usar.
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-marker">4</div>
                  <div className="timeline-content">
                    <h3>✨ Ou Use o Arquiteto Virtual</h3>
                    <p>
                      Para gerar uma especificação completamente nova, use o Arquiteto Virtual IA. 
                      Ele criará um documento técnico completo em 15-30 segundos.
                    </p>
                    <button className="btn-primary" onClick={() => setSecaoAberta('arquiteto-virtual')}>
                      <Sparkles size={18} />
                      Saiba mais sobre o Arquiteto Virtual
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: ARQUITETO VIRTUAL */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'arquiteto-virtual' && (
            <div className="secao" id="arquiteto-virtual">
              <h2>✨ Arquiteto Virtual IA</h2>

              <div className="card-destaque-ia">
                <Sparkles size={48} />
                <h3>Geração Automática de Especificações</h3>
                <p>
                  O Arquiteto Virtual usa <strong>IA local (Ollama + Llama 3.2)</strong> para criar 
                  especificações técnicas completas baseadas na sua descrição. Tudo processado 
                  nos servidores da UERJ, sem enviar dados para fora.
                </p>
              </div>

              <h3>🚀 Como Funciona (5 Passos)</h3>
              <div className="passos-numerados">
                <div className="passo">
                  <div className="passo-numero">1</div>
                  <div className="passo-conteudo">
                    <h4>Escolher Categoria</h4>
                    <p>Selecione uma das 8 categorias: Desenvolvimento, Arquitetura, DevOps, Testes, Banco de Dados, Segurança, Documentação ou Onboarding.</p>
                  </div>
                </div>

                <div className="passo">
                  <div className="passo-numero">2</div>
                  <div className="passo-conteudo">
                    <h4>Descrever Necessidade</h4>
                    <p>Digite o que você precisa. Ex: "API REST em Spring Boot para controle de vendas com relatórios".</p>
                  </div>
                </div>

                <div className="passo">
                  <div className="passo-numero">3</div>
                  <div className="passo-conteudo">
                    <h4>Anexar Documentos (Opcional)</h4>
                    <p>Faça upload de PDFs, DOCs ou TXTs com regras de negócio, requisitos ou referências.</p>
                  </div>
                </div>

                <div className="passo">
                  <div className="passo-numero">4</div>
                  <div className="passo-conteudo">
                    <h4>Gerar Especificação</h4>
                    <p>Clique em "🚀 Gerar" e aguarde 15-30 segundos. A IA criará uma especificação completa.</p>
                  </div>
                </div>

                <div className="passo">
                  <div className="passo-numero">5</div>
                  <div className="passo-conteudo">
                    <h4>Copiar ou Salvar</h4>
                    <p>Copie o resultado ou salve direto na biblioteca para compartilhar com a equipe.</p>
                  </div>
                </div>
              </div>

              <div className="alerta-sucesso">
                <CheckCircle size={20} />
                <div>
                  <strong>🛡️ IA Soberana (100% Local)</strong>
                  <p>
                    Todos os dados permanecem na infraestrutura da UERJ. Nenhuma informação 
                    sensível é enviada para serviços externos, garantindo total segurança e 
                    conformidade com a LGPD.
                  </p>
                </div>
              </div>

              <h3>🔧 Tech Stack</h3>
              <div className="tech-stack">
                <div className="tech-item">
                  <strong>Motor de IA:</strong> Ollama + Llama 3.2
                </div>
                <div className="tech-item">
                  <strong>Hospedagem:</strong> Servidores DGTI/UERJ
                </div>
                <div className="tech-item">
                  <strong>Conectividade:</strong> 100% Offline (intranet)
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: MEU HISTÓRICO (NOVA!) */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'meu-historico' && (
            <div className="secao" id="meu-historico">
              <h2>📜 Meu Histórico</h2>

              <p className="intro">
                O <strong>Meu Histórico</strong> registra automaticamente todos os prompts que você utiliza, 
                permitindo reutilização rápida e auditoria pessoal de atividades.
              </p>

              <h3>✨ Funcionalidades</h3>
              <div className="recursos-lista">
                <div className="recurso-item">
                  <History size={20} />
                  <div>
                    <strong>Registro Automático</strong>
                    <p>Cada prompt que você copia é automaticamente registrado (1x por dia)</p>
                  </div>
                </div>

                <div className="recurso-item">
                  <Filter size={20} />
                  <div>
                    <strong>Filtros Inteligentes</strong>
                    <p>Filtre por data (Hoje, Última semana, Último mês) ou por categoria</p>
                  </div>
                </div>

                <div className="recurso-item">
                  <Copy size={20} />
                  <div>
                    <strong>Reutilização Rápida</strong>
                    <p>Copie novamente qualquer prompt do histórico com um clique</p>
                  </div>
                </div>

                <div className="recurso-item">
                  <Trash2 size={20} />
                  <div>
                    <strong>Gerenciamento</strong>
                    <p>Delete itens individuais ou limpe todo o histórico</p>
                  </div>
                </div>
              </div>

              <h3>🎯 Como Acessar</h3>
              <div className="passos-numerados">
                <div className="passo">
                  <div className="passo-numero">1</div>
                  <div className="passo-conteudo">
                    <p>Abra o menu lateral (☰)</p>
                  </div>
                </div>

                <div className="passo">
                  <div className="passo-numero">2</div>
                  <div className="passo-conteudo">
                    <p>Clique em <strong>"📜 Meu Histórico"</strong></p>
                  </div>
                </div>

                <div className="passo">
                  <div className="passo-numero">3</div>
                  <div className="passo-conteudo">
                    <p>Navegue pelos prompts usados recentemente</p>
                  </div>
                </div>
              </div>

              <div className="dica-box">
                <CheckCircle size={18} />
                <strong>Dica:</strong> Use os filtros para encontrar rapidamente aquele prompt que você usou semana passada!
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: MEUS PROMPTS (NOVA!) */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'meus-prompts' && (
            <div className="secao" id="meus-prompts">
              <h2>📝 Meus Prompts</h2>

              <p className="intro">
                A página <strong>Meus Prompts</strong> mostra todos os prompts que você criou e compartilhou 
                com a equipe, além de estatísticas de uso e engajamento.
              </p>

              <h3>📊 Dashboard Pessoal</h3>
              <p>Visualize 3 métricas principais:</p>
              <div className="cards-grid">
                <div className="card-beneficio">
                  <FileText size={32} style={{ color: '#3b82f6' }} />
                  <h4>Prompts Criados</h4>
                  <p>Total de prompts que você contribuiu</p>
                </div>

                <div className="card-beneficio">
                  <CheckCircle size={32} style={{ color: '#10b981' }} />
                  <h4>Usos Totais</h4>
                  <p>Quantas vezes seus prompts foram usados</p>
                </div>

                <div className="card-beneficio">
                  <Star size={32} style={{ color: '#f59e0b' }} />
                  <h4>Média de Avaliações</h4>
                  <p>Qualidade média dos seus prompts (1-5 estrelas)</p>
                </div>
              </div>

              <h3>🛠️ Ações Disponíveis</h3>
              <div className="acoes-exemplo">
                <button className="btn-secondary"><Eye size={16} /> Ver Detalhes</button>
                <button className="btn-secondary"><Edit size={16} /> Editar</button>
                <button className="btn-secondary"><Trash2 size={16} /> Deletar</button>
              </div>

              <h3>📈 Ordenação</h3>
              <p>Organize seus prompts por:</p>
              <ul className="lista-simples">
                <li><strong>Mais recentes:</strong> Últimos prompts criados</li>
                <li><strong>Mais usados:</strong> Prompts com maior número de usos</li>
                <li><strong>Melhor avaliados:</strong> Prompts com maior média de estrelas</li>
              </ul>

              <div className="dica-box">
                <Star size={18} />
                <strong>Motivação:</strong> Ver quantas pessoas usaram seus prompts aumenta o senso de contribuição!
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: MODO TEMA (NOVA!) */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'modo-tema' && (
            <div className="secao" id="modo-tema">
              <h2>🌓 Modo Claro/Escuro</h2>

              <p className="intro">
                A Biblioteca de Prompts oferece <strong>dois temas visuais</strong> para adaptar-se ao seu ambiente 
                de trabalho e preferência pessoal.
              </p>

              <div className="cards-grid">
                <div className="card-beneficio">
                  <Moon size={32} style={{ color: '#6366f1' }} />
                  <h4>Modo Escuro</h4>
                  <p>Ideal para ambientes com pouca luz. Reduz fadiga ocular em sessões longas.</p>
                </div>

                <div className="card-beneficio">
                  <Sun size={32} style={{ color: '#f59e0b' }} />
                  <h4>Modo Claro</h4>
                  <p>Perfeito para ambientes bem iluminados. Maior contraste para leitura diurna.</p>
                </div>
              </div>

              <h3>🔄 Como Alternar</h3>
              <div className="passos-numerados">
                <div className="passo">
                  <div className="passo-numero">1</div>
                  <div className="passo-conteudo">
                    <h4>No Header</h4>
                    <p>Clique no toggle de tema (🌓) no canto superior direito da tela</p>
                  </div>
                </div>

                <div className="passo">
                  <div className="passo-numero">2</div>
                  <div className="passo-conteudo">
                    <h4>No Menu Lateral</h4>
                    <p>Abra o menu (☰) e clique no toggle de tema na parte inferior</p>
                  </div>
                </div>
              </div>

              <div className="alerta-sucesso">
                <CheckCircle size={20} />
                <div>
                  <strong>✨ Preferência Salva</strong>
                  <p>
                    Sua escolha de tema é automaticamente salva e será mantida mesmo após 
                    fechar o navegador ou fazer logout.
                  </p>
                </div>
              </div>

              <h3>🎨 Características</h3>
              <ul className="lista-simples">
                <li><strong>Transição suave:</strong> Mudança animada entre temas (0.3s)</li>
                <li><strong>Consistente:</strong> Todos os componentes adaptam automaticamente</li>
                <li><strong>Acessível:</strong> Contraste WCAG AA em ambos os temas</li>
              </ul>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: BOAS PRÁTICAS INSTITUCIONAIS (NOVA!) */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'boas-praticas' && (
            <div className="secao" id="boas-praticas">
              <h2>🛡️ Guia Institucional de Boas Práticas</h2>

              <p className="intro">
                Este é o documento oficial da DGTI/UERJ contendo as diretrizes éticas e técnicas para o uso 
                de Inteligência Artificial no desenvolvimento e arquitetura de software da universidade.
              </p>

              <h3>📜 1. Princípios de Soberania e Privacidade</h3>
              <div className="alerta-sucesso">
                <Shield size={20} />
                <div>
                  <strong>Regra de Ouro: Dados Institucionais não vão para a Nuvem</strong>
                  <p>
                    É estritamente proibido colar códigos contendo credenciais, dados reais de alunos/servidores ou IPs 
                    internos no ChatGPT, Claude ou ferramentas em nuvem. Utilize <strong>exclusivamente</strong> o 
                    nosso LLM Local (Llama 3.2 via Ollama) para analisar códigos da instituição.
                  </p>
                </div>
              </div>

              <h3>🏗️ 2. Padrões de Arquitetura Aprovados (Stack)</h3>
              <p>Ao solicitar geração de código para a IA, os desenvolvedores devem exigir a adesão à stack oficial:</p>
              <ul className="lista-simples">
                <li><strong>Backend:</strong> Java 17+, Spring Boot 3+, Maven.</li>
                <li><strong>Frontend:</strong> React 18+, Vite, CSS Modules / Vanilla.</li>
                <li><strong>Banco de Dados:</strong> PostgreSQL.</li>
                <li><strong>Segurança:</strong> Keycloak (IAM) via OAuth2/OpenID Connect.</li>
              </ul>

              <h3>🔍 3. Revisão Humana Obrigatória (Human-in-the-Loop)</h3>
              <div className="cards-grid">
                <div className="card-beneficio">
                  <Eye size={32} style={{ color: '#f59e0b' }} />
                  <h4>Auditoria Visual</h4>
                  <p>A IA comete erros (alucinações). Você é o engenheiro responsável por auditar 100% do código gerado.</p>
                </div>
                <div className="card-beneficio">
                  <Beaker size={32} style={{ color: '#10b981' }} />
                  <h4>Testes Unitários</h4>
                  <p>Código gerado por IA deve obrigatoriamente ser acompanhado de testes no JUnit/Jest.</p>
                </div>
              </div>

              <h3>📚 4. Qualidade de Prompts (Prompt Engineering)</h3>
              <p>Ao salvar um prompt na biblioteca central, siga o padrão de formatação da DGTI:</p>
              <div className="passos-numerados">
                <div className="passo">
                  <div className="passo-numero">1</div>
                  <div className="passo-conteudo">
                    <h4>Contexto</h4>
                    <p>Declare quem a IA é: "Atue como um Engenheiro de Software Sênior da UERJ".</p>
                  </div>
                </div>
                <div className="passo">
                  <div className="passo-numero">2</div>
                  <div className="passo-conteudo">
                    <h4>Ação Específica</h4>
                    <p>O que você quer: "Refatore este código para usar DTOs em vez da entidade diretamente".</p>
                  </div>
                </div>
                <div className="passo">
                  <div className="passo-numero">3</div>
                  <div className="passo-conteudo">
                    <h4>Restrições</h4>
                    <p>As regras: "Não use a biblioteca X, retorne apenas o código, comente métodos complexos".</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: FUNCIONALIDADES */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'funcionalidades' && (
            <div className="secao" id="funcionalidades">
              <h2>⚙️ Funcionalidades</h2>

              <div className="funcionalidades-grid">
                
                <div className="func-card">
                  <Edit size={24} />
                  <h3>Gerenciar Prompts</h3>
                  <ul>
                    <li>Criar novos prompts</li>
                    <li>Editar prompts existentes</li>
                    <li>Deletar prompts (apenas seus)</li>
                    <li>Versionamento automático</li>
                  </ul>
                </div>

                <div className="func-card">
                  <Search size={24} />
                  <h3>Buscar e Filtrar</h3>
                  <ul>
                    <li>Busca em tempo real</li>
                    <li>Filtro por 8 categorias</li>
                    <li>Filtro por tags</li>
                    <li>Ordenação (popular, recente, avaliação)</li>
                  </ul>
                </div>

                <div className="func-card">
                  <History size={24} />
                  <h3>Meu Histórico</h3>
                  <ul>
                    <li>Registro automático de uso</li>
                    <li>Filtros por data e categoria</li>
                    <li>Reutilização rápida</li>
                    <li>Gerenciamento de itens</li>
                  </ul>
                </div>

                <div className="func-card">
                  <FileText size={24} />
                  <h3>Meus Prompts</h3>
                  <ul>
                    <li>Dashboard de contribuições</li>
                    <li>Estatísticas de uso</li>
                    <li>Média de avaliações</li>
                    <li>Ordenação flexível</li>
                  </ul>
                </div>

                <div className="func-card">
                  <Star size={24} />
                  <h3>Avaliações</h3>
                  <ul>
                    <li>Sistema de 1-5 estrelas</li>
                    <li>Média ponderada</li>
                    <li>Histórico de avaliações</li>
                    <li>Editar sua avaliação</li>
                  </ul>
                </div>

                <div className="func-card">
                  <MessageCircle size={24} />
                  <h3>Comentários</h3>
                  <ul>
                    <li>Adicionar comentários</li>
                    <li>Editar seus comentários</li>
                    <li>Deletar comentários</li>
                    <li>Discussões colaborativas</li>
                  </ul>
                </div>

                <div className="func-card">
                  <Heart size={24} />
                  <h3>Favoritos</h3>
                  <ul>
                    <li>Marcar prompts favoritos</li>
                    <li>Biblioteca pessoal</li>
                    <li>Acesso rápido</li>
                    <li>Gerenciar favoritos</li>
                  </ul>
                </div>

                <div className="func-card">
                  <Sparkles size={24} />
                  <h3>Arquiteto Virtual</h3>
                  <ul>
                    <li>Geração automática com IA</li>
                    <li>8 categorias especializadas</li>
                    <li>Upload de documentos</li>
                    <li>100% offline e seguro</li>
                  </ul>
                </div>

                <div className="func-card">
                  <Sun size={24} />
                  <h3>Modo Claro/Escuro</h3>
                  <ul>
                    <li>Dois temas visuais</li>
                    <li>Alternância suave</li>
                    <li>Preferência salva</li>
                    <li>Acessibilidade</li>
                  </ul>
                </div>

                <div className="func-card">
                  <Download size={24} />
                  <h3>Dashboard de Stats</h3>
                  <ul>
                    <li>Métricas gerais do sistema</li>
                    <li>Prompts mais usados</li>
                    <li>Categorias populares</li>
                    <li>Contribuidores ativos</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: FAQ */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'faq' && (
            <div className="secao" id="faq">
              <h2>💬 Perguntas Frequentes (FAQ)</h2>

              <div className="faq-lista">
                
                <div className="faq-item">
                  <button 
                    className="faq-pergunta"
                    onClick={() => toggleFaq(0)}
                  >
                    <span>Como criar um novo prompt?</span>
                    <span className="faq-icon">{faqAberta === 0 ? '−' : '+'}</span>
                  </button>
                  {faqAberta === 0 && (
                    <div className="faq-resposta">
                      <p>
                        <strong>1.</strong> Clique no botão "📝 Adicionar Manualmente" no dashboard<br/>
                        <strong>2.</strong> Preencha título, categoria, tags e descrição<br/>
                        <strong>3.</strong> Cole o texto do prompt<br/>
                        <strong>4.</strong> Clique em "Salvar"<br/><br/>
                        Seu prompt estará imediatamente disponível para toda a equipe!
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button 
                    className="faq-pergunta"
                    onClick={() => toggleFaq(1)}
                  >
                    <span>O Arquiteto Virtual IA precisa de internet?</span>
                    <span className="faq-icon">{faqAberta === 1 ? '−' : '+'}</span>
                  </button>
                  {faqAberta === 1 && (
                    <div className="faq-resposta">
                      <p>
                        <strong>Não!</strong> O Arquiteto Virtual funciona 100% offline usando Ollama + Llama 3.2 
                        rodando nos servidores da DGTI/UERJ. Nenhum dado é enviado para a internet. 
                        Tudo é processado localmente, garantindo total segurança e privacidade.
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button 
                    className="faq-pergunta"
                    onClick={() => toggleFaq(2)}
                  >
                    <span>Posso editar prompts criados por outras pessoas?</span>
                    <span className="faq-icon">{faqAberta === 2 ? '−' : '+'}</span>
                  </button>
                  {faqAberta === 2 && (
                    <div className="faq-resposta">
                      <p>
                        Não diretamente. Você só pode editar e deletar <strong>seus próprios prompts</strong>. 
                        Porém, você pode:<br/><br/>
                        • <strong>Comentar</strong> sugerindo melhorias<br/>
                        • <strong>Avaliar</strong> com estrelas<br/>
                        • <strong>Copiar e adaptar</strong> criando uma nova versão<br/><br/>
                        Isso garante que o autor original mantenha controle sobre seu trabalho.
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button 
                    className="faq-pergunta"
                    onClick={() => toggleFaq(3)}
                  >
                    <span>Como funciona o sistema de avaliações?</span>
                    <span className="faq-icon">{faqAberta === 3 ? '−' : '+'}</span>
                  </button>
                  {faqAberta === 3 && (
                    <div className="faq-resposta">
                      <p>
                        Cada prompt pode ser avaliado com <strong>1 a 5 estrelas</strong>. 
                        A média das avaliações é calculada automaticamente e mostrada junto ao prompt.<br/><br/>
                        <strong>Você pode:</strong><br/>
                        • Avaliar quantos prompts quiser<br/>
                        • Mudar sua avaliação a qualquer momento<br/>
                        • Ver quem avaliou e quando<br/><br/>
                        Isso ajuda a equipe a identificar os prompts de maior qualidade!
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button 
                    className="faq-pergunta"
                    onClick={() => toggleFaq(4)}
                  >
                    <span>Posso adicionar documentos ao Arquiteto Virtual?</span>
                    <span className="faq-icon">{faqAberta === 4 ? '−' : '+'}</span>
                  </button>
                  {faqAberta === 4 && (
                    <div className="faq-resposta">
                      <p>
                        <strong>Sim!</strong> Você pode fazer upload de documentos de referência 
                        nos formatos <strong>PDF, DOC, DOCX ou TXT</strong>.<br/><br/>
                        A IA lerá o conteúdo e usará como contexto adicional para gerar 
                        uma especificação mais precisa e alinhada com suas regras de negócio.<br/><br/>
                        <strong>Dica:</strong> Anexe documentos com requisitos, casos de uso ou 
                        especificações existentes para resultados melhores!
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button 
                    className="faq-pergunta"
                    onClick={() => toggleFaq(5)}
                  >
                    <span>O Ollama funciona sem internet?</span>
                    <span className="faq-icon">{faqAberta === 5 ? '−' : '+'}</span>
                  </button>
                  {faqAberta === 5 && (
                    <div className="faq-resposta">
                      <p>
                        <strong>Sim!</strong> Depois do modelo Llama 3.2 ser baixado uma única vez, 
                        o Ollama funciona <strong>100% offline</strong>.<br/><br/>
                        O modelo fica armazenado nos servidores da DGTI e não precisa de internet 
                        para gerar especificações. Isso garante:<br/><br/>
                        ✅ Total privacidade dos dados<br/>
                        ✅ Funcionamento mesmo com problemas de rede<br/>
                        ✅ Conformidade com LGPD<br/>
                        ✅ Velocidade consistente
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button 
                    className="faq-pergunta"
                    onClick={() => toggleFaq(6)}
                  >
                    <span>Meu histórico é privado ou outros podem ver?</span>
                    <span className="faq-icon">{faqAberta === 6 ? '−' : '+'}</span>
                  </button>
                  {faqAberta === 6 && (
                    <div className="faq-resposta">
                      <p>
                        Seu histórico é <strong>100% privado</strong>. Apenas você pode visualizar 
                        quais prompts usou, quando e com que frequência.<br/><br/>
                        <strong>Privacidade garantida:</strong><br/>
                        • Ninguém mais vê seu histórico<br/>
                        • Você pode deletar itens individualmente<br/>
                        • Você pode limpar todo histórico<br/>
                        • Dados não são compartilhados com admins<br/><br/>
                        Use livremente sem preocupações com privacidade!
                      </p>
                    </div>
                  )}
                </div>

              </div>

              <div className="alerta-info">
                <HelpCircle size={20} />
                <p>
                  <strong>Não encontrou sua dúvida?</strong> Entre em contato através do 
                  email dgti@uerj.br ou pelo Slack no canal #biblioteca-prompts-suporte.
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* SEÇÃO: SUPORTE */}
          {/* ═══════════════════════════════════════════════ */}
          
          {secaoAberta === 'suporte' && (
            <div className="secao" id="suporte">
              <h2>🆘 Suporte</h2>

              <p className="intro">
                Precisa de ajuda? Entre em contato com a equipe DGTI através dos canais abaixo:
              </p>

              <div className="cards-grid">
                <div className="card-contato">
                  <MessageCircle size={32} />
                  <h3>Email</h3>
                  <p>dgti@uerj.br</p>
                  <button className="btn-primary">Enviar Email</button>
                </div>
      
              </div>

              <h3>📝 Como Reportar Problemas</h3>
              <ol className="lista-ordenada">
                <li>Descreva o problema de forma clara e detalhada</li>
                <li>Inclua prints de tela se possível</li>
                <li>Informe qual navegador e versão está usando</li>
                <li>Mencione os passos para reproduzir o erro</li>
              </ol>

              <h3>🗺️ Roadmap</h3>
              <div className="roadmap">
                <div className="roadmap-item concluido">
                  <CheckCircle size={20} />
                  <div>
                    <h4>v1.0.0 - MVP ✅</h4>
                    <p>Criação e Gestão de Prompts, Histórico de Interações, Comentários, Avaliações de IA, Integração com Llama 3</p>
                  </div>
                </div>

                <div className="roadmap-item concluido">
                  <CheckCircle size={20} />
                  <div>
                    <h4>v1.2.0 - Melhorias UX ✅</h4>
                    <p>Meu Histórico, Meus Prompts, Modo Claro/Escuro, Toast Notifications</p>
                  </div>
                </div>

                <div className="roadmap-item concluido">
                  <CheckCircle size={20} />
                  <div>
                    <h4>v1.3.0 - Infraestrutura & Deploy ✅</h4>
                    <p>Docker Compose (Front + Back), README completo, Templates Front-end, Notificações em tempo real</p>
                  </div>
                </div>

                <div className="roadmap-item concluido">
                  <CheckCircle size={20} />
                  <div>
                    <h4>v1.4.0 - Relatórios ✅</h4>
                    <p>Exportar em PDF, Relatórios customizados, Métricas avançadas, Dashboard de uso</p>
                  </div>
                </div>

                <div className="roadmap-item concluido">
                  <CheckCircle size={20} />
                  <div>
                    <h4>v1.5.0 - Colaboração ✅</h4>
                    <p>Compartilhar prompts entre equipes, Favoritar prompts de outros, Controle de permissões por perfil (Admin/Usuário)</p>
                  </div>
                </div>

                <div className="roadmap-item concluido">
                  <CheckCircle size={20} />
                  <div>
                    <h4>v1.6.0 - Banco de dados persistente ✅</h4>
                    <p>PostgreSQL como banco principal, dados persistentes entre reinicializações, volume Docker configurado</p>
                    <div className="roadmap-tags-inline">
                      <span className="roadmap-tech-tag">PostgreSQL 16</span>
                      <span className="roadmap-tech-tag">Docker Volume</span>
                      <span className="roadmap-tech-tag">data.sql adaptado</span>
                    </div>
                  </div>
                </div>

                <div className="roadmap-item concluido">
                  <CheckCircle size={20} />
                  <div>
                    <h4>v1.7.0 - Autenticação & Segurança ✅</h4>
                    <p>Keycloak integrado, login obrigatório, roles ADMIN e USER, tokens JWT validados, Autenticação em Dois Fatores (2FA) via OTP configurada.</p>
                    <div className="roadmap-tags-inline">
                      <span className="roadmap-tech-tag">Keycloak 24</span>
                      <span className="roadmap-tech-tag">Spring Security</span>
                      <span className="roadmap-tech-tag">keycloak-js</span>
                      <span className="roadmap-tech-tag">JWT</span>
                      <span className="roadmap-tech-tag">2FA (OTP)</span>
                    </div>
                  </div>
                </div>

                <div className="roadmap-item planejado">
                  <Shield size={20} />
                  <div>
                    <h4>v1.8.0 - Deploy na UERJ 🏛️</h4>
                    <p>Deploy no servidor da UERJ, domínio uerj.br, HTTP interno (fase 1), HTTPS (fase 2)</p>
                    <div className="roadmap-tags-inline">
                      <span className="roadmap-tech-tag">Servidor UERJ</span>
                      <span className="roadmap-tech-tag">Domínio uerj.br</span>
                      <span className="roadmap-tech-tag">Nginx + SSL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default PaginaAjuda;