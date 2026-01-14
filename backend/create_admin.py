#!/usr/bin/env python3
"""
Script para criar usuário admin padrão.
Execute este script uma vez para criar o usuário admin.
"""

from app import create_app
from extensions import db
from models import Usuario
from werkzeug.security import generate_password_hash

def criar_admin():
    """Cria usuário admin se não existir."""
    app = create_app()

    with app.app_context():
        # Verifica se já existe usuário admin
        admin_existente = Usuario.query.filter_by(usuario='admin').first()

        if admin_existente:
            print("✅ Usuário admin já existe!")
            return

        # Cria usuário admin
        admin = Usuario(
            usuario='admin',
            senha_hash=generate_password_hash('admin123'),
            nome='Administrador',
            email='admin@iasistem.com',
            ativo=True
        )

        db.session.add(admin)
        db.session.commit()

        print("✅ Usuário admin criado com sucesso!")
        print("   Usuário: admin")
        print("   Senha: admin123")

if __name__ == '__main__':
    criar_admin()
