// ========================================
// AUTH.JS - Sistema de Autenticação
// ========================================
// Este arquivo gerencia login, logout e proteção de páginas

// ============================
// CONFIGURAÇÃO INICIAL
// ============================

// Usuário padrão do sistema (em produção, isso viria de um banco de dados)
const USUARIO_PADRAO = {
    usuario: 'admin',
    senha: 'admin123',
    nome: 'Administrador',
    email: 'admin@iasistem.com'
};

// Chave para armazenar a sessão
const CHAVE_SESSAO = 'ia_sistem_sessao';

// ============================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================

/**
 * Realiza o login do usuário
 * @param {string} usuario - Nome de usuário
 * @param {string} senha - Senha do usuário
 * @returns {boolean} true se login bem-sucedido, false caso contrário
 */
function fazerLogin(usuario, senha) {
    // Verifica se as credenciais estão corretas
    if (usuario === USUARIO_PADRAO.usuario && senha === USUARIO_PADRAO.senha) {
        // Cria objeto de sessão
        const sessao = {
            usuario: USUARIO_PADRAO.usuario,
            nome: USUARIO_PADRAO.nome,
            email: USUARIO_PADRAO.email,
            dataLogin: new Date().toISOString(),
            ativo: true
        };

        // Salva sessão no sessionStorage (persiste apenas enquanto navegador aberto)
        sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
        
        console.log('✅ Login realizado com sucesso!');
        return true;
    }
    
    console.log('❌ Credenciais inválidas!');
    return false;
}

/**
 * Realiza o logout do usuário
 */
function fazerLogout() {
    // Remove a sessão
    sessionStorage.removeItem(CHAVE_SESSAO);
    console.log('✅ Logout realizado com sucesso!');
    
    // Redireciona para página de login
    window.location.href = 'login.html';
}

/**
 * Verifica se o usuário está logado
 * @returns {boolean} true se logado, false caso contrário
 */
function estaLogado() {
    const sessao = sessionStorage.getItem(CHAVE_SESSAO);
    
    if (!sessao) {
        return false;
    }
    
    try {
        const dadosSessao = JSON.parse(sessao);
        return dadosSessao.ativo === true;
    } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
        return false;
    }
}

/**
 * Obtém os dados do usuário logado
 * @returns {object|null} Dados do usuário ou null se não logado
 */
function obterUsuarioLogado() {
    const sessao = sessionStorage.getItem(CHAVE_SESSAO);
    
    if (!sessao) {
        return null;
    }
    
    try {
        return JSON.parse(sessao);
    } catch (erro) {
        console.error('Erro ao obter usuário:', erro);
        return null;
    }
}

/**
 * Protege a página atual - redireciona para login se não estiver autenticado
 * Esta função deve ser chamada no início de cada página protegida
 */
function protegerPagina() {
    if (!estaLogado()) {
        console.log('⚠️ Acesso negado! Redirecionando para login...');
        window.location.href = 'login.html';
    }
}

/**
 * Redireciona para dashboard se já estiver logado
 * Útil para página de login (evita que usuário logado acesse login novamente)
 */
function redirecionarSeLogado() {
    if (estaLogado()) {
        console.log('ℹ️ Usuário já está logado. Redirecionando...');
        window.location.href = 'atendimento.html';
    }
}

/**
 * Atualiza informações do usuário na interface
 * Pode ser usada para mostrar nome do usuário no header
 */
function atualizarInfoUsuario() {
    const usuario = obterUsuarioLogado();
    
    if (usuario) {
        // Procura elementos que devem mostrar o nome do usuário
        const elementosNome = document.querySelectorAll('[data-usuario-nome]');
        elementosNome.forEach(elemento => {
            elemento.textContent = usuario.nome;
        });
        
        console.log('👤 Usuário logado:', usuario.nome);
    }
}

// ============================
// INICIALIZAÇÃO
// ============================

// Adiciona listener para o botão de logout (se existir na página)
document.addEventListener('DOMContentLoaded', function() {
    // Procura botões de logout em toda a página
    const botoesLogout = document.querySelectorAll('[data-logout], .btn-logout');
    
    botoesLogout.forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Confirma se usuário realmente quer sair
            if (confirm('Deseja realmente sair do sistema?')) {
                fazerLogout();
            }
        });
    });
    
    console.log('✅ auth.js carregado com sucesso!');
});


