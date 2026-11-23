import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Rating } from 'primereact/rating';
import { Slider } from 'primereact/slider';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import { diagnosticoAPI } from '../../services/api';
import './Diagnostico.css';

const Diagnostico = ({ nomeUsuario, onComplete, toast }) => {
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    
    // --- ETAPA 1: Perfil e Cultura ---
    const [papel, setPapel] = useState(null);
    const [tecnologias, setTecnologias] = useState([]);
    const [satisfacaoFerramentas, setSatisfacaoFerramentas] = useState(null);
    const [focoTrabalho, setFocoTrabalho] = useState(null);
    
    // --- ETAPA 2: Processos e Gargalos ---
    const [etapaDemorada, setEtapaDemorada] = useState(null);
    const [causaAtraso, setCausaAtraso] = useState(null);
    const [horasPerdidas, setHorasPerdidas] = useState(5);
    const [metodoRevisao, setMetodoRevisao] = useState(null);
    const [coberturaTestes, setCoberturaTestes] = useState(null);
    
    // --- ETAPA 3: Inteligência Artificial ---
    const [experienciaIA, setExperienciaIA] = useState(null);
    const [tarefasIA, setTarefasIA] = useState([]);
    const [usaIaPorContaPropria, setUsaIaPorContaPropria] = useState(null);
    const [maiorPreocupacaoIa, setMaiorPreocupacaoIa] = useState(null);
    const [comentario, setComentario] = useState('');

    // --- OPÇÕES (Mocks) ---
    const papeis = [
        { label: 'Desenvolvedor Backend', value: 'Desenvolvedor Backend' },
        { label: 'Desenvolvedor Frontend', value: 'Desenvolvedor Frontend' },
        { label: 'Desenvolvedor Fullstack', value: 'Desenvolvedor Fullstack' },
        { label: 'Analista de Requisitos / Negócios', value: 'Analista' },
        { label: 'Arquiteto de Software', value: 'Arquiteto' },
        { label: 'DevOps / Infraestrutura', value: 'Infraestrutura' }
    ];

    const tecOptions = [
        { label: 'Java (Spring)', value: 'Java' },
        { label: 'PHP', value: 'PHP' },
        { label: 'React / JS', value: 'React' },
        { label: 'SQL / Bancos de Dados', value: 'SQL' },
        { label: 'Docker / Infra', value: 'Docker' }
    ];

    const focoOptions = [
        { label: 'Maior parte apagando incêndio (Bugs urgentes)', value: 'Bugs Urgentes' },
        { label: 'Maior parte criando novas funcionalidades', value: 'Novas Features' },
        { label: 'Meio a Meio', value: 'Equilibrado' }
    ];

    const etapasOptions = [
        { label: 'Entendimento de Requisitos', value: 'Requisitos' },
        { label: 'Codificação / Implementação', value: 'Codificação' },
        { label: 'Testes (Manuais ou Automatizados)', value: 'Testes' },
        { label: 'Revisão de Código (Code Review)', value: 'Code Review' },
        { label: 'Deploy / Infraestrutura', value: 'Deploy' },
        { label: 'Documentação do Sistema', value: 'Documentação' }
    ];

    const causasOptions = [
        { label: 'Código legado não documentado', value: 'Código Legado' },
        { label: 'Requisitos mudam toda hora', value: 'Requisitos' },
        { label: 'Ambiente de testes instável', value: 'Ambiente' },
        { label: 'Sobrecarga / Falta de pessoal', value: 'Pessoal' }
    ];

    const metodoRevisaoOptions = [
        { label: 'Não fazemos revisão formal', value: 'Sem Revisão' },
        { label: 'Formal via Pull Request (GitLab/GitHub)', value: 'Pull Request' },
        { label: 'Informal (Pareamento ou olhada rápida)', value: 'Informal' }
    ];

    const coberturaTestesOptions = [
        { label: 'Quase nula (0% a 20%)', value: 'Baixa' },
        { label: 'Parcial (20% a 50%)', value: 'Media' },
        { label: 'Alta (Acima de 50%)', value: 'Alta' }
    ];

    const expIaOptions = ['Iniciante', 'Intermediário', 'Avançado'];

    const tarefasIaOptions = [
        { label: 'Gerar Testes Unitários', value: 'Testes' },
        { label: 'Explicar Código Legado', value: 'Explicar Código' },
        { label: 'Refatoração de Segurança', value: 'Segurança' },
        { label: 'Escrever Documentação técnica', value: 'Documentação' }
    ];

    const iaContaPropriaOptions = [
        { label: 'Sim, uso diariamente (escondido ou não)', value: 'Diariamente' },
        { label: 'Uso de vez em quando', value: 'As vezes' },
        { label: 'Não utilizo IA no trabalho', value: 'Não' }
    ];

    const preocupacaoIaOptions = [
        { label: 'Privacidade de dados e código da UERJ', value: 'Privacidade' },
        { label: 'Dependência tecnológica (esquecer como programar)', value: 'Dependencia' },
        { label: 'Bugs sutis gerados pela IA (Alucinação)', value: 'Bugs IA' },
        { label: 'Não tenho preocupações', value: 'Nenhuma' }
    ];

    // --- LÓGICA DE NAVEGAÇÃO ---
    const nextStep = () => {
        if (activeIndex === 0 && !papel) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha seu papel antes de continuar.' });
            return;
        }
        if (activeIndex === 1 && !etapaDemorada) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Indique a etapa mais demorada.' });
            return;
        }
        setActiveIndex((prev) => prev + 1);
    };

    const prevStep = () => {
        setActiveIndex((prev) => prev - 1);
    };

    const handlePular = () => {
        // Como o usuário escolheu pular, vamos apenas liberar o acesso.
        // Se quisermos perturbá-lo de novo, basta não salvar no backend.
        toast.current?.show({ severity: 'info', summary: 'Aviso', detail: 'Você pulou o formulário. Lembraremos você depois!' });
        onComplete();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!experienciaIA) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha seu nível de experiência com IA.' });
            return;
        }

        setLoading(true);

        const dados = {
            usuarioId: nomeUsuario,
            papel,
            tecnologiasPrincipais: tecnologias,
            satisfacaoFerramentas,
            focoTrabalho,
            etapaMaisDemorada: etapaDemorada,
            principalCausaAtraso: causaAtraso,
            horasPerdidasSemana: horasPerdidas,
            metodoRevisao,
            coberturaTestes,
            nivelExperienciaIA: experienciaIA,
            tarefasParaDelegarIA: tarefasIA,
            usaIaPorContaPropria,
            maiorPreocupacaoIa,
            comentarioLivre: comentario
        };

        try {
            await diagnosticoAPI.salvar(dados);
            toast.current?.show({ severity: 'success', summary: 'Obrigado!', detail: 'Diagnóstico salvo. Bem-vindo à Plataforma de IA!' });
            onComplete(); 
        } catch (error) {
            console.error('Erro ao salvar diagnostico', error);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar os dados.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="diagnostico-overlay">
            <div className="diagnostico-container">
                <div className="diagnostico-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
                    <h2>Pesquisa - Integração de IA (UERJ)</h2>
                    <p>Ajude-nos a entender como a IA pode facilitar o seu dia a dia.</p>
                    
                    {/* Indicador de Etapas */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1.5rem' }}>
                        {[0, 1, 2].map(step => (
                            <div key={step} style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: activeIndex >= step ? '#3b82f6' : '#334155',
                                color: 'white', fontWeight: 'bold'
                            }}>
                                {step + 1}
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="diagnostico-form">
                    
                    {/* ETAPA 1: Perfil e Cultura */}
                    {activeIndex === 0 && (
                        <div className="form-section fade-in">
                            <h3>1. Perfil e Cultura Atual</h3>
                            <div className="field-group">
                                <div className="field">
                                    <label>Qual é o seu papel principal? *</label>
                                    <Dropdown value={papel} options={papeis} onChange={(e) => setPapel(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                                <div className="field">
                                    <label>Tecnologias mais utilizadas</label>
                                    <MultiSelect value={tecnologias} options={tecOptions} onChange={(e) => setTecnologias(e.value)} placeholder="Selecione..." display="chip" className="w-full" appendTo="self" />
                                </div>
                            </div>
                            
                            <div className="field-group mt-3">
                                <div className="field">
                                    <label>Satisfeito com o ferramental de desenvolvimento atual da UERJ?</label>
                                    <Rating value={satisfacaoFerramentas} onChange={(e) => setSatisfacaoFerramentas(e.value)} cancel={false} />
                                </div>
                                <div className="field">
                                    <label>Onde você foca mais energia hoje?</label>
                                    <Dropdown value={focoTrabalho} options={focoOptions} onChange={(e) => setFocoTrabalho(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                            </div>

                            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                                <Button label="Pular por enquanto" icon="pi pi-clock" type="button" onClick={handlePular} className="btn-pular" />
                                <Button label="Próxima Etapa" icon="pi pi-arrow-right" iconPos="right" type="button" onClick={nextStep} className="btn-proximo" />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 2: Processos e Gargalos */}
                    {activeIndex === 1 && (
                        <div className="form-section fade-in">
                            <h3>2. Processos e Gargalos</h3>
                            <div className="field-group">
                                <div className="field">
                                    <label>Qual etapa consome mais tempo hoje? *</label>
                                    <Dropdown value={etapaDemorada} options={etapasOptions} onChange={(e) => setEtapaDemorada(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                                <div className="field">
                                    <label>Principal causa de atraso nas entregas</label>
                                    <Dropdown value={causaAtraso} options={causasOptions} onChange={(e) => setCausaAtraso(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                            </div>

                            <div className="field mt-3">
                                <label>Em média, quantas horas/semana você perde em tarefas repetitivas?</label>
                                <div className="flex align-items-center gap-3">
                                    <Slider value={horasPerdidas} onChange={(e) => setHorasPerdidas(e.value)} min={0} max={20} className="w-full" />
                                    <span className="font-bold text-xl ml-3" style={{color: '#3b82f6'}}>{horasPerdidas}h</span>
                                </div>
                            </div>

                            <div className="field-group mt-3">
                                <div className="field">
                                    <label>Como é feita a revisão de código hoje?</label>
                                    <Dropdown value={metodoRevisao} options={metodoRevisaoOptions} onChange={(e) => setMetodoRevisao(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                                <div className="field">
                                    <label>Cobertura média de testes automatizados nos projetos que atua?</label>
                                    <Dropdown value={coberturaTestes} options={coberturaTestesOptions} onChange={(e) => setCoberturaTestes(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                            </div>

                            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                                <Button label="Voltar" icon="pi pi-arrow-left" type="button" onClick={prevStep} className="btn-pular" />
                                <Button label="Próxima Etapa" icon="pi pi-arrow-right" iconPos="right" type="button" onClick={nextStep} className="btn-proximo" />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 3: Inteligência Artificial */}
                    {activeIndex === 2 && (
                        <div className="form-section fade-in">
                            <h3>3. Perspectivas sobre Inteligência Artificial</h3>
                            <div className="field">
                                <label>Nível de familiaridade com IA (ChatGPT, Copilot, etc) *</label>
                                <SelectButton value={experienciaIA} options={expIaOptions} onChange={(e) => setExperienciaIA(e.value)} />
                            </div>
                            
                            <div className="field-group mt-3">
                                <div className="field">
                                    <label>Você já utiliza IA por conta própria no trabalho?</label>
                                    <Dropdown value={usaIaPorContaPropria} options={iaContaPropriaOptions} onChange={(e) => setUsaIaPorContaPropria(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                                <div className="field">
                                    <label>Maior preocupação com a adoção de IA na UERJ</label>
                                    <Dropdown value={maiorPreocupacaoIa} options={preocupacaoIaOptions} onChange={(e) => setMaiorPreocupacaoIa(e.value)} placeholder="Selecione..." className="w-full" appendTo="self" />
                                </div>
                            </div>

                            <div className="field mt-3">
                                <label>O que você mais gostaria que nossa IA fizesse por você?</label>
                                <MultiSelect value={tarefasIA} options={tarefasIaOptions} onChange={(e) => setTarefasIA(e.value)} placeholder="Selecione..." display="chip" className="w-full" appendTo="self" />
                            </div>

                            <div className="field mt-3">
                                <label>Comentários adicionais / Sugestões para a Biblioteca de Prompts</label>
                                <InputTextarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} className="w-full" placeholder="Deixe seu comentário..." />
                            </div>

                            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                                <Button label="Voltar" icon="pi pi-arrow-left" type="button" onClick={prevStep} className="btn-pular" />
                                <Button label="Enviar" icon="pi pi-check" loading={loading} type="submit" className="btn-proximo" style={{ background: '#10b981', borderColor: '#10b981' }} />
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Diagnostico;
