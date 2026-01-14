import os
from datetime import datetime, timedelta
from functools import wraps
import jwt
from flask import request, jsonify, g
from werkzeug.security import check_password_hash

from models import Usuario


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "mude-esta-chave-jwt-em-producao")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def gerar_token_jwt(usuario_id, usuario_nome):
    """Gera um token JWT para o usuário."""
    payload = {
        "user_id": usuario_id,
        "usuario": usuario_nome,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow(),
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def verificar_token_jwt(token):
    """Verifica e decodifica um token JWT."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])

        # Verifica se o usuário ainda existe e está ativo
        usuario = Usuario.query.get(payload["user_id"])
        if not usuario or not usuario.ativo:
            raise jwt.InvalidTokenError("Usuário inativo ou não encontrado")

        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.InvalidTokenError("Token expirado")
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError("Token inválido")


def autenticar_usuario(usuario, senha):
    """Autentica um usuário com usuário e senha."""
    user = Usuario.query.filter_by(usuario=usuario, ativo=True).first()

    if user and check_password_hash(user.senha_hash, senha):
        return user

    return None


def login_required(f):
    """Decorator para proteger rotas que requerem autenticação."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "erro": "Token de autenticação ausente",
                "mensagem": "Acesso negado. Token Bearer necessário."
            }), 401

        token = auth_header.split(' ')[1]

        try:
            payload = verificar_token_jwt(token)
            g.usuario_id = payload["user_id"]
            g.usuario_nome = payload["usuario"]
        except jwt.InvalidTokenError as e:
            return jsonify({
                "erro": "Token inválido",
                "mensagem": str(e)
            }), 401

        return f(*args, **kwargs)

    return decorated_function


def get_usuario_atual():
    """Retorna o usuário atual baseado no token JWT."""
    return {
        "id": g.usuario_id,
        "usuario": g.usuario_nome
    } if hasattr(g, 'usuario_id') else None
