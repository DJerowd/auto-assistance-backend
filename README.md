# AUTO-ASSISTANCE-BACKEND

Backend da aplicação AutoAssistance desenvolvido em Node.js com Express.js e MySQL, com autenticação JWT e suporte a upload de imagens.

## 🚀 Tecnologias

- **Node.js** com módulos ES6
- **Express.js** 5.1.0
- **MySQL** 2.18.1
- **bcrypt** 6.0.0 (criptografia de senhas)
- **jsonwebtoken** (autenticação JWT)
- **joi** (validação de dados)
- **multer** (upload de arquivos)
- **cors** 2.8.5
- **dotenv** 17.0.1
- **nodemon** 3.1.10 (desenvolvimento)

## 📋 Pré-requisitos

- Node.js instalado
- MySQL instalado e configurado
- Banco de dados `auto_assistance_schema` criado

## ⚙️ Configuração

1. Clone o repositório
   ```bash
   git clone https://github.com/DJerowd/auto-assistance-backend.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   SERVER_PORT=3000
   JWT_SECRET=sua_chave_secreta_muito_segura_aqui
   ```
4. Configure o banco de dados MySQL:
   - Host: localhost
   - Usuário: root
   - Senha: Root141314
   - Database: auto_assistance_schema

5. Execute o servidor:
   ```bash
   npm start
   ```

## 🔐 Autenticação JWT

O sistema utiliza autenticação JWT (JSON Web Token) para proteger as rotas. Os tokens têm validade de 24 horas.

### **Como usar a autenticação:**

1. **Registrar usuário** para criar uma conta
2. **Fazer login** para obter um token JWT
3. **Incluir o token** no header `Authorization` das requisições:
   ```
   Authorization: Bearer seu_token_jwt_aqui
   ```

