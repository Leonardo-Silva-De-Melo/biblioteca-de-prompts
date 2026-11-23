import React, { useState, useMemo } from 'react';
import { Heart, Trash2, ExternalLink, Search,Bookmark} from 'lucide-react';
import { Paginator } from 'primereact/paginator';
import './Favoritos.css';

const PaginaFavoritos = ({ prompts, aoRemover, aoAbrir, categorias }) => {
  // Estados para Busca e Paginação
  const [busca, setBusca] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(6); // 6 cards grandes por página

  // Filtro inteligente (Título ou Categoria)
  const promptsFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return prompts;
    return prompts.filter(p => 
      p.titulo.toLowerCase().includes(termo) || 
      p.categoria.toLowerCase().includes(termo)
    );
  }, [prompts, busca]);

  // Cálculo da página atual
  const promptsPaginados = promptsFiltrados.slice(first, first + rows);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    //window.scrollTo({ top: 0, behavior: 'smooth' });
    // sem jogar o usuário de forma agressiva lá pro teto do site.
    // document.querySelector('.favoritos-page-container').scrollIntoView({ 
    //     behavior: 'smooth', 
    //     block: 'start' 
    // });
  };

  return (
    <div className="favoritos-page-container">
      
      <div className="page-header">
        <div>
          <h2><Heart size={28} color="#ef4444" fill="#ef4444" /> Minha Biblioteca</h2>
          <p>Gerencie seus prompts e padrões favoritos salvos na Biblioteca de Prompts.</p>
        </div>
        <div className="favoritos-contador">
          <span>{promptsFiltrados.length}</span> itens
        </div>
      </div>

      {/* BARRA DE PESQUISA INTEGRADA */}
      <div className="favoritos-search-container">
        <div className="search-box-favoritos">
          <Search size={20} className="search-icon-fav" />
          <input 
            type="text" 
            className="search-input-fav" 
            placeholder="Pesquisar nos seus favoritos..." 
            value={busca} 
            onChange={(e) => { setBusca(e.target.value); setFirst(0); }} 
          />
          {busca && <button className="btn-clear-fav" onClick={() => setBusca('')}>✕</button>}
        </div>
      </div>

      {promptsFiltrados.length === 0 ? (
        <div className="empty-msg">
          {busca ? "Nenhum favorito encontrado para esta busca." : "Você ainda não favoritou nenhum prompt."}
        </div>
      ) : (
        <>
          <div className="favoritos-list">
            {promptsPaginados.map(fav => (
              <div key={fav.id} className="favorito-item-card senior-size">
                 
                 <div className="fav-info" onClick={() => aoAbrir(fav)}>
                    <span className="badge-categoria">
                      <span style={{ marginRight: '6px' }}>
                        {categorias?.find(cat => cat.nome === fav.categoria)?.icone || '💡'}
                      </span>
                      {fav.categoria}
                    </span>
                    <h4>{fav.titulo}</h4>
                    <p className="fav-descricao-curta">
                        {fav.descricao || "Clique para visualizar os detalhes deste prompt."}
                    </p>
                 </div>
                 
                 <div className="fav-actions">
                    <button className="btn-icon" onClick={() => aoAbrir(fav)} title="Abrir">
                      <ExternalLink size={20} />
                    </button>
                    <button className="btn-icon danger" onClick={() => aoRemover(fav.id)} title="Remover">
                      <Trash2 size={20} />
                    </button>
                 </div>
              </div>
            ))}
          </div>

          {/* PAGINAÇÃO */}
          {promptsFiltrados.length > rows && (
            <div className="paginacao-favoritos">
              <Paginator 
                first={first} 
                rows={rows} 
                totalRecords={promptsFiltrados.length} 
                onPageChange={onPageChange} 
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" 
              />
            </div>  
          )}
        </>
      )}
    </div>
  );
};

export default PaginaFavoritos;