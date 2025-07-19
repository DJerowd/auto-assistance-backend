# AUTO-ASSISTANCE-BACKEND

Backend da aplicação AutoAssistance.

## 🚀 Tecnologias

- **Node.js** com módulos ES6
- **Express.js** 5.1.0
- **MySQL** 2.18.1
- **bcrypt** 6.0.0 (criptografia de senhas)
- **jsonwebtoken** (autenticação JWT)
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
- **Resposta**:
  ```json
  {
    "message": "Usuário criado com sucesso",
    "user": {
      "id": 1,
      "name": "Nome do Usuário",
      "email": "email@exemplo.com"
    }
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
- **Resposta**:
  ```json
  {
    "message": "Login realizado com sucesso",
    "user": {
      "id": 1,
      "name": "Nome do Usuário",
      "email": "email@exemplo.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### **GET /users/me** (Protegido)
Obtém dados do usuário logado
- **Headers**: `Authorization: Bearer <token>`
- **Resposta**: Dados do usuário atual

#### **GET /users/refresh** (Protegido)
Renova o token JWT
- **Headers**: `Authorization: Bearer <token>`
- **Resposta**: Novo token JWT

#### **GET /users** (Protegido)
Lista todos os usuários (sem senha)
- **Headers**: `Authorization: Bearer <token>`
- **Resposta**: Array de usuários

#### **GET /users/:id** (Protegido)
Busca usuário por ID
- **Headers**: `Authorization: Bearer <token>`
- **Parâmetros**: id (ID do usuário)
- **Resposta**: Objeto do usuário

#### **PUT /users/:id** (Protegido)
Atualiza usuário (apenas próprio usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Parâmetros**: id (ID do usuário)
- **Body**:
  ```json
  {
    "name": "Novo Nome",
    "email": "novo@email.com",
    "password": "novaSenha" // opcional
  }
  ```
- **Resposta**: Mensagem de sucesso

#### **DELETE /users/:id** (Protegido)
Deleta usuário (apenas próprio usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Parâmetros**: id (ID do usuário)
- **Resposta**: Mensagem de sucesso

### 🚗 Veículos (Todas as rotas são protegidas)

#### **GET /vehicles**
Lista veículos do usuário logado
- **Headers**: `Authorization: Bearer <token>`
- **Resposta**: Array de veículos do usuário

#### **GET /vehicles/:id**
Busca veículo por ID (apenas se pertencer ao usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Parâmetros**: id (ID do veículo)
- **Resposta**: Objeto do veículo

#### **GET /vehicles/user/:userId**
Lista veículos de um usuário específico (apenas próprio usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Parâmetros**: userId (ID do usuário)
- **Resposta**: Array de veículos do usuário

#### **POST /vehicles**
Cria novo veículo para o usuário logado
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Meu Carro",
    "brand": "Toyota",
    "model": "Corolla",
    "version": "XEi",
    "color": "Prata",
    "licensePlate": "ABC1234",
    "mileage": 50000
  }
  ```
- **Campos obrigatórios**: brand, model, color
- **Resposta**: Mensagem de sucesso e ID do veículo criado

#### **PUT /vehicles/:id**
Atualiza veículo (apenas se pertencer ao usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Parâmetros**: id (ID do veículo)
- **Body**:
  ```json
  {
    "name": "Novo Nome",
    "brand": "Honda",
    "model": "Civic",
    "version": "EXL",
    "color": "Preto",
    "licensePlate": "XYZ5678",
    "mileage": 60000
  }
  ```
- **Campos obrigatórios**: brand, model, color
- **Resposta**: Mensagem de sucesso

#### **DELETE /vehicles/:id**
Deleta veículo (apenas se pertencer ao usuário)
- **Headers**: `Authorization: Bearer <token>`
- **Parâmetros**: id (ID do veículo)
- **Resposta**: Mensagem de sucesso

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

## 🔒 Segurança

- **Senhas criptografadas** com bcrypt (salt rounds: 10)
- **Autenticação JWT** com tokens de 24 horas
- **Tokens gerados apenas no login**
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