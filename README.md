# AUTO-ASSISTANCE-BACKEND

Backend da aplicação AutoAssistance desenvolvido em Node.js com Express.js e MySQL.

## 🚀 Tecnologias

- **Node.js** com módulos ES6
- **Express.js** 5.1.0
- **MySQL** 2.18.1
- **bcrypt** 6.0.0 (criptografia de senhas)
- **cors** 2.8.5
- **dotenv** 17.0.1
- **nodemon** 3.1.10 (desenvolvimento)

## 📋 Pré-requisitos

- Node.js instalado
- MySQL instalado e configurado
- Banco de dados `auto_assistance_schema` criado

## ⚙️ Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   SERVER_PORT=3000
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

## 📚 API Endpoints

### 👥 Usuários

#### **GET /users**
Lista todos os usuários (sem senha)
- **Resposta**: Array de usuários com id, name e email

#### **GET /users/:id**
Busca usuário por ID
- **Parâmetros**: id (ID do usuário)
- **Resposta**: Objeto do usuário

#### **POST /users**
Cria novo usuário
- **Body**:
  ```json
  {
    "name": "Nome do Usuário",
    "email": "email@exemplo.com",
    "password": "senha123"
  }
  ```
- **Resposta**: Mensagem de sucesso e ID do usuário criado

#### **POST /users/login**
Login do usuário
- **Body**:
  ```json
  {
    "email": "email@exemplo.com",
    "password": "senha123"
  }
  ```
- **Resposta**: Dados do usuário logado (sem senha)

#### **PUT /users/:id**
Atualiza usuário
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

#### **DELETE /users/:id**
Deleta usuário
- **Parâmetros**: id (ID do usuário)
- **Resposta**: Mensagem de sucesso

### 🚗 Veículos

#### **GET /vehicles**
Lista todos os veículos
- **Resposta**: Array de veículos

#### **GET /vehicles/:id**
Busca veículo por ID
- **Parâmetros**: id (ID do veículo)
- **Resposta**: Objeto do veículo

#### **GET /vehicles/user/:userId**
Lista veículos de um usuário específico
- **Parâmetros**: userId (ID do usuário)
- **Resposta**: Array de veículos do usuário

#### **POST /vehicles**
Cria novo veículo
- **Body**:
  ```json
  {
    "userId": 1,
    "name": "Meu Carro",
    "brand": "Toyota",
    "model": "Corolla",
    "version": "XEi",
    "color": "Prata",
    "licensePlate": "ABC1234",
    "mileage": 50000
  }
  ```
- **Campos obrigatórios**: userId, brand, model, color
- **Resposta**: Mensagem de sucesso e ID do veículo criado

#### **PUT /vehicles/:id**
Atualiza veículo
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
Deleta veículo
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

- Senhas criptografadas com bcrypt (salt rounds: 10)
- Validação de campos obrigatórios
- Verificação de email único para usuários
- Tratamento de erros consistente

## 📝 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **204**: Sem conteúdo (lista vazia)
- **400**: Dados inválidos
- **401**: Não autorizado (login)
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## 👨‍💻 Autor

**Djerowd Alexsander Ruiz Moreschi Faria**

## 📄 Licença

ISC
