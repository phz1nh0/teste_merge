// ========================================
// ESTOQUE.JS - Gerenciamento de Estoque
// ========================================
// Este arquivo contém todas as funções relacionadas ao módulo de estoque

// Chave para armazenar produtos no localStorage
const CHAVE_PRODUTOS = 'ia_sistem_produtos';

// Array que mantém os produtos em memória durante a sessão
let produtosEmMemoria = [];

// Variáveis globais
let produtosFiltrados = [];
let produtoAtual = null;
let paginaAtual = 1;
const itensPorPagina = 10;

// ============================
// FUNÇÕES DE DADOS
// ============================

/**
 * Carrega todos os produtos do localStorage
 */
function carregarProdutos() {
    const produtos = recuperarDados(CHAVE_PRODUTOS);
    produtosEmMemoria = produtos || [];
    return produtosEmMemoria;
}

/**
 * Salva todos os produtos no localStorage
 */
function salvarProdutos() {
    return salvarDados(CHAVE_PRODUTOS, produtosEmMemoria);
}

/**
 * Adiciona um novo produto
 */
function adicionarProduto(produto) {
    // Gera ID único para o produto
    produto.id = gerarId();
    produto.codigo = produto.codigo || gerarCodigoProduto();
    produto.dataCadastro = new Date().toISOString();
    produto.dataAtualizacao = new Date().toISOString();
    produto.quantidade = parseInt(produto.quantidade) || 0;
    produto.estoqueMinimo = parseInt(produto.estoqueMinimo) || 0;
    produto.precoCusto = parseFloat(produto.precoCusto?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    produto.precoVenda = parseFloat(produto.precoVenda?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    
    // Adiciona ao array
    produtosEmMemoria.push(produto);
    
    // Salva no localStorage
    salvarProdutos();
    
    console.log('✅ Produto adicionado:', produto.nome);
    return produto;
}

/**
 * Atualiza um produto existente
 */
function atualizarProduto(id, dadosAtualizados) {
    const indice = produtosEmMemoria.findIndex(p => p.id === id);
    
    if (indice === -1) {
        console.error('❌ Produto não encontrado:', id);
        return false;
    }
    
    // Mantém ID e data de cadastro, atualiza o resto
    dadosAtualizados.id = id;
    dadosAtualizados.codigo = produtosEmMemoria[indice].codigo;
    dadosAtualizados.dataCadastro = produtosEmMemoria[indice].dataCadastro;
    dadosAtualizados.dataAtualizacao = new Date().toISOString();
    dadosAtualizados.quantidade = parseInt(dadosAtualizados.quantidade) || 0;
    dadosAtualizados.estoqueMinimo = parseInt(dadosAtualizados.estoqueMinimo) || 0;
    dadosAtualizados.precoCusto = parseFloat(dadosAtualizados.precoCusto?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    dadosAtualizados.precoVenda = parseFloat(dadosAtualizados.precoVenda?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    
    produtosEmMemoria[indice] = dadosAtualizados;
    salvarProdutos();
    
    console.log('✅ Produto atualizado:', dadosAtualizados.nome);
    return true;
}

/**
 * Remove um produto
 */
function removerProduto(id) {
    const indice = produtosEmMemoria.findIndex(p => p.id === id);
    
    if (indice === -1) {
        console.error('❌ Produto não encontrado:', id);
        return false;
    }
    
    const nomeProduto = produtosEmMemoria[indice].nome;
    produtosEmMemoria.splice(indice, 1);
    salvarProdutos();
    
    console.log('✅ Produto removido:', nomeProduto);
    return true;
}

/**
 * Busca um produto por ID
 */
function buscarProdutoPorId(id) {
    return produtosEmMemoria.find(p => p.id === id) || null;
}

/**
 * Busca produtos por termo
 */
function buscarProdutos(termo) {
    if (!termo || termo.trim() === '') {
        return produtosEmMemoria;
    }
    
    const termoLower = termo.toLowerCase();
    
    return produtosEmMemoria.filter(produto => {
        return (
            produto.nome.toLowerCase().includes(termoLower) ||
            produto.codigo.toLowerCase().includes(termoLower) ||
            produto.categoria.toLowerCase().includes(termoLower) ||
            (produto.descricao && produto.descricao.toLowerCase().includes(termoLower))
        );
    });
}

/**
 * Gera código do produto
 */
function gerarCodigoProduto() {
    const proximoNumero = produtosEmMemoria.length + 1;
    return `P${proximoNumero.toString().padStart(4, '0')}`;
}

/**
 * Calcula status do estoque
 */
function calcularStatusEstoque(quantidade, estoqueMinimo) {
    if (quantidade <= 0) return 'sem_estoque';
    if (quantidade <= estoqueMinimo) return 'critico';
    if (quantidade <= estoqueMinimo * 1.5) return 'baixo';
    return 'ok';
}

/**
 * Valida formulário de produto
 */
function validarFormularioProduto(dados) {
    const erros = [];
    
    if (!dados.nome || dados.nome.trim() === '') {
        erros.push('Nome do produto é obrigatório');
    }
    
    if (!dados.categoria || dados.categoria.trim() === '') {
        erros.push('Categoria é obrigatória');
    }
    
    if (!dados.codigo || dados.codigo.trim() === '') {
        erros.push('Código é obrigatório');
    }
    
    if (dados.quantidade < 0) {
        erros.push('Quantidade não pode ser negativa');
    }
    
    if (dados.estoqueMinimo < 0) {
        erros.push('Estoque mínimo não pode ser negativo');
    }
    
    if (dados.precoCusto < 0) {
        erros.push('Preço de custo não pode ser negativo');
    }
    
    if (dados.precoVenda < 0) {
        erros.push('Preço de venda não pode ser negativo');
    }
    
    return {
        valido: erros.length === 0,
        erros: erros
    };
}

// ============================
// FUNÇÕES DE INTERFACE
// ============================

/**
 * Atualiza as estatísticas na tela
 */
function atualizarEstatisticas() {
    const total = produtosEmMemoria.length;
    const valorTotal = produtosEmMemoria.reduce((total, p) => total + (p.quantidade * p.precoCusto), 0);
    const estoqueBaixo = produtosEmMemoria.filter(p => calcularStatusEstoque(p.quantidade, p.estoqueMinimo) === 'baixo').length;
    const estoqueCritico = produtosEmMemoria.filter(p => calcularStatusEstoque(p.quantidade, p.estoqueMinimo) === 'critico').length;

    document.getElementById('totalProdutos').textContent = total;
    document.getElementById('valorTotal').textContent = `R$ ${valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('estoqueBaixo').textContent = estoqueBaixo;
    document.getElementById('estoqueCritico').textContent = estoqueCritico;
}

/**
 * Renderiza a tabela de produtos
 */
function renderizarTabela() {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosPagina = produtosFiltrados.slice(inicio, fim);

    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (produtosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--gray-medium);">
                    <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                    <div>Nenhum produto encontrado</div>
                    <div style="font-size: 14px; margin-top: 10px;">
                        ${produtosEmMemoria.length === 0 ? 'Cadastre seu primeiro produto!' : 'Tente ajustar os filtros de busca.'}
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    produtosPagina.forEach(produto => {
        const row = document.createElement('tr');
        const status = calcularStatusEstoque(produto.quantidade, produto.estoqueMinimo);
        const valorTotal = produto.quantidade * produto.precoCusto;
        
        row.innerHTML = `
            <td><strong>${produto.codigo}</strong></td>
            <td>
                <div class="product-info">
                    <div class="product-img">${getIconeCategoria(produto.categoria)}</div>
                    <div>
                        <div class="product-name">${produto.nome}</div>
                        ${produto.descricao ? `<div class="product-desc">${produto.descricao.substring(0, 50)}${produto.descricao.length > 50 ? '...' : ''}</div>` : ''}
                    </div>
                </div>
            </td>
            <td>${produto.categoria}</td>
            <td class="quantidade-cell ${status === 'critico' ? 'critico' : status === 'baixo' ? 'baixo' : ''}">
                <strong>${produto.quantidade}</strong>
            </td>
            <td>${produto.estoqueMinimo}</td>
            <td>R$ ${produto.precoCusto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>R$ ${valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td><span class="stock-badge ${status}">${getStatusText(status)}</span></td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn-small btn-view" onclick="visualizarProduto('${produto.id}')" title="Visualizar">
                        👁️
                    </button>
                    <button class="action-btn-small btn-edit" onclick="editarProduto('${produto.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="action-btn-small btn-delete" onclick="excluirProduto('${produto.id}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Renderiza a paginação
 */
function renderizarPaginacao() {
    const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
    const pagination = document.getElementById('pagination');
    
    if (totalPaginas <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginacaoHTML = '<div class="pagination-controls">';
    
    // Botão anterior
    if (paginaAtual > 1) {
        paginacaoHTML += `<button class="pagination-btn" onclick="irParaPagina(${paginaAtual - 1})">‹ Anterior</button>`;
    }
    
    // Números das páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === paginaAtual) {
            paginacaoHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginacaoHTML += `<button class="pagination-btn" onclick="irParaPagina(${i})">${i}</button>`;
        }
    }
    
    // Botão próximo
    if (paginaAtual < totalPaginas) {
        paginacaoHTML += `<button class="pagination-btn" onclick="irParaPagina(${paginaAtual + 1})">Próximo ›</button>`;
    }
    
    paginacaoHTML += '</div>';
    pagination.innerHTML = paginacaoHTML;
}

/**
 * Vai para uma página específica
 */
function irParaPagina(pagina) {
    paginaAtual = pagina;
    renderizarTabela();
    renderizarPaginacao();
}

/**
 * Aplica filtros de busca
 */
function aplicarFiltros() {
    const termoBusca = document.getElementById('searchInput').value.trim();
    const filtroCategoria = document.getElementById('categoryFilter').value;
    const filtroStatus = document.querySelector('.filter-btn.active[data-filter]')?.getAttribute('data-filter') || 'all';

    // Busca por termo
    let produtos = buscarProdutos(termoBusca);

    // Filtro por categoria
    if (filtroCategoria) {
        produtos = produtos.filter(p => p.categoria.toLowerCase() === filtroCategoria.toLowerCase());
    }

    // Filtro por status
    if (filtroStatus !== 'all') {
        produtos = produtos.filter(p => {
            const status = calcularStatusEstoque(p.quantidade, p.estoqueMinimo);
            return status === filtroStatus;
        });
    }

    produtosFiltrados = produtos;
    paginaAtual = 1;
    renderizarTabela();
    renderizarPaginacao();
}

/**
 * Limpa todos os filtros
 */
function limparFiltros() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    
    aplicarFiltros();
}

// ============================
// FUNÇÕES AUXILIARES
// ============================

/**
 * Retorna ícone da categoria
 */
function getIconeCategoria(categoria) {
    const icones = {
        'Telas': '📱',
        'Baterias': '🔋',
        'Câmeras': '📷',
        'Conectores': '🔌',
        'Alto-falantes': '🔊',
        'Outros': '🛠️'
    };
    return icones[categoria] || '📦';
}

/**
 * Retorna texto do status
 */
function getStatusText(status) {
    const statusMap = {
        'ok': 'OK',
        'baixo': 'Baixo',
        'critico': 'Crítico',
        'sem_estoque': 'Sem Estoque'
    };
    return statusMap[status] || status;
}

// ============================
// FUNÇÕES DE MODAL
// ============================

/**
 * Abre modal para novo produto ou edição
 */
function abrirModal(tipo, produtoId = null) {
    const modal = document.getElementById('modalProduto');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('formProduto');
    const submitBtn = document.getElementById('submitBtn');

    if (tipo === 'novoProduto') {
        modalTitle.textContent = 'Novo Produto';
        form.reset();
        document.getElementById('produtoId').value = '';
        document.getElementById('codigo').value = gerarCodigoProduto();
        submitBtn.textContent = 'Cadastrar Produto';
    } else if (tipo === 'editarProduto' && produtoId) {
        const produto = buscarProdutoPorId(produtoId);
        if (produto) {
            modalTitle.textContent = 'Editar Produto';
            preencherFormulario(produto);
            submitBtn.textContent = 'Atualizar Produto';
        }
    }

    modal.classList.add('active');
}

/**
 * Fecha todos os modais
 */
function fecharModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

/**
 * Preenche formulário com dados do produto
 */
function preencherFormulario(produto) {
    document.getElementById('produtoId').value = produto.id;
    document.getElementById('codigo').value = produto.codigo;
    document.getElementById('categoria').value = produto.categoria;
    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao || '';
    document.getElementById('quantidade').value = produto.quantidade;
    document.getElementById('estoqueMinimo').value = produto.estoqueMinimo;
    document.getElementById('precoCusto').value = `R$ ${produto.precoCusto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('precoVenda').value = `R$ ${produto.precoVenda.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('fornecedor').value = produto.fornecedor || '';
    document.getElementById('localizacao').value = produto.localizacao || '';
}

// ============================
// FUNÇÕES DE CRUD
// ============================

/**
 * Visualiza detalhes do produto
 */
function visualizarProduto(id) {
    const produto = buscarProdutoPorId(id);
    if (!produto) return;

    produtoAtual = produto;
    const modal = document.getElementById('modalVisualizar');
    const detalhes = document.getElementById('produtoDetalhes');

    const status = calcularStatusEstoque(produto.quantidade, produto.estoqueMinimo);
    const valorTotal = produto.quantidade * produto.precoCusto;

    detalhes.innerHTML = `
        <div class="product-details">
            <div class="product-header">
                <div class="product-icon-large">${getIconeCategoria(produto.categoria)}</div>
                <div class="product-info-large">
                    <h3>${produto.nome}</h3>
                    <p class="product-category">${produto.categoria}</p>
                </div>
            </div>
            
            <div class="product-details-grid">
                <div class="detail-item">
                    <label>Código:</label>
                    <span>${produto.codigo}</span>
                </div>
                <div class="detail-item">
                    <label>Quantidade:</label>
                    <span class="${status === 'critico' ? 'critico' : status === 'baixo' ? 'baixo' : ''}">${produto.quantidade} unidades</span>
                </div>
                <div class="detail-item">
                    <label>Estoque Mínimo:</label>
                    <span>${produto.estoqueMinimo} unidades</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="stock-badge ${status}">${getStatusText(status)}</span>
                </div>
                <div class="detail-item">
                    <label>Preço de Custo:</label>
                    <span>R$ ${produto.precoCusto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="detail-item">
                    <label>Preço de Venda:</label>
                    <span>R$ ${produto.precoVenda.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="detail-item">
                    <label>Valor Total:</label>
                    <span>R$ ${valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="detail-item">
                    <label>Fornecedor:</label>
                    <span>${produto.fornecedor || 'Não informado'}</span>
                </div>
                <div class="detail-item">
                    <label>Localização:</label>
                    <span>${produto.localizacao || 'Não informado'}</span>
                </div>
                <div class="detail-item">
                    <label>Data de Cadastro:</label>
                    <span>${formatarDataHora(produto.dataCadastro)}</span>
                </div>
                ${produto.descricao ? `
                <div class="detail-item full-width">
                    <label>Descrição:</label>
                    <span>${produto.descricao}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Edita produto
 */
function editarProduto(id) {
    abrirModal('editarProduto', id);
}

/**
 * Edita o produto atual (do modal de visualização)
 */
function editarProdutoAtual() {
    if (produtoAtual) {
        fecharModal();
        setTimeout(() => {
            editarProduto(produtoAtual.id);
        }, 300);
    }
}

/**
 * Exclui produto
 */
function excluirProduto(id) {
    const produto = buscarProdutoPorId(id);
    if (!produto) return;

    if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        if (removerProduto(id)) {
            alert('Produto excluído com sucesso!');
            aplicarFiltros();
            atualizarEstatisticas();
        } else {
            alert('Erro ao excluir produto. Tente novamente.');
        }
    }
}

/**
 * Exporta lista de produtos
 */
function exportarProdutos() {
    if (produtosFiltrados.length === 0) {
        alert('Nenhum produto para exportar.');
        return;
    }

    let csv = 'Código,Nome,Categoria,Quantidade,Estoque Mínimo,Preço Custo,Preço Venda,Valor Total,Status,Fornecedor\n';
    
    produtosFiltrados.forEach(produto => {
        const status = calcularStatusEstoque(produto.quantidade, produto.estoqueMinimo);
        const valorTotal = produto.quantidade * produto.precoCusto;
        
        csv += `"${produto.codigo}","${produto.nome}","${produto.categoria}","${produto.quantidade}","${produto.estoqueMinimo}","R$ ${produto.precoCusto.toFixed(2)}","R$ ${produto.precoVenda.toFixed(2)}","R$ ${valorTotal.toFixed(2)}","${getStatusText(status)}","${produto.fornecedor || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `produtos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================
// INICIALIZAÇÃO
// ============================

// Carrega produtos ao iniciar
carregarProdutos();
console.log('✅ estoque.js carregado com sucesso!');
console.log('📊 Total de produtos:', produtosEmMemoria.length);

