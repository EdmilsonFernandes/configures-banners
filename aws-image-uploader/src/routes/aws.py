import os
import json
import base64
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

aws_bp = Blueprint('aws', __name__)

# Configurações
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
S3_BUCKET = 'static.wibx.io'
CLOUDFRONT_DOMAIN = 'https://d1jc1l746atx5b.cloudfront.net/'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_s3_client(profile_name=None):
    """Cria cliente S3 com perfil SSO opcional"""
    try:
        if profile_name and profile_name != 'default':
            session = boto3.Session(profile_name=profile_name)
            return session.client('s3')
        else:
            return boto3.client('s3')
    except Exception as e:
        raise Exception(f"Erro ao criar cliente S3: {str(e)}")

def create_s3_folder(s3_client, folder_key):
    """Cria pasta no S3"""
    try:
        s3_client.put_object(Bucket=S3_BUCKET, Key=f"{folder_key}/")
        return True
    except Exception as e:
        print(f"Erro ao criar pasta {folder_key}: {str(e)}")
        return False

def upload_file_to_s3(s3_client, file, s3_key):
    """Faz upload do arquivo para S3"""
    try:
        s3_client.upload_fileobj(file, S3_BUCKET, s3_key)
        return True
    except Exception as e:
        print(f"Erro ao fazer upload: {str(e)}")
        return False

def generate_base64_url(s3_key):
    """Gera URL base64 para CloudFront"""
    json_payload = {
        "bucket": S3_BUCKET,
        "key": s3_key
    }
    json_str = json.dumps(json_payload)
    base64_encoded = base64.b64encode(json_str.encode()).decode()
    return f"{CLOUDFRONT_DOMAIN}{base64_encoded}"

@aws_bp.route('/setup-folders', methods=['POST'])
def setup_folders():
    """Cria estrutura de pastas no S3"""
    data = request.json
    wl_name = data.get('wl_name')

    if not wl_name:
        return jsonify({'error': 'Nome WL é obrigatório'}), 400

    try:
        s3_client = get_s3_client()
        base_path = f"app/{wl_name}/home"

        folders = [
            "banners_principais/topo",
            "banners_principais/horizontal",
            "extra_mini_buttons",
            "mini_banners",
            "normal_banners",
            "logo_images",
            "email_template"
        ]

        for folder in folders:
            folder_path = f"{base_path}/{folder}"
            if not create_s3_folder(s3_client, folder_path):
                return jsonify({'error': f'Erro ao criar pasta {folder}'}), 500

        return jsonify({'message': 'Estrutura de pastas criada com sucesso', 'base_path': base_path})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@aws_bp.route('/upload-images', methods=['POST'])
def upload_images():
    """Faz upload de imagens para S3"""
    try:
        wl_name = request.form.get('wl_name')
        folder_type = request.form.get('folder_type')

        if not all([wl_name, folder_type]):
            return jsonify({'error': 'Parâmetros obrigatórios faltando'}), 400

        if 'files' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400

        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

        s3_client = get_s3_client()
        base_path = f"app/{wl_name}/home"

        uploaded_files = []

        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                s3_key = f"{base_path}/{folder_type}/{filename}"

                if upload_file_to_s3(s3_client, file, s3_key):
                    base64_url = generate_base64_url(s3_key)
                    uploaded_files.append({
                        'filename': filename,
                        'url': base64_url,
                        's3_key': s3_key
                    })
                else:
                    return jsonify({'error': f'Erro ao fazer upload de {filename}'}), 500

        return jsonify({
            'message': f'{len(uploaded_files)} arquivos enviados com sucesso',
            'files': uploaded_files
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@aws_bp.route('/generate-json', methods=['POST'])
def generate_json():
    """Gera JSON final baseado nos dados enviados"""
    try:
        data = request.json

          # Estrutura do JSON final
        json_structure = {
            "slides": data.get("slides", []),
            "gridButtons": data.get("gridButtons", []),
            "banners": data.get("banners", []),
            "formattedBanners": {
                "smallImages": data.get("smallImages", []),
                "normalImages": data.get("normalImages", [])
            },
            "miniExtraButtons": data.get("miniExtraButtons", []),
        }

        logo_structure = {item["name"]: item["image"] for item in data.get("logoImages", [])}
        template_structure = {item["name"]: item["image"] for item in data.get("emailTemplates", [])}

        return jsonify({
            "json_data": json_structure,
            "logo_data": logo_structure,
            "template_data": template_structure
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@aws_bp.route('/test-aws-connection', methods=['POST'])
def test_aws_connection():
    """Testa conexão com AWS"""
    try:
        data = request.json

        s3_client = get_s3_client()

        # Tenta listar buckets para testar conexão
        s3_client.list_buckets()

        return jsonify({'message': 'Conexão AWS estabelecida com sucesso'})

    except NoCredentialsError:
        return jsonify({'error': 'Credenciais AWS não encontradas'}), 401
    except ClientError as e:
        return jsonify({'error': f'Erro AWS: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
