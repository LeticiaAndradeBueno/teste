import { conn } from "../database/conn";

export const JWT_SECRET = "dpwejiguio43huiogh3iuhYGDFuyg4ygGYfu4gyuFYGcguyugcwfguyD";
export const JWT_EXPIRES_IN = "8 hours";

let users: any[] = [];

function getData() {
  return new Promise<void>((resolve, reject) => {
    conn.query(
      `SELECT PK_ID_usuario AS ID, Email, Senha, Acess_token, Data_criado FROM usuarios`,
      (err: Error | null, results: any[], fields: any) => {
        if (err) {
          console.error("Erro ao executar a primeira query:", err);
          reject(err);
          return;
        }
  
        const userIDs = results.map((user) => user.ID);
  
        conn.query(
          `SELECT FK_ID_usuario AS ID_usuario, FK_ID_grupo AS ID_grupo, grupos.FK_ID_setor AS ID_setor, grupos.Nome AS Grupo_nome, setor.Nome AS Setor_nome FROM usuarios_grupo
           INNER JOIN grupos ON usuarios_grupo.FK_ID_grupo = grupos.PK_ID_grupo
           INNER JOIN setor ON grupos.FK_ID_setor = setor.PK_ID_projeto
           WHERE usuarios_grupo.FK_ID_usuario IN (?)`,
          [userIDs],
          (err: Error | null, results: any[], fields: any) => {
            if (err) {
              console.error("Erro ao executar a segunda query:", err);
              reject(err);
              return;
            }
  
            const userGroups = results.reduce((groups: any, group: any) => {
              const userID = group.ID_usuario;
  
              if (!groups[userID]) {
                groups[userID] = [];
              }
  
              groups[userID].push({
                ID_grupo: group.ID_grupo,
                ID_setor: group.ID_setor,
                Grupo_nome: group.Grupo_nome,
                Setor_nome: group.Setor_nome,
              });
  
              return groups;
            }, {});
  
            users = results.map((user) => ({
              ...user,
              Grupos: userGroups[user.ID] || [],
            }));
  
            resolve();
          }
        );
      }
    );
  });
}

getData()
  .then(() => {
    console.log(users);
    export { users };
  })
  .catch((err) => {
    console.error("Erro ao obter dados:", err);
  });