### **Exemplo de uso:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:3000/vehicles
```

## 📚 API Endpoints

### 👥 Usuários

#### **POST /users** (Público)
Registra novo usuário
- **Body**:
  ```json
  {
    "name": "Nome do Usuário",
    "email": "email@exemplo.com",
    "password": "senha123"
  }
  ```
- **Resposta de sucesso:**
  ```json
  {
    "success": true,
    "message": "Usuário criado com sucesso",
    "data": {
      "id": 1,
      "name": "Nome do Usuário",
      "email": "email@exemplo.com"
    }
  }
  ```
- **Resposta de erro de validação:**
  ```json
  {
    "success": false,
    "message": "Dados inválidos",
    "details": [
      "\"email\" must be a valid email",
      "\"password\" length must be at least 6 characters long"
    ]
  }
  ```

#### **POST /users/login** (Público)
Login do usuário - **Gera token JWT**
- **Body**:
  ```json
  {
    "email": "email@exemplo.com",
    "password": "senha123"
  }
  ```
- **Resposta de sucesso:**
  ```json
  {
    "success": true,
    "message": "Login realizado com sucesso",
    "data": {
      "user": {
        "id": 1,
        "name": "Nome do Usuário",
        "email": "email@exemplo.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Resposta de erro:**
  ```json
  {
    "success": false,
    "message": "Email ou senha incorretos"
  }
  ```

#### **GET /users/me** (Protegido)
Obtém dados do usuário logado
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Usuário encontrado",
    "data": {
      "id": 1,
      "name": "Nome do Usuário",
      "email": "email@exemplo.com"
    }
  }
  ```

#### **GET /users/refresh** (Protegido)
Renova o token JWT
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Token renovado com sucesso",
    "data": {
      "user": {
        "id": 1,
        "name": "Nome do Usuário",
        "email": "email@exemplo.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### **GET /users** (Protegido)
Lista todos os usuários (sem senha)
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Usuários encontrados",
    "data": {
      "users": [ ... ],
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
  ```

#### **GET /users/:id** (Protegido)
Busca usuário por ID
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Usuário encontrado",
    "data": {
      "id": 1,
      "name": "Nome do Usuário",
      "email": "email@exemplo.com"
    }
  }
  ```

#### **PUT /users/:id** (Protegido)
Atualiza usuário (apenas próprio usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Novo Nome",
    "email": "novo@email.com",
    "password": "novaSenha" // opcional
  }
  ```
- **Resposta de sucesso:**
  ```json
  {
    "success": true,
    "message": "Usuário atualizado com sucesso",
    "data": null
  }
  ```

#### **DELETE /users/:id** (Protegido)
Deleta usuário (apenas próprio usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Usuário deletado com sucesso",
    "data": null
  }
  ```

### 🚗 Veículos (Todas as rotas são protegidas)

#### **GET /vehicles**
Lista veículos do usuário logado (com paginação e filtros)
- **Headers**: `Authorization: Bearer <token>`
- **Query params:** `page`, `limit`, `brand`, `model`, `color`, `licensePlate`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Veículos encontrados",
    "data": {
      "vehicles": [
        {
          "id": 1,
          "name": "Meu Carro",
          "brand": "Toyota",
          "model": "Corolla",
          "color": "Prata",
          "imageUrl": "http://localhost:3000/uploads/vehicles/1234567890-123456789.jpg"
        }
      ],
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
  ```

#### **GET /vehicles/:id**
Busca veículo por ID (apenas se pertencer ao usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Veículo encontrado",
    "data": {
      "id": 1,
      "brand": "Fiat",
      "model": "Palio",
      "color": "Branco",
      "imageUrl": "http://localhost:3000/uploads/vehicles/1234567890-123456789.jpg"
    }
  }
  ```

#### **GET /vehicles/user/:userId**
Lista veículos de um usuário específico (apenas próprio usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Veículos encontrados",
    "data": [
      {
        "id": 1,
        "brand": "Toyota",
        "model": "Corolla",
        "imageUrl": "http://localhost:3000/uploads/vehicles/1234567890-123456789.jpg"
      }
    ]
  }
  ```

#### **POST /vehicles** (com upload de imagem)
Cria novo veículo para o usuário logado
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Body** (form-data):
  ```
  name: Meu Carro
  brand: Toyota
  model: Corolla
  version: XEi
  color: Prata
  licensePlate: ABC1234
  mileage: 50000
  image: [arquivo de imagem]
  ```
- **Resposta de sucesso:**
  ```json
  {
    "success": true,
    "message": "Veículo criado com sucesso",
    "data": {
      "id": 10,
      "imageUrl": "http://localhost:3000/uploads/vehicles/1234567890-123456789.jpg"
    }
  }
  ```
- **Resposta de erro de validação:**
  ```json
  {
    "success": false,
    "message": "Dados inválidos",
    "details": [
      "\"brand\" is required",
      "\"model\" is required",
      "\"color\" is required"
    ]
  }
  ```
- **Resposta de erro de upload:**
  ```json
  {
    "success": false,
    "message": "Arquivo muito grande. Tamanho máximo: 5MB"
  }
  ```

#### **PUT /vehicles/:id** (com upload de imagem)
Atualiza veículo (apenas se pertencer ao usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Body** (form-data):
  ```
  name: Novo Nome
  brand: Honda
  model: Civic
  version: EXL
  color: Preto
  licensePlate: XYZ5678
  mileage: 60000
  image: [arquivo de imagem] (opcional)
  ```
- **Resposta de sucesso:**
  ```json
  {
    "success": true,
    "message": "Veículo atualizado com sucesso",
    "data": {
      "imageUrl": "http://localhost:3000/uploads/vehicles/1234567890-123456789.jpg"
    }
  }
  ```

#### **DELETE /vehicles/:id**
Deleta veículo (apenas se pertencer ao usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Veículo deletado com sucesso",
    "data": null
  }
  ```

#### **DELETE /vehicles/:id/image**
Deleta apenas a imagem do veículo (apenas se pertencer ao usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Resposta:**
  ```json
  {
    "success": true,
    "message": "Imagem do veículo deletada com sucesso",
    "data": null
  }
  ```

## 📸 Upload de Imagens

### **Especificações:**
- **Formatos aceitos**: JPEG, JPG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB por arquivo
- **Localização**: `uploads/vehicles/`
- **Acesso**: `http://localhost:3000/uploads/vehicles/nome_do_arquivo`

### **Exemplo de upload com curl:**
```bash
curl -X POST \
  -H "Authorization: Bearer seu_token_aqui" \
  -F "name=Meu Carro" \
  -F "brand=Toyota" \
  -F "model=Corolla" \
  -F "color=Prata" \
  -F "image=@/caminho/para/imagem.jpg" \
  http://localhost:3000/vehicles
```

### **Exemplo de upload com JavaScript (FormData):**
```javascript
const formData = new FormData();
formData.append('name', 'Meu Carro');
formData.append('brand', 'Toyota');
formData.append('model', 'Corolla');
formData.append('color', 'Prata');
formData.append('image', fileInput.files[0]);

fetch('http://localhost:3000/vehicles', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu_token_aqui'
  },
  body: formData
});
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
- `id` (int, PK, auto-incremento)
- `name` (varchar(100), NOT NULL)
- `email` (varchar(100), NOT NULL, UNIQUE)
- `password` (varchar(100), NOT NULL, criptografada)

### Tabela `vehicles_table`
- `id` (int, PK, auto-incremento)
- `userId` (int, NOT NULL, FK para users.id)
- `name` (varchar(100))
- `brand` (varchar(45), NOT NULL)
- `model` (varchar(45), NOT NULL)
- `version` (varchar(45))
- `color` (varchar(45), NOT NULL)
- `licensePlate` (varchar(10))
- `mileage` (int)
- `imageUrl` (varchar(255)) - **NOVO**: caminho da imagem

## 🔒 Segurança

- **Senhas criptografadas** com bcrypt (salt rounds: 10)
- **Autenticação JWT** com tokens de 24 horas
- **Tokens gerados apenas no login**
- **Validação de dados** com Joi
- **Padronização de respostas** para sucesso e erro
- **Upload seguro de imagens** com validação de tipo e tamanho
- **Validação de campos** obrigatórios
- **Verificação de email único** para usuários
- **Controle de acesso** baseado em propriedade de recursos
- **Tratamento de erros** consistente
- **Proteção de rotas** com middleware de autenticação

## 📝 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **204**: Sem conteúdo (lista vazia)
- **400**: Dados inválidos
- **401**: Não autorizado (token inválido/expirado)
- **403**: Acesso negado (sem permissão)
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## 🔐 Middlewares de Autenticação

### **verifyToken**
Verifica se o token JWT é válido e não expirou.

### **verifyOwnership**
Verifica se o usuário é o proprietário do recurso que está tentando acessar.

### **verifyAdmin**
Verifica se o usuário tem privilégios de administrador (opcional).

## 🚀 Fluxo de Autenticação

1. **Registro** → Cria conta
2. **Login** → Recebe token JWT
3. **Incluir token** no header Authorization
4. **Acessar rotas protegidas** com o token
5. **Renovar token** quando necessário
6. **Logout** → Simplesmente descartar o token

## 👨‍💻 Autor

**Djerowd Alexsander Ruiz Moreschi Faria**

## 📄 Licença

ISC