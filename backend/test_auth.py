#!/usr/bin/env python3
"""
Script para testar a autenticação JWT.
"""

import requests
import json

API_BASE_URL = "http://127.0.0.1:5000"

def test_login():
    """Testa o endpoint de login."""
    print("🔐 Testando login...")

    data = {
        "usuario": "admin",
        "senha": "admin123"
    }

    try:
        response = requests.post(f"{API_BASE_URL}/api/auth/login", json=data)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            token = result.get('token')
            print("✅ Login bem-sucedido!")
            print(f"Token: {token[:50]}...")
            return token
        else:
            print(f"❌ Erro no login: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return None

def test_protected_route(token):
    """Testa uma rota protegida."""
    print("\n🔒 Testando rota protegida...")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.get(f"{API_BASE_URL}/api/clientes", headers=headers)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            print("✅ Acesso autorizado à rota protegida!")
            return True
        else:
            print(f"❌ Acesso negado: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

def test_without_token():
    """Testa acesso sem token."""
    print("\n🚫 Testando acesso sem token...")

    try:
        response = requests.get(f"{API_BASE_URL}/api/clientes")
        print(f"Status: {response.status_code}")

        if response.status_code == 401:
            print("✅ Acesso corretamente negado sem token!")
            return True
        else:
            print(f"❌ Comportamento inesperado: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

def main():
    print("🧪 Iniciando testes de autenticação JWT\n")

    # Testa login
    token = test_login()
    if not token:
        print("❌ Teste de login falhou. Abortando...")
        return

    # Testa rota protegida
    if not test_protected_route(token):
        print("❌ Teste de rota protegida falhou.")
        return

    # Testa acesso sem token
    if not test_without_token():
        print("❌ Teste de acesso sem token falhou.")
        return

    print("\n🎉 Todos os testes passaram! Autenticação JWT funcionando!")

if __name__ == "__main__":
    main()
