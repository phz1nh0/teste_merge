// ========================================
// FINANCEIRO.JS - Lógica específica da página financeiro
// ========================================

// Variáveis globais para armazenar dados em memória
let osEmMemoria = [];
let clientesEmMemoria = [];
let produtosEmMemoria = [];

// Variáveis de controle
let periodoAtual = 'mes_atual';
let dataInicioFiltro = null;
let dataFimFiltro = null;
let chartReceitasVsCustos = null;

// ============================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// ============================

/**
 * Carrega todas as OS da API
 */
async function carregarOS() {
    try {
        console.log('📡 Carregando OS para financeiro...');
        const os = await listarOSApi();
        osEmMemoria = os || [];
        console.log('✅ OS carregadas:', osEmMemoria.length);
        return osEmMemoria;
    } catch (e) {
        console.error('❌ Erro ao carregar OS:', e);
        osEmMemoria = [];
        return osEmMemoria;
    }
}

/**
 * Carrega todos os clientes da API
 */
async function carregarClientes() {
    try {
        console.log('📡 Carregando clientes para financeiro...');
        const clientes = await listarClientesApi();
        clientesEmMemoria = clientes || [];
        console.log('✅ Clientes carregados:', clientesEmMemoria.length);
        return clientesEmMemoria;
    } catch (e) {
        console.error('❌ Erro ao carregar clientes:', e);
        clientesEmMemoria = [];
        return clientesEmMemoria;
    }
}

/**
 * Carrega todos os produtos da API
 */
async function carregarProdutos() {
    try {
        console.log('📡 Carregando produtos para financeiro...');
        const produtos = await listarProdutosApi();
        produtosEmMemoria = produtos || [];
        console.log('✅ Produtos carregados:', produtosEmMemoria.length);
        return produtosEmMemoria;
    } catch (e) {
        console.error('❌ Erro ao carregar produtos:', e);
        produtosEmMemoria = [];
        return produtosEmMemoria;
    }
}

// ============================
// FUNÇÕES DE CÁLCULO FINANCEIRO
// ============================

/**
 * Calcula métricas financeiras baseado no período
 */
function calcularMetricasFinanceiras() {
    const { inicio, fim } = getPeriodoDatas();

    // Filtra OS do período e status entregue
    const osPeriodo = osEmMemoria.filter(os => {
        if (os.status !== 'entregue') return false;
        const dataOS = new Date(os.dataCriacao);
        return dataOS >= inicio && dataOS <= fim;
    });

    // Calcula receitas (valor das OS entregues)
    const receitas = osPeriodo.reduce((total, os) => total + (os.valorOrcamento || 0), 0);

    // Calcula custos (estimativa baseada em produtos com estoque baixo)
    const custos = produtosEmMemoria.reduce((total, produto) => {
        // Estimativa: custo médio por produto x quantidade em estoque baixa
        const custoEstimado = produto.quantidade < produto.estoqueMinimo ?
            (produto.precoCusto || 0) * (produto.estoqueMinimo - produto.quantidade) : 0;
        return total + custoEstimado;
    }, 0);

    const lucro = receitas - custos;
    const margem = receitas > 0 ? ((lucro / receitas) * 100) : 0;

    // Atualiza indicadores na interface
    document.getElementById('totalReceitas').textContent = formatarMoeda(receitas);
    document.getElementById('totalCustos').textContent = formatarMoeda(custos);
    document.getElementById('totalLucro').textContent = formatarMoeda(lucro);
    document.getElementById('margemLucro').textContent = margem.toFixed(1) + '%';

    // Atualiza labels de período
    const periodoLabel = getPeriodoLabel();
    document.getElementById('receitasPeriodo').textContent = periodoLabel;
    document.getElementById('custosPeriodo').textContent = periodoLabel;
    document.getElementById('lucroPeriodo').textContent = periodoLabel;
    document.getElementById('margemPeriodo').textContent = periodoLabel;

    // Atualiza cores dos indicadores
    atualizarCoresIndicadores(lucro, margem);

    console.log(`📊 Receitas: ${formatarMoeda(receitas)}, Custos: ${formatarMoeda(custos)}, Lucro: ${formatarMoeda(lucro)}`);
}

