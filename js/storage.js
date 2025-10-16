// ========================================
// STORAGE.JS - Gerenciamento de Dados
// ========================================
// Este arquivo contém funções auxiliares para trabalhar com localStorage
// Facilita salvar, recuperar e manipular dados do navegador

/**
 * Salva dados no localStorage
 * @param {string} chave - Nome da chave para armazenar
 * @param {any} dados - Dados a serem salvos (será convertido para JSON)
 */
function salvarDados(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error('Erro ao salvar dados:', erro);
        return false;
    }
}

/**
 * Recupera dados do localStorage
 * @param {string} chave - Nome da chave para recuperar
 * @returns {any} Dados recuperados ou null se não existir
 */
function recuperarDados(chave) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : null;
    } catch (erro) {
        console.error('Erro ao recuperar dados:', erro);
        return null;
    }
}

/**
 * Remove dados do localStorage
 * @param {string} chave - Nome da chave a ser removida
 */
function removerDados(chave) {
    try {
        localStorage.removeItem(chave);
        return true;
    } catch (erro) {
        console.error('Erro ao remover dados:', erro);
        return false;
    }
}

/**
 * Limpa todos os dados do localStorage
 */
function limparTodosDados() {
    try {
        localStorage.clear();
        return true;
    } catch (erro) {
        console.error('Erro ao limpar dados:', erro);
        return false;
    }
}

/**
 * Gera um ID único para novos registros
 * @returns {string} ID único baseado em timestamp
 */
function gerarId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Formata data no padrão brasileiro (DD/MM/YYYY)
 * @param {Date|string} data - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatarData(data) {
    const dataObj = data instanceof Date ? data : new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

/**
 * Formata data e hora no padrão brasileiro
 * @param {Date|string} data - Data a ser formatada
 * @returns {string} Data e hora formatadas
 */
function formatarDataHora(data) {
    const dataObj = data instanceof Date ? data : new Date(data);
    const dataFormatada = formatarData(dataObj);
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');
    return `${dataFormatada} às ${hora}:${minuto}`;
}

// Log de inicialização
console.log('✅ storage.js carregado com sucesso!');


