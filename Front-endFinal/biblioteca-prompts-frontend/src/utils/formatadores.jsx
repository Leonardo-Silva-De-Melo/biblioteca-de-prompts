/**
 * Formata uma data ISO para o formato brasileiro dd/mm/aaaa.
 * @param {string|Date} data
 * @returns {string}
 */
export const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
};

/**
 * Renderiza um componente JSX de estrelas baseado em uma nota média.
 * @param {number} notaMedia - Nota de 0 a 5
 * @returns {JSX.Element}
 */
export const renderizarEstrelas = (notaMedia) => {
    const notaArredondada = Math.round(Number(notaMedia) || 0);
    const estrelas = [];

    for (let i = 1; i <= 5; i++) {
        estrelas.push(
            <span
                key={i}
                style={{
                    color: i <= notaArredondada ? '#f59e0b' : '#cbd5e1',
                    fontSize: '1.2rem',
                    lineHeight: '1',
                }}
            >
                ★
            </span>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {estrelas}
        </div>
    );
};
