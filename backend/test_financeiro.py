#!/usr/bin/env python3
"""
Script para testar os dados financeiros e verificar se as correções funcionaram.
"""

from app import create_app
from models import OrdemServico, Cliente, ProdutoEstoque
from extensions import db

def testar_dados_financeiros():
    """Testa se há dados financeiros disponíveis."""
    app = create_app()

    with app.app_context():
        print("🔍 Verificando dados financeiros...\n")

        # Verificar OS entregues
        os_entregues = OrdemServico.query.filter_by(status='entregue').all()
        print(f"📋 Total de OS entregues: {len(os_entregues)}")

        if os_entregues:
            print("📋 Detalhes das OS entregues:")
            for os in os_entregues[:5]:  # Mostra até 5
                cliente = Cliente.query.get(os.cliente_id)
                print(f"   • {os.numero_os}: Cliente={cliente.nome if cliente else 'N/A'}, Valor={os.valor_orcamento or 0}")
        else:
            print("⚠️  Nenhuma OS entregue encontrada!")

        print()

        # Calcular receitas do mês atual
        from datetime import datetime
        hoje = datetime.now()
        inicio_mes = datetime(hoje.year, hoje.month, 1)

        os_mes = OrdemServico.query.filter(
            OrdemServico.status == 'entregue',
            OrdemServico.criado_em >= inicio_mes
        ).all()

        receitas_mes = sum((os.valor_orcamento or 0) for os in os_mes)
        print(f"💰 Receitas do mês atual: R$ {receitas_mes:.2f}")

        # Verificar produtos
        produtos = ProdutoEstoque.query.all()
        print(f"📦 Total de produtos: {len(produtos)}")

        if produtos:
            # Calcular custos estimados
            custos_estimados = sum(
                (produto.preco_custo or 0) * max(0, produto.estoque_minimo - produto.quantidade)
                for produto in produtos
            )
            print(f"💸 Custos estimados: R$ {custos_estimados:.2f}")

            lucro_estimado = receitas_mes - custos_estimados
            margem = (lucro_estimado / receitas_mes * 100) if receitas_mes > 0 else 0
            print(f"📈 Lucro estimado: R$ {lucro_estimado:.2f} ({margem:.1f}%)")

        # Verificar clientes
        clientes = Cliente.query.all()
        print(f"👥 Total de clientes: {len(clientes)}")

        print("\n✅ Verificação concluída!")

if __name__ == "__main__":
    testar_dados_financeiros()
