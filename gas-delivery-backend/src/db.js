import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Creamos un pool de conexiones (recomendado para producción)
export const pool = mysql.createPool({
  // process.env buscará las variables cuando subamos a Render
  // Si no las encuentra (como en tu compu), usará los textos entre comillas
  host: process.env.DB_HOST || 'AQUI_PEGA_EL_HOST_DE_AIVEN_LARGO',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AQUI_PEGA_TU_CONTRASEÑA_DE_AIVEN',
  database: process.env.DB_NAME || 'ventadegas',
  port: process.env.DB_PORT || 25060, // Aiven suele usar el puerto 25060
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mensaje de prueba al iniciar
console.log('Pool de base de datos inicializado.');