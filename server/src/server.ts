import express from 'express'; 
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes)


app.listen(3333);


/*Rotas e recursos 
https://localhost:3333 = Uma rota  
https://localhost:3333/users = Recurso, é o que vem após a rota 

/*Metodos 
GET: Buscar ou listar alguma informcacao
POST: Criar alguma informacao dentro do backend
PUT: Atualizar alguma informacao existente
DELETE: Deletar alguma informacao do backend*/

//PARAMETROS
//Corpo (Request Body): Dados para criacao ou atualizacao de um registro 
//Route Params: Identificar qual recurso eu quero atualizar ou deletar
//Query Params: Paginacao, filtros, ordenacao