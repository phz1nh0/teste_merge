// ========================================
// AUTH.JS - Sistema de Autenticação JWT
// ========================================
// Este arquivo gerencia login, logout e proteção de páginas usando JWT

// ============================
// CONFIGURAÇÃO INICIAL
// ============================

// Chave para armazenar o token JWT
const CHAVE_TOKEN = 'ia_sistem_token';
const CHAVE_USUARIO = 'ia_sistem_usuario';

// URL base da API
const API_AUTH_URL = 'http://127.0.0.1:5000/api/auth';

// ============================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================

/**
 * Realiza o login do usuário via API
 * @param {string} usuario - Nome de usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<boolean>} Promise que resolve para true se login bem-sucedido
 */
async function fazerLogin(usuario, senha) {
    try {
        const response = await fetch(`${API_AUTH_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario, senha })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.mensagem || 'Erro no login');
        }

        const data = await response.json();

        // Salva token e dados do usuário
        localStorage.setItem(CHAVE_TOKEN, data.token);
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(data.usuario));

        console.log('✅ Login realizado com sucesso!');
        return true;

    } catch (error) {
        console.error('❌ Erro no login:', error);
        throw error;
    }
}

/**
 * Realiza o logout do usuário
 */
function fazerLogout() {
    // Remove token e dados do usuário
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    console.log('✅ Logout realizado com sucesso!');

    // Redireciona para página de login
    window.location.href = '/login';
}

/**
 * Verifica se o usuário está logado (token válido)
 * @returns {boolean} true se logado e token válido, false caso contrário
 */
function estaLogado() {
    const token = obterToken();
    if (!token) return false;

    try {
        // Decodifica o payload do JWT (sem verificar assinatura no frontend)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const agora = Date.now() / 1000;

        // Verifica se não expirou
        return payload.exp > agora;
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return false;
    }
}

/**
 * Obtém o token JWT armazenado
 * @returns {string|null} Token JWT ou null se não existir
 */
function obterToken() {
    return localStorage.getItem(CHAVE_TOKEN);
}

/**
 * Obtém os dados do usuário logado
 * @returns {object|null} Dados do usuário ou null se não logado
 */
function obterUsuarioLogado() {
    const usuarioStr = localStorage.getItem(CHAVE_USUARIO);

    if (!usuarioStr) {
        return null;
    }

    try {
        return JSON.parse(usuarioStr);
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
        window.location.href = '/login';
    }
}

/**
 * Redireciona para dashboard se já estiver logado
 * Útil para página de login (evita que usuário logado acesse login novamente)
 */
function redirecionarSeLogado() {
    if (estaLogado()) {
        console.log('ℹ️ Usuário já está logado. Redirecionando...');
        window.location.href = '/atendimento';
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

/**
 * Atualiza o cabeçalho Authorization para requests autenticados
 * @param {object} config - Configuração do fetch
 * @returns {object} Configuração atualizada com Authorization header
 */
function adicionarAuthHeader(config = {}) {
    const token = obterToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
}

// ============================
// FUNÇÕES DE REGISTRO (DESENVOLVIMENTO)
// ============================

/**
 * Registra um novo usuário (apenas para desenvolvimento)
 * @param {string} usuario - Nome de usuário
 * @param {string} senha - Senha
 * @param {string} nome - Nome completo
 * @param {string} email - Email (opcional)
 * @returns {Promise<boolean>} Promise que resolve para true se registro bem-sucedido
 */
async function registrarUsuario(usuario, senha, nome, email = '') {
    try {
        const response = await fetch(`${API_AUTH_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario, senha, nome, email })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.mensagem || 'Erro no registro');
        }

        const data = await response.json();

        // Salva token e dados do usuário automaticamente
        localStorage.setItem(CHAVE_TOKEN, data.token);
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(data.usuario));

        console.log('✅ Registro realizado com sucesso!');
        return true;

    } catch (error) {
        console.error('❌ Erro no registro:', error);
        throw error;
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

    console.log('✅ auth.js (JWT) carregado com sucesso!');
});
