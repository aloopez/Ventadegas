// src/data/agencias.js
export const agencias = {
  "distribuidora-martinez": {
    id: 1,
    nombre: "Distribuidora Martínez",
    slogan: "El gas más rápido de Sonsonate",
    logo: "🔥",
    telefonoWhatsApp: "50376091439", // El número del dueño
    zonas: ["Sonsonate Centro", "Sonzacate", "San Antonio del Monte"],
    tema: { primary: "#ef4444" } // Podrías cambiar el color primario según el logo del cliente
  },
  "gas-express-occidente": {
    id: 2,
    nombre: "Gas Express Occidente",
    slogan: "Tu despensa de gas confiable",
    logo: "🚚",
    telefonoWhatsApp: "50370000002",
    zonas: ["Sonsonate", "Acajutla", "Izalco"],
    tema: { primary: "#2563eb" }
  }
};