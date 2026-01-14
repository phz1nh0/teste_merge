from flask import Blueprint, jsonify, request, abort

from extensions import db
from models import ProdutoEstoque
from auth_utils import login_required

bp = Blueprint("estoque", __name__)


def produto_to_dict(produto: ProdutoEstoque) -> dict:
    return {
        "id": produto.id,
        "codigo": produto.codigo,
        "nome": produto.nome,
        "categoria": produto.categoria,
        "descricao": produto.descricao,
        "quantidade": produto.quantidade,
        "estoqueMinimo": produto.estoque_minimo,
        "precoCusto": float(produto.preco_custo or 0),
        "precoVenda": float(produto.preco_venda or 0),
        "fornecedor": produto.fornecedor,
        "localizacao": produto.localizacao,
        "dataCadastro": produto.criado_em.isoformat() if produto.criado_em else None,
        "dataAtualizacao": produto.atualizado_em.isoformat() if produto.atualizado_em else None,
    }


@bp.get("/")
@login_required
def listar_produtos():
    produtos = ProdutoEstoque.query.order_by(ProdutoEstoque.criado_em.desc()).all()
    return jsonify([produto_to_dict(p) for p in produtos])


@bp.post("/")
@login_required
def criar_produto():
    data = request.get_json() or {}

    obrigatorios = ["nome", "categoria", "codigo"]
    if not all(data.get(c) for c in obrigatorios):
        abort(400, description="Campos obrigatórios: nome, categoria, codigo")

    # Verifica se código já existe
    if ProdutoEstoque.query.filter_by(codigo=data["codigo"]).first():
        abort(400, description="Código do produto já existe")

    produto = ProdutoEstoque(
        codigo=data["codigo"].strip(),
        nome=data["nome"].strip(),
        categoria=data["categoria"].strip(),
        descricao=(data.get("descricao") or "").strip() or None,
        quantidade=int(data.get("quantidade") or 0),
        estoque_minimo=int(data.get("estoqueMinimo") or 0),
        preco_custo=data.get("precoCusto") or 0,
        preco_venda=data.get("precoVenda") or 0,
        fornecedor=(data.get("fornecedor") or "").strip() or None,
        localizacao=(data.get("localizacao") or "").strip() or None,
    )

    db.session.add(produto)
    db.session.commit()

    return jsonify(produto_to_dict(produto)), 201


@bp.get("/<int:produto_id>")
@login_required
def obter_produto(produto_id: int):
    produto = ProdutoEstoque.query.get_or_404(produto_id)
    return jsonify(produto_to_dict(produto))


@bp.put("/<int:produto_id>")
@login_required
def atualizar_produto(produto_id: int):
    produto = ProdutoEstoque.query.get_or_404(produto_id)
    data = request.get_json() or {}

    if "codigo" in data:
        # Verifica se código já existe em outro produto
        existente = ProdutoEstoque.query.filter_by(codigo=data["codigo"]).first()
        if existente and existente.id != produto_id:
            abort(400, description="Código do produto já existe")
        produto.codigo = data["codigo"].strip()

    if "nome" in data:
        produto.nome = data["nome"].strip()
    if "categoria" in data:
        produto.categoria = data["categoria"].strip()
    if "descricao" in data:
        produto.descricao = (data.get("descricao") or "").strip() or None
    if "quantidade" in data:
        produto.quantidade = int(data["quantidade"])
    if "estoqueMinimo" in data:
        produto.estoque_minimo = int(data["estoqueMinimo"])
    if "precoCusto" in data:
        produto.preco_custo = data["precoCusto"]
    if "precoVenda" in data:
        produto.preco_venda = data["precoVenda"]
    if "fornecedor" in data:
        produto.fornecedor = (data.get("fornecedor") or "").strip() or None
    if "localizacao" in data:
        produto.localizacao = (data.get("localizacao") or "").strip() or None

    db.session.commit()

    return jsonify(produto_to_dict(produto))


@bp.delete("/<int:produto_id>")
@login_required
def deletar_produto(produto_id: int):
    produto = ProdutoEstoque.query.get_or_404(produto_id)
    db.session.delete(produto)
    db.session.commit()
    return "", 204
