from flask import Blueprint, request, jsonify, g
from sqlalchemy import desc

from extensions import db
from models import Notificacao, Usuario, OrdemServico, ProdutoEstoque, Cliente
from auth_utils import login_required

bp = Blueprint('notificacoes', __name__)


@bp.get('/api/notificacoes')
@login_required
def listar_notificacoes():
    """Lista notificações do usuário logado."""
    try:
        # Busca notificações não lidas primeiro, depois as lidas
        notificacoes = Notificacao.query.filter_by(usuario_id=g.usuario_id)\
            .order_by(Notificacao.lida.asc(), desc(Notificacao.criado_em))\
            .limit(50)\
            .all()

        resultado = []
        for notif in notificacoes:
            resultado.append({
                "id": notif.id,
                "tipo": notif.tipo,
                "titulo": notif.titulo,
                "mensagem": notif.mensagem,
                "dados_referencia": notif.dados_referencia,
                "lida": notif.lida,
                "prioridade": notif.prioridade,
                "criado_em": notif.criado_em.isoformat() if notif.criado_em else None
            })

        return jsonify(resultado)

    except Exception as e:
        print(f"Erro ao listar notificações: {e}")
        return jsonify({"erro": "Erro interno do servidor"}), 500


@bp.put('/api/notificacoes/<int:notificacao_id>/lida')
@login_required
def marcar_como_lida(notificacao_id):
    """Marca uma notificação como lida."""
    try:
        notificacao = Notificacao.query.filter_by(
            id=notificacao_id,
            usuario_id=g.usuario_id
        ).first()

        if not notificacao:
            return jsonify({"erro": "Notificação não encontrada"}), 404

        notificacao.lida = True
        db.session.commit()

        return jsonify({"sucesso": True})

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao marcar notificação como lida: {e}")
        return jsonify({"erro": "Erro interno do servidor"}), 500


@bp.put('/api/notificacoes/marcar-todas-lidas')
@login_required
def marcar_todas_lidas():
    """Marca todas as notificações do usuário como lidas."""
    try:
        Notificacao.query.filter_by(
            usuario_id=g.usuario_id,
            lida=False
        ).update({"lida": True})

        db.session.commit()

        return jsonify({"sucesso": True})

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao marcar todas notificações como lidas: {e}")
        return jsonify({"erro": "Erro interno do servidor"}), 500


@bp.delete('/api/notificacoes/<int:notificacao_id>')
@login_required
def excluir_notificacao(notificacao_id):
    """Exclui uma notificação."""
    try:
        notificacao = Notificacao.query.filter_by(
            id=notificacao_id,
            usuario_id=g.usuario_id
        ).first()

        if not notificacao:
            return jsonify({"erro": "Notificação não encontrada"}), 404

        db.session.delete(notificacao)
        db.session.commit()

        return jsonify({"sucesso": True})

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao excluir notificação: {e}")
        return jsonify({"erro": "Erro interno do servidor"}), 500


@bp.get('/api/notificacoes/contador')
@login_required
def contador_notificacoes():
    """Retorna o número de notificações não lidas."""
    try:
        contador = Notificacao.query.filter_by(
            usuario_id=g.usuario_id,
            lida=False
        ).count()

        return jsonify({"nao_lidas": contador})

    except Exception as e:
        print(f"Erro ao contar notificações: {e}")
        return jsonify({"erro": "Erro interno do servidor"}), 500


# ================================
# FUNÇÕES PARA CRIAR NOTIFICAÇÕES
# ================================

def criar_notificacao_os_atrasada(os, usuario_id):
    """Cria notificação para OS atrasada."""
    titulo = f"OS {os.numero_os} - Prazo Vencido"
    mensagem = f"Cliente {os.cliente.nome} aguardando retorno. Prazo estimado excedido."

    notificacao = Notificacao(
        tipo="os_atrasada",
        titulo=titulo,
        mensagem=mensagem,
        dados_referencia={"os_id": os.id, "cliente_id": os.cliente_id},
        prioridade="alta",
        usuario_id=usuario_id
    )
    db.session.add(notificacao)


def criar_notificacao_estoque_critico(produto, usuario_id):
    """Cria notificação para estoque crítico."""
    titulo = f"{produto.nome} - Estoque Crítico"
    mensagem = f"Apenas {produto.quantidade} unidades disponíveis (mínimo: {produto.estoque_minimo})."

    notificacao = Notificacao(
        tipo="estoque_critico",
        titulo=titulo,
        mensagem=mensagem,
        dados_referencia={"produto_id": produto.id},
        prioridade="alta",
        usuario_id=usuario_id
    )
    db.session.add(notificacao)


def criar_notificacao_os_pronta(os, usuario_id):
    """Cria notificação para OS pronta."""
    titulo = f"OS {os.numero_os} - Pronta para Retirada"
    mensagem = f"Aparelho de {os.cliente.nome} está pronto. Cliente deve ser contactado."

    notificacao = Notificacao(
        tipo="os_pronta",
        titulo=titulo,
        mensagem=mensagem,
        dados_referencia={"os_id": os.id, "cliente_id": os.cliente_id},
        prioridade="normal",
        usuario_id=usuario_id
    )
    db.session.add(notificacao)


def criar_notificacao_cliente_novo(cliente, usuario_id):
    """Cria notificação para novo cliente."""
    titulo = f"Novo Cliente Cadastrado"
    mensagem = f"{cliente.nome} foi adicionado à base de dados."

    notificacao = Notificacao(
        tipo="cliente_novo",
        titulo=titulo,
        mensagem=mensagem,
        dados_referencia={"cliente_id": cliente.id},
        prioridade="baixa",
        usuario_id=usuario_id
    )
    db.session.add(notificacao)


def verificar_e_criar_notificacoes():
    """Verifica condições do sistema e cria notificações automaticamente."""
    try:
        # Busca todos os usuários ativos
        usuarios = Usuario.query.filter_by(ativo=True).all()

        for usuario in usuarios:
            # Verifica OS atrasadas
            from datetime import datetime, timedelta
            hoje = datetime.utcnow()

            os_atrasadas = OrdemServico.query.filter(
                OrdemServico.status.in_(['aguardando', 'em_reparo']),
                OrdemServico.criado_em + timedelta(days=OrdemServico.prazo_estimado) < hoje
            ).all()

            for os in os_atrasadas:
                # Verifica se já existe notificação para esta OS
                existente = Notificacao.query.filter_by(
                    tipo="os_atrasada",
                    usuario_id=usuario.id,
                    dados_referencia={"os_id": os.id, "cliente_id": os.cliente_id}
                ).first()

                if not existente:
                    criar_notificacao_os_atrasada(os, usuario.id)

            # Verifica estoque crítico
            produtos_criticos = ProdutoEstoque.query.filter(
                ProdutoEstoque.quantidade <= ProdutoEstoque.estoque_minimo
            ).all()

            for produto in produtos_criticos:
                # Verifica se já existe notificação para este produto
                existente = Notificacao.query.filter_by(
                    tipo="estoque_critico",
                    usuario_id=usuario.id,
                    dados_referencia={"produto_id": produto.id}
                ).first()

                if not existente:
                    criar_notificacao_estoque_critico(produto, usuario.id)

            # Verifica OS prontas
            os_prontas = OrdemServico.query.filter_by(status="pronto").all()

            for os in os_prontas:
                # Verifica se já existe notificação para esta OS
                existente = Notificacao.query.filter_by(
                    tipo="os_pronta",
                    usuario_id=usuario.id,
                    dados_referencia={"os_id": os.id, "cliente_id": os.cliente_id}
                ).first()

                if not existente:
                    criar_notificacao_os_pronta(os, usuario.id)

        db.session.commit()
        print("✅ Verificação de notificações concluída")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao verificar notificações: {e}")
