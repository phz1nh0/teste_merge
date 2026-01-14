-- Script de criação do banco de dados assistencia_tecnica
-- Otimizado para uso com o backend Flask desta aplicação

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `assistencia_tecnica`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `assistencia_tecnica`;

-- =========================================================
-- TABELA: clientes
-- Reflete o model Cliente (models.Cliente)
-- =========================================================

DROP TABLE IF EXISTS `ordens_servico`;
DROP TABLE IF EXISTS `produtos_estoque`;
DROP TABLE IF EXISTS `clientes`;
DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `clientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `cpf_cnpj` VARCHAR(14) NOT NULL,
  `tipo_pessoa` VARCHAR(20) NOT NULL DEFAULT 'pessoa_fisica',
  `endereco` VARCHAR(200) DEFAULT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  `observacoes` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ativo',
  `criado_em` DATETIME NOT NULL,
  `atualizado_em` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clientes_cpf_cnpj` (`cpf_cnpj`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices auxiliares
CREATE INDEX `idx_clientes_nome` ON `clientes` (`nome`);
CREATE INDEX `idx_clientes_email` ON `clientes` (`email`);

-- =========================================================
-- TABELA: produtos_estoque
-- Reflete o model ProdutoEstoque (models.ProdutoEstoque)
-- =========================================================

CREATE TABLE `produtos_estoque` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(20) NOT NULL,
  `nome` VARCHAR(150) NOT NULL,
  `categoria` VARCHAR(50) NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `quantidade` INT NOT NULL DEFAULT 0,
  `estoque_minimo` INT NOT NULL DEFAULT 0,
  `preco_custo` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `preco_venda` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `fornecedor` VARCHAR(150) DEFAULT NULL,
  `localizacao` VARCHAR(100) DEFAULT NULL,
  `criado_em` DATETIME NOT NULL,
  `atualizado_em` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produtos_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_produtos_categoria` ON `produtos_estoque` (`categoria`);

-- =========================================================
-- TABELA: ordens_servico
-- Reflete o model OrdemServico (models.OrdemServico)
-- =========================================================

CREATE TABLE `ordens_servico` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_os` VARCHAR(20) NOT NULL,
  `cliente_id` INT NOT NULL,
  `tipo_aparelho` VARCHAR(50) NOT NULL,
  `marca_modelo` VARCHAR(100) NOT NULL,
  `imei_serial` VARCHAR(100) DEFAULT NULL,
  `cor_aparelho` VARCHAR(50) DEFAULT NULL,
  `problema_relatado` VARCHAR(400) NOT NULL,
  `diagnostico_tecnico` VARCHAR(400) DEFAULT NULL,
  `prazo_estimado` INT NOT NULL DEFAULT 3,
  `valor_orcamento` DECIMAL(10,2) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'aguardando',
  `prioridade` VARCHAR(20) NOT NULL DEFAULT 'normal',
  `observacoes` TEXT DEFAULT NULL,
  `criado_em` DATETIME NOT NULL,
  `atualizado_em` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ordens_numero_os` (`numero_os`),
  KEY `idx_ordens_cliente_id` (`cliente_id`),
  CONSTRAINT `fk_ordens_cliente`
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_ordens_status` ON `ordens_servico` (`status`);
CREATE INDEX `idx_ordens_prioridade` ON `ordens_servico` (`prioridade`);

-- =========================================================
-- TABELA: usuarios
-- Reflete o model Usuario (models.Usuario)
-- =========================================================

CREATE TABLE `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario` VARCHAR(50) NOT NULL,
  `senha_hash` VARCHAR(255) NOT NULL,
  `nome` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `criado_em` DATETIME NOT NULL,
  `atualizado_em` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_usuario` (`usuario`),
  UNIQUE KEY `uq_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;