/**
 * Atualiza cores dos indicadores baseado no resultado
 */
function atualizarCoresIndicadores(lucro, margem) {
    const lucroCard = document.querySelector('.indicator-card.profit');
    const margemCard = document.querySelector('.indicator-card.margin');

    // Remove classes anteriores
    lucroCard.classList.remove('positive', 'negative');
    margemCard.classList.remove('positive', 'negative');

    // Adiciona classes baseadas no valor
    if (lucro > 0) {
        lucroCard.classList.add('positive');
    } else if (lucro < 0) {
        lucroCard.classList.add('negative');
    }

    if (margem > 20) {
        margemCard.classList.add('positive');
    } else if (margem < 10) {
        margemCard.classList.add('negative');
    }
}

// ============================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================

/**
 * Renderiza gráfico de receitas vs custos
 */
function renderizarGrafico() {
    const ctx = document.getElementById('receitasVsCustosChart');
    if (!ctx) return;

    // Dados para os últimos 6 meses
    const dadosGrafico = gerarDadosGrafico();

    if (chartReceitasVsCustos) {
        chartReceitasVsCustos.destroy();
    }

    chartReceitasVsCustos = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosGrafico.labels,
            datasets: [{
                label: 'Receitas',
                data: dadosGrafico.receitas,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Custos',
                data: dadosGrafico.custos,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Receitas vs Custos - Últimos 6 meses'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

/**
 * Gera dados para o gráfico (últimos 6 meses)
 */
function gerarDadosGrafico() {
    const labels = [];
    const receitas = [];
    const custos = [];

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);

        const mes = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        labels.push(mes);

        // Calcula receitas do mês
        const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
        const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);

        const receitasMes = osEmMemoria
            .filter(os => {
                if (os.status !== 'entregue') return false;
                const dataOS = new Date(os.dataCriacao);
                return dataOS >= inicioMes && dataOS <= fimMes;
            })
            .reduce((total, os) => total + (os.valorOrcamento || 0), 0);

        // Custos estimados (igual para todos os meses por enquanto)
        const custosMes = produtosEmMemoria.reduce((total, produto) => {
            return total + ((produto.precoCusto || 0) * Math.max(0, produto.estoqueMinimo - produto.quantidade));
        }, 0) / 6; // Divide pelos 6 meses

        receitas.push(receitasMes);
        custos.push(custosMes);
    }

    return { labels, receitas, custos };
}

/**
 * Renderiza relatórios detalhados
 */
function renderizarRelatorios() {
    renderizarRelatorioReceitas();
    renderizarRelatorioCustos();
    renderizarRelatorioLucro();
    renderizarRelatorioProdutividade();
}

/**
 * Renderiza relatório de receitas
 */
function renderizarRelatorioReceitas() {
    const { inicio, fim } = getPeriodoDatas();

    const osReceitas = osEmMemoria
        .filter(os => {
            if (os.status !== 'entregue') return false;
            const dataOS = new Date(os.dataCriacao);
            return dataOS >= inicio && dataOS <= fim;
        })
        .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

    const tbody = document.getElementById('receitasTableBody');
    const count = document.getElementById('receitasCount');

    count.textContent = osReceitas.length + ' OS concluídas';

    if (osReceitas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">Nenhuma OS concluída no período</td></tr>';
        return;
    }

    tbody.innerHTML = osReceitas.map(os => `
        <tr>
            <td><strong>${os.numeroOS}</strong></td>
            <td>${os.clienteNome || 'Cliente não informado'}</td>
            <td>${formatarData(os.dataCriacao)}</td>
            <td>${formatarMoeda(os.valorOrcamento || 0)}</td>
        </tr>
    `).join('');
}

/**
 * Renderiza relatório de custos
 */
