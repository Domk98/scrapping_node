import poolGlobal from './conexion.js';

export async function guardarTiempoGlobal({ cd, nick, fecha, tiempo }) {
  const sql = `
    INSERT INTO tiempo_cbhours (cd, nick, fecha, tiempo)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE tiempo = VALUES(tiempo)
  `;

  await poolGlobal.execute(sql, [
    cd,
    nick,
    fecha,   // "YYYY-MM-DD"
    tiempo   // "HH:MM"
  ]);
}