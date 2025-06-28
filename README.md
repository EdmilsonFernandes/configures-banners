# AWS Image Uploader - Gerador de JSON para Apps

Este projeto consiste em uma aplicação web local (frontend em React e backend em Flask) que replica a funcionalidade de um script shell para upload de imagens para o AWS S3 e geração de arquivos JSON estruturados para uso em aplicações.

## Funcionalidades

- **Configuração Inicial**: Definição do nome do White Label e perfil AWS SSO.
- **Upload de Imagens**: Upload de imagens para diferentes categorias (banners, mini banners, logos, etc.) no AWS S3.
- **Metadados de Imagens**: Associação de URLs internas/externas às imagens, conforme a necessidade da aplicação.
- **Grid Buttons**: Configuração de botões de grid com nome, imagem, URL e tamanho.
- **Geração de JSON**: Compilação de todas as configurações e imagens em um JSON final, replicando a estrutura do script shell original.
- **Download de JSON**: Opção para baixar os JSONs gerados (principal, logo, template).

## Estrutura do Projeto

O projeto é dividido em duas partes principais:

- `aws-image-uploader`: Backend em Flask.
- `aws-uploader-frontend`: Frontend em React.

## Como Executar Localmente

### Pré-requisitos

- Python 3.x
- Node.js e pnpm (ou npm/yarn)
- Credenciais AWS configuradas em seu ambiente (variáveis de ambiente ou AWS CLI `aws configure`)

### 1. Configurar o Backend (Flask)

1.  Navegue até o diretório do backend:
    ```bash
    cd aws-image-uploader
    ```
2.  Ative o ambiente virtual e instale as dependências:
    ```bash
    source venv/bin/activate
    pip install -r requirements.txt
    ```
3.  Inicie o servidor Flask:
    ```bash
    python src/main.py
    ```
    O servidor estará disponível em `http://localhost:5000`.

### 2. Configurar o Frontend (React)

1.  Navegue até o diretório do frontend:
    ```bash
    cd aws-uploader-frontend
    ```
2.  Instale as dependências (se ainda não o fez):
    ```bash
    pnpm install # ou npm install / yarn install
    ```
3.  Inicie o servidor de desenvolvimento React:
    ```bash
    pnpm run dev --host # ou npm run dev -- --host / yarn dev --host
    ```
    O aplicativo estará disponível em `http://localhost:5173`.

### 3. Usando a Aplicação

1.  Abra seu navegador e acesse `http://localhost:5173`.
2.  Na tela de configuração inicial, insira o nome do White Label e selecione o perfil AWS SSO (padrão ou personalizado).
3.  Clique em "Iniciar Configuração". Isso testará sua conexão AWS e criará a estrutura de pastas no S3.
4.  Após a configuração, você poderá navegar pelas abas para:
    -   **Upload de Imagens**: Selecione o tipo de pasta e faça upload das imagens. Após o upload, você poderá adicionar metadados (URL interna/externa) para cada imagem.
    -   **Grid Buttons**: Adicione botões de grid, especificando nome, imagem, tipo de URL, URL e tamanho.
    -   **Gerar JSON**: Clique em "Gerar JSON" para compilar todos os dados e visualizar o JSON final. Você também pode baixar os arquivos JSON gerados.

## Observações

-   Certifique-se de que suas credenciais AWS tenham permissão para criar buckets (se necessário) e fazer upload de objetos para o bucket `static.wibx.io`.
-   O script shell original utiliza `aws s3api put-object` para criar pastas, o que é replicado no backend Flask.
-   O domínio `https://d1jc1l746atx5b.cloudfront.net/` é usado para gerar as URLs das imagens no JSON, conforme o script original.



## Executar com Docker

A aplicação pode ser executada em um único container Docker que já inclui o backend em Flask e o frontend compilado.

Execute o script `build_and_run.sh` para construir a imagem e iniciar o container
utilizando automaticamente as credenciais AWS configuradas no servidor:

```bash
./build_and_run.sh
```

Depois disso, acesse `http://localhost:8000` no navegador para utilizar a interface.