function renderizarRelatorioCustos() {
    // Por enquanto, mostra produtos com estoque baixo (custos estimados)
    const produtosCustos = produtosEmMemoria
        .filter(p => p.quantidade < p.estoqueMinimo)
        .sort((a, b) => ((b.estoqueMinimo - b.quantidade) * (b.precoCusto || 0)) - ((a.estoqueMinimo - a.quantidade) * (a.precoCusto || 0)));

    const tbody = document.getElementById('custosTableBody');
    const count = document.getElementById('custosCount');

    count.textContent = `${produtosCustos.length} produtos com reposição necessária`;

    if (produtosCustos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Nenhum custo identificado no período</td></tr>';
        return;
    }

    tbody.innerHTML = produtosCustos.map(produto => {
        const qtdNecessaria = produto.estoqueMinimo - produto.quantidade;
        const custoUnitario = produto.precoCusto || 0;
        const custoTotal = qtdNecessaria * custoUnitario;

        return `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.categoria}</td>
                <td>${qtdNecessaria}</td>
                <td>${formatarMoeda(custoUnitario)}</td>
                <td>${formatarMoeda(custoTotal)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Renderiza relatório de lucro
 */
function renderizarRelatorioLucro() {
    const { inicio, fim } = getPeriodoDatas();

    const osPeriodo = osEmMemoria.filter(os => {
        if (os.status !== 'entregue') return false;
        const dataOS = new Date(os.dataCriacao);
        return dataOS >= inicio && dataOS <= fim;
    });

    const receitas = osPeriodo.reduce((total, os) => total + (os.valorOrcamento || 0), 0);
    const custos = produtosEmMemoria.reduce((total, produto) => {
        return total + ((produto.precoCusto || 0) * Math.max(0, produto.estoqueMinimo - produto.quantidade));
    }, 0);

    const lucro = receitas - custos;
    const margem = receitas > 0 ? ((lucro / receitas) * 100) : 0;

    document.getElementById('resumoReceitas').textContent = formatarMoeda(receitas);
    document.getElementById('resumoCustos').textContent = formatarMoeda(custos);
    document.getElementById('resumoLucro').textContent = formatarMoeda(lucro);
    document.getElementById('resumoMargem').textContent = margem.toFixed(1) + '%';
}

/**
 * Renderiza relatório de produtividade
 */
function renderizarRelatorioProdutividade() {
    const { inicio, fim } = getPeriodoDatas();

    const osPeriodo = osEmMemoria.filter(os => {
        const dataOS = new Date(os.dataCriacao);
        return dataOS >= inicio && dataOS <= fim;
    });

    const osConcluidasMes = osPeriodo.filter(os => os.status === 'entregue').length;

    // Tempo médio (estimativa baseada na diferença entre criação e entrega)
    const osComTempo = osPeriodo.filter(os => os.status === 'entregue');
    const tempoTotal = osComTempo.reduce((total, os) => {
        // Estimativa simples: 3 dias por OS
        return total + 3;
    }, 0);
    const tempoMedio = osComTempo.length > 0 ? tempoTotal / osComTempo.length : 0;

    const ticketMedio = osComTempo.length > 0 ?
        osComTempo.reduce((total, os) => total + (os.valorOrcamento || 0), 0) / osComTempo.length : 0;

    // Crescimento mensal (simplificado)
    const crescimento = 0; // TODO: implementar cálculo real

    document.getElementById('osConcluidasMes').textContent = osConcluidasMes;
    document.getElementById('tempoMedioOS').textContent = tempoMedio.toFixed(1) + ' dias';
    document.getElementById('ticketMedio').textContent = formatarMoeda(ticketMedio);
    document.getElementById('crescimentoMensal').textContent = crescimento + '%';
}

// ============================
// FUNÇÕES UTILITÁRIAS
// ============================

/**
 * Retorna datas do período selecionado
 */
function getPeriodoDatas() {
    const hoje = new Date();

    if (periodoAtual === 'mes_atual') {
        return {
            inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
            fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
        };
    } else if (periodoAtual === 'mes_anterior') {
        const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        return {
            inicio: mesPassado,
            fim: new Date(hoje.getFullYear(), hoje.getMonth(), 0)
        };
    } else if (periodoAtual === 'ultimos_3_meses') {
        return {
            inicio: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1),
            fim: hoje
        };
    } else if (periodoAtual === 'ultimos_6_meses') {
        return {
            inicio: new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1),
            fim: hoje
        };
    } else if (periodoAtual === 'ano_atual') {
        return {
            inicio: new Date(hoje.getFullYear(), 0, 1),
            fim: hoje
        };
    } else if (periodoAtual === 'personalizado' && dataInicioFiltro && dataFimFiltro) {
        return {
            inicio: dataInicioFiltro,
            fim: dataFimFiltro
        };
    }

    // Padrão: mês atual
    return {
        inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
        fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    };
}

/**
 * Retorna label do período
 */
function getPeriodoLabel() {
    const labels = {
        'mes_atual': 'Este mês',
        'mes_anterior': 'Mês passado',
        'ultimos_3_meses': 'Últimos 3 meses',
        'ultimos_6_meses': 'Últimos 6 meses',
        'ano_atual': 'Este ano',
        'personalizado': 'Período personalizado'
    };
    return labels[periodoAtual] || 'Este mês';
}

/**
 * Formata valor monetário
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Formata data
 */
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// ============================
// CONTROLES DE INTERFACE
// ============================

/**
 * Carrega dados financeiros baseado no período
 */
async function carregarDadosFinanceiros() {
    try {
        console.log('💰 Carregando dados financeiros para período:', periodoAtual);

        // Carrega OS, clientes e produtos
        await Promise.all([
            carregarOS(),
            carregarClientes(),
            carregarProdutos()
        ]);

        // Calcula métricas
        calcularMetricasFinanceiras();
        renderizarGrafico();
        renderizarRelatorios();

        console.log('✅ Dados financeiros carregados');
    } catch (error) {
        console.error('❌ Erro ao carregar dados financeiros:', error);
    }
}

/**
 * Aplica filtro personalizado
 */
function aplicarFiltroPersonalizado() {
    const inicio = document.getElementById('dataInicio').value;
    const fim = document.getElementById('dataFim').value;

    if (inicio && fim) {
        dataInicioFiltro = new Date(inicio + 'T00:00:00');
        dataFimFiltro = new Date(fim + 'T23:59:59');
        carregarDadosFinanceiros();
    }
}

/**
 * Exporta relatório
 */
function exportarRelatorio(formato) {
    if (formato === 'csv') {
        exportarCSV();
    } else if (formato === 'pdf') {
        exportarPDF();
    }
}

/**
 * Exporta dados em CSV
 */
function exportarCSV() {
    const { inicio, fim } = getPeriodoDatas();

    const osPeriodo = osEmMemoria.filter(os => {
        if (os.status !== 'entregue') return false;
        const dataOS = new Date(os.dataCriacao);
        return dataOS >= inicio && dataOS <= fim;
    });

    let csv = 'OS,Cliente,Data Conclusão,Valor\n';

    osPeriodo.forEach(os => {
        csv += `"${os.numeroOS}","${os.clienteNome || 'Cliente não informado'}","${formatarData(os.dataCriacao)}","${(os.valorOrcamento || 0).toFixed(2)}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporta dados em PDF (simplificado)
 */
function exportarPDF() {
    alert('Funcionalidade de exportação PDF será implementada em breve!');
}

// ============================
// INICIALIZAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', async function() {
    // Protege a página
    protegerPagina();

    // Atualiza informações do usuário
    atualizarInfoUsuario();

    // Carrega dados iniciais
    await carregarDadosFinanceiros();

    // Configura event listeners
    configurarEventListeners();

    console.log('✅ Página financeiro carregada!');
});

/**
 * Configura event listeners
 */
function configurarEventListeners() {
    // Mudança de período
    const periodoSelect = document.getElementById('periodoSelect');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', function() {
            periodoAtual = this.value;

            const dateRange = document.getElementById('dateRange');
            if (dateRange) {
                if (periodoAtual === 'personalizado') {
                    dateRange.style.display = 'block';
                } else {
                    dateRange.style.display = 'none';
                    dataInicioFiltro = null;
                    dataFimFiltro = null;
                    carregarDadosFinanceiros();
                }
            }
        });
    }

    // Tabs dos relatórios
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active de todos
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.report-tab').forEach(tab => tab.classList.remove('active'));

            // Adiciona active no selecionado
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab') + 'Tab';
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.add('active');
            }
        });
    });
}

console.log('✅ financeiro.js carregado com sucesso!');
