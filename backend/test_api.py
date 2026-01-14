#!/usr/bin/env python3
"""
Script para testar as APIs e verificar se os dados estão sendo retornados corretamente.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def testar_api_os():
    """Testa a API de OS."""
    print("🔍 Testando API de OS...")

    try:
        response = requests.get(f"{BASE_URL}/api/os")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API OS: {len(data)} registros retornados")

            # Mostra detalhes das OS
            for os in data[:3]:  # Até 3 registros
                print(f"   • {os.get('numeroOS')}: {os.get('clienteNome')} - Status: {os.get('status')} - Valor: R$ {os.get('valorOrcamento', 0)}")

            # Verifica se há OS entregues
            entregues = [os for os in data if os.get('status') == 'entregue']
            print(f"   📋 OS entregues: {len(entregues)}")

            return data
        else:
            print(f"❌ Erro na API OS: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Falha ao conectar API OS: {e}")
        return []

def testar_api_clientes():
    """Testa a API de clientes."""
    print("\n🔍 Testando API de clientes...")

    try:
        response = requests.get(f"{BASE_URL}/api/clientes")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Clientes: {len(data)} registros retornados")

            for cliente in data[:3]:  # Até 3 registros
                print(f"   • {cliente.get('nome')}: {cliente.get('email', 'Sem email')}")

            return data
        else:
            print(f"❌ Erro na API Clientes: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Falha ao conectar API Clientes: {e}")
        return []

def testar_api_estoque():
    """Testa a API de estoque."""
    print("\n🔍 Testando API de estoque...")

    try:
        response = requests.get(f"{BASE_URL}/api/estoque")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Estoque: {len(data)} registros retornados")

            for produto in data[:3]:  # Até 3 registros
                print(f"   • {produto.get('nome')}: Qtd={produto.get('quantidade')} Min={produto.get('estoqueMinimo')}")

            return data
        else:
            print(f"❌ Erro na API Estoque: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Falha ao conectar API Estoque: {e}")
        return []

def calcular_financeiro_simulado(os_data, produtos_data):
    """Calcula métricas financeiras baseado nos dados da API."""
    print("\n💰 Calculando métricas financeiras simuladas...")

    # Filtrar OS entregues
    os_entregues = [os for os in os_data if os.get('status') == 'entregue']
    receitas = sum(os.get('valorOrcamento', 0) for os in os_entregues)

    # Calcular custos estimados
    custos = sum(
        (produto.get('precoCusto', 0) * max(0, produto.get('estoqueMinimo', 0) - produto.get('quantidade', 0)))
        for produto in produtos_data
    )

    lucro = receitas - custos
    margem = (lucro / receitas * 100) if receitas > 0 else 0

    print(f"   💰 Receitas: R$ {receitas:.2f}")
    print(f"   💸 Custos: R$ {custos:.2f}")
    print(f"   📈 Lucro: R$ {lucro:.2f} ({margem:.1f}%)")

    return {
        'receitas': receitas,
        'custos': custos,
        'lucro': lucro,
        'margem': margem
    }

def main():
    """Função principal."""
    print("🚀 Testando APIs do sistema financeiro...\n")

    # Testar APIs
    os_data = testar_api_os()
    clientes_data = testar_api_clientes()
    produtos_data = testar_api_estoque()

    # Calcular métricas
    if os_data and produtos_data:
        financeiro = calcular_financeiro_simulado(os_data, produtos_data)
    else:
        print("\n❌ Não foi possível calcular métricas financeiras - dados insuficientes")

    print("\n✅ Teste das APIs concluído!")

if __name__ == "__main__":
    main()
