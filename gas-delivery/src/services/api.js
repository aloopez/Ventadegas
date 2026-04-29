// src/services/api.js
import { agencias } from '../data/agencias';

// Simulamos una llamada a la base de datos con 1 segundo de retraso (latencia)
export const getAgenciaBySlug = (slug) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const agencia = agencias[slug]; // Buscamos en la data local
      
      if (agencia) {
        resolve(agencia); // "Responde" con éxito 200 OK
      } else {
        reject(new Error('Agencia no encontrada')); // "Responde" con error 404
      }
    }, 1000); // 1000 milisegundos de espera
  });
};