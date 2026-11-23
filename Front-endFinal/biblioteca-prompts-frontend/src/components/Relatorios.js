import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const gerarRelatorioPDF = (stats, nomeUsuario) => {
  if (!stats) {
    alert("Aguarde o carregamento dos dados...");
    return;
  }

  const doc = new jsPDF();
  const azulUERJ = [26, 84, 144]; 
  const cinzaTexto = 60;
  
  const mesReferencia = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const mesFormatado = mesReferencia.charAt(0).toUpperCase() + mesReferencia.slice(1);

  // --- RODAPÉ PADRONIZADO ---
  const aplicarRodape = (doc, pNum, pTotal) => {
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text('Universidade do Estado do Rio de Janeiro | Diretoria Geral de Tecnologia da Informação', 14, 287);
    doc.text(`Pág. ${pNum} de ${pTotal}`, 196, 287, { align: 'right' });
  };

  // ==========================================================================
  // PÁGINA 1: ESTRATÉGIA E EFICIÊNCIA TÉCNICA
  // ==========================================================================
  
  // 1. CABEÇALHO 
  doc.setFillColor(...azulUERJ);
  doc.rect(0, 0, 210, 35, 'F'); 
  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(255, 255, 255);
  doc.text("Biblioteca de Prompts UERJ", 14, 18);
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text("Relatório Gerencial de Eficiência e Inteligência de Dados", 14, 26);
  doc.setFontSize(9);
  doc.text(`Referência: ${mesFormatado}`, 195, 18, { align: 'right' });
  doc.text(`Responsável Técnico: ${nomeUsuario || 'Servidor'}`, 195, 26, { align: 'right' });

  // 2. TÓPICO 1: CONTEXTO E JUSTIFICATIVA
  let cursorY = 50;
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(0);
  doc.text("1. Contexto e Justificativa Institucional", 14, cursorY);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(cinzaTexto);
  cursorY += 8;
  const textoJustificativa = "A UERJ enfrenta desafios estruturais no campo da TI, com aumento da demanda por soluções digitais e limitação de recursos humanos. Este relatório apresenta os impactos da utilização de Inteligência Artificial como ferramenta de apoio à equipe de desenvolvimento (DEPSEN), visando otimizar a entrega de serviços e mitigar gargalos operacionais.";
  doc.text(textoJustificativa, 14, cursorY, { maxWidth: 182, align: "justify", lineHeightFactor: 1.5 });

  // 3. TÓPICO 2: INDICADORES DE EFICIÊNCIA TÉCNICA (ATUALIZADO)
  cursorY += 35;
  doc.setFont("helvetica", "bold").setTextColor(0);
  doc.text("2. Indicadores de Eficiência Técnica", 14, cursorY);

  autoTable(doc, {
    startY: cursorY + 5,
    head: [['Indicador Estratégico', 'Performance (KPI)', 'Análise de Valor Gerado']],
    body: [
      ['Produtividade Técnica', '+40% (Estimado)', 'Redução do tempo de resposta no ciclo de desenvolvimento.'],
      ['Conformidade Padrão', '100% de Aderência', 'Prompts certificados seguem a arquitetura DGTI/UERJ.'],
      ['Qualidade Percebida', `${stats.mediaSatisfacao || '0.0'} / 5.0`, 'Nível de precisão das saídas geradas pela IA validado por pares.'],
      ['Capital Intelectual', `${stats.totalFavoritos || 0} salvos`, 'Volume de ativos validados para reuso institucional imediato.'],
      ['Reuso de Conhecimento', 'Consolidado', 'Mitigação de retrabalho através da biblioteca.'],
      ['Padronização Arquitetural', 'Aderência Total', 'Garantia de conformidade com os padrões de desenvolvimento e arquitetura DGTI.']
    ],
    theme: 'grid',
    headStyles: { fillColor: azulUERJ, fontSize: 10, halign: 'center' },
    columnStyles: { 0: { fontStyle: 'bold', width: 55 }, 1: { fontStyle: 'bold', textColor: azulUERJ, width: 35, halign: 'center' } },
    styles: { cellPadding: 4 }
  });

  // 4. TÓPICO 3: BENEFÍCIOS ESTRATÉGICOS IDENTIFICADOS
  cursorY = doc.lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold").text("3. Benefícios Estratégicos Identificados", 14, cursorY);

  autoTable(doc, {
    startY: cursorY + 5,
    head: [['Pilar de Impacto', 'Descrição do Benefício Institucional']],
    body: [
      ['Padronização', 'Eliminação da heterogeneidade nos estilos de codificação da equipe técnica.'],
      ['Eficiência Documental', 'Geração instantânea de especificações técnicas seguindo o padrão UERJ.'],
      ['Onboarding Acelerado', 'Facilitação da entrada de novos desenvolvedores via templates certificados.'],
      ['Segurança Nativa', 'Higienização prévia de prompts para evitar vazamento de dados sensíveis.']
    ],
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105] },
    columnStyles: { 0: { fontStyle: 'bold', width: 45 } },
    styles: { fontSize: 9.5 }
  });

  // ==========================================================================
  // PÁGINA 2: PERFORMANCE OPERACIONAL E GOVERNANÇA
  // ==========================================================================
  doc.addPage();
  cursorY = 25;

  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(0);
  doc.text(`4. Dados de Adoção e Performance - Ref. ${mesFormatado}`, 14, cursorY);

  // TABELA DE ADOÇÃO COM CRESCIMENTO MENSAL
  autoTable(doc, {
    startY: cursorY + 6,
    head: [['Métrica Operacional', 'Total Acumulado', 'Novos (Neste Mês)', 'Status']],
    body: [
      ['Biblioteca de Prompts Ativos', String(stats.totalPrompts || 0), `+${stats.promptsNesteMes || 0}`, 'Em Expansão'],
      ['Volume de Atividade (Usos)', String(stats.totalUsosSemana || 0), '-', 'Ativo'],
      ['Especialistas Contribuidores', String(stats.contribuidoresAtivos || 0), `+${stats.autoresNesteMes || 0}`, 'Crescente'],
      ['Satisfação da Equipe', `${stats.mediaSatisfacao || '0.0'}/5.0`, '-', 'Excelente']
    ],
    theme: 'grid',
    headStyles: { fillColor: [100, 116, 139], halign: 'center' },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' }, 2: { halign: 'center', textColor: [16, 185, 129], fontStyle: 'bold' }, 3: { halign: 'center' } },
    styles: { fontSize: 9.5 }
  });

  // 5. RANKING DE ATIVOS (Top 5)
  cursorY = doc.lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold").text("5. Top 5 Ativos Tecnológicos Mais Utilizados", 14, cursorY);
  
  if (stats.topPrompts && stats.topPrompts.length > 0) {
    autoTable(doc, {
      startY: cursorY + 6,
      head: [['Posição', 'Prompt / Ativo', 'Categoria', 'Volume de Uso']],
      body: stats.topPrompts.slice(0, 5).map((p, i) => [
        `${i + 1}º`, p.titulo, p.categoria, `${p.usos} usos`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], halign: 'center' },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold', width: 20 }, 3: { halign: 'center', fontStyle: 'bold', textColor: [180, 83, 9] } }
    });
  }

  // 6. TÓPICO 6: GOVERNANÇA
  cursorY = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor(220).line(14, cursorY - 5, 196, cursorY - 5);
  doc.setFontSize(12).setTextColor(...azulUERJ).text("6. Governança e Segurança da Informação", 14, cursorY);
  
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(cinzaTexto);
  doc.text("A Biblioteca de Prompts atua em conformidade com as diretrizes de segurança da informação da UERJ:", 14, cursorY + 7);

  autoTable(doc, {
    startY: cursorY + 12,
    head: [['Diretriz Institucional', 'Detalhamento Técnico de Conformidade']],
    body: [
      ['Anonimização', 'Prompts validados para não expor dados sensíveis (LGPD).'],
      ['Auditabilidade', 'Registro integral de histórico de uso e versionamento.'],
      ['Soberania', 'O conhecimento gerado permanece no repositório da DGTI.']
    ],
    theme: 'grid',
    headStyles: { fillColor: azulUERJ },
    columnStyles: { 0: { fontStyle: 'bold', width: 45 } },
    styles: { fontSize: 9.5 }
  });

  // APLICAÇÃO DO RODAPÉ EM TODAS AS PÁGINAS
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    aplicarRodape(doc, i, totalPages);
  }

  doc.save(`BibliotecaDePrompts_Relatorio_Executivo_${new Date().getFullYear()}.pdf`);
};

// ==========================================================================
// RELATÓRIO PDF: DIAGNÓSTICO (FASE 1)
// ==========================================================================

export const gerarRelatorioDiagnosticoPDF = (resultados, stats, nomeUsuario) => {
  if (!resultados || resultados.length === 0) {
    alert("Aguarde o carregamento dos dados ou verifique se há respostas.");
    return;
  }

  const doc = new jsPDF();
  const azulUERJ = [26, 84, 144]; 
  const cinzaTexto = 60;
  
  const mesReferencia = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const mesFormatado = mesReferencia.charAt(0).toUpperCase() + mesReferencia.slice(1);

  const aplicarRodape = (doc, pNum, pTotal) => {
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text('Universidade do Estado do Rio de Janeiro | Diretoria Geral de Tecnologia da Informação', 14, 287);
    doc.text(`Pág. ${pNum} de ${pTotal}`, 196, 287, { align: 'right' });
  };

  // 1. CABEÇALHO
  doc.setFillColor(...azulUERJ);
  doc.rect(0, 0, 210, 35, 'F'); 
  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(255, 255, 255);
  doc.text("Biblioteca de Prompts UERJ", 14, 18);
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text("Relatório Analítico de Diagnóstico de Equipe", 14, 26);
  doc.setFontSize(9);
  doc.text(`Referência: ${mesFormatado}`, 195, 18, { align: 'right' });
  doc.text(`Responsável Técnico: ${nomeUsuario || 'Admin DGTI'}`, 195, 26, { align: 'right' });

  // 2. INDICADORES GERAIS
  let cursorY = 45;
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(0);
  doc.text("1. Resumo Executivo (KPIs)", 14, cursorY);

  autoTable(doc, {
    startY: cursorY + 5,
    head: [['Métrica Coletada', 'Valor Apurado']],
    body: [
      ['Total de Profissionais que Responderam', String(stats?.totalRespostas || 0)],
      ['Média de Satisfação com o Ferramental Atual', `${stats?.mediaSatisfacao || '0.0'} de 5.0`],
      ['Total de Horas Perdidas (Estimativa Semanal)', `${stats?.totalHoras || 0} horas`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], halign: 'left' },
    columnStyles: { 1: { fontStyle: 'bold', textColor: azulUERJ } },
    styles: { fontSize: 10, cellPadding: 4 }
  });

  // 3. TABELA DETALHADA DE RESULTADOS
  cursorY = doc.lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold").text("2. Detalhamento Técnico por Profissional", 14, cursorY);

  const tableBody = resultados.map(r => [
    r.usuarioId || 'Anônimo',
    r.papel || '-',
    r.etapaMaisDemorada || '-',
    `${r.horasPerdidasSemana || 0}h`,
    r.nivelExperienciaIA || '-',
    r.tecnologiasPrincipais?.join(', ') || '-'
  ]);

  autoTable(doc, {
    startY: cursorY + 5,
    head: [['Usuário', 'Papel', 'Maior Gargalo', 'Horas Perdidas', 'Nível IA', 'Tecnologias']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: azulUERJ, fontSize: 9 },
    styles: { fontSize: 8 },
    columnStyles: { 
      0: { fontStyle: 'bold' },
      3: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' } 
    }
  });

  // APLICAÇÃO DO RODAPÉ
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    aplicarRodape(doc, i, totalPages);
  }

  doc.save(`Diagnostico_Equipe_${new Date().getFullYear()}.pdf`);
};