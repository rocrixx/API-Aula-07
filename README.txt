-----------------------------------------------------------------------------

Frontend adicionado pra realizar as ações de GET e POST. 
/src/descarte/public

-----------------------------------------------------------------------------

Rodei todos os testes localmente, incluindo a conexão com o banco de dados MongoDB.
Abaixo estão exemplos das requisições utilizadas para validar o funcionamento da API.

-----------------------------------------------------------------------------

POST
http://localhost:3000/api/pontos-descarte

Body (JSON):
{
  "nomeLocal": "ponto X",
  "bairro": "centro",
  "tipoLocal": "publico",
  "categoriasResiduosAceitos": ["plastico", "vidro", "eletronico"],
  "latitude": -10.0001,
  "longitude": -20.0002
}

GET
http://localhost:3000/api/pontos-descarte

-----------------------------------------------------------------------------

POST
http://localhost:3000/api/registros-descarte

{
  "nomeUsuario": "usuarioTeste",
  "pontoId": 1,
  "tipoResiduo": "plastico"
}

GET
http://localhost:3000/api/registros-descarte

-----------------------------------------------------------------------------

Filtrar por tipo de resíduo
GET http://localhost:3000/api/registros-descarte?tipoResiduo=vidro

Filtrar por nome do usuário
GET http://localhost:3000/api/registros-descarte?nomeUsuario=usuarioTeste

Filtrar por ponto
GET http://localhost:3000/api/registros-descarte?pontoId=1

Filtrar por data
GET http://localhost:3000/api/registros-descarte?data=2025-11-13

-----------------------------------------------------------------------------

GET http://localhost:3000/api/relatorio