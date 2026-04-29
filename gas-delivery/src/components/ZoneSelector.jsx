import { useState } from 'react';

export default function ZoneSelector({ zonaActiva, setZonaActiva, datos, setDatos }) {
  const zonas = [
    'San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Mejicanos', 
    'Antiguo Cuscatlán', 'Santa Tecla', 'Apopa', 'Ilopango', 'Sonsonate'
  ];

  const [gpsEstado, setGpsEstado] = useState({ tipo: '', mensaje: '' });
  // Estado local para controlar la visualización del mapa
  const [mapaUrl, setMapaUrl] = useState('');

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const usarGPS = () => {
    if (!navigator.geolocation) {
      setGpsEstado({ tipo: 'error', mensaje: 'GPS no soportado.' });
      return;
    }

    setGpsEstado({ tipo: 'loading', mensaje: 'Localizando...' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // CORRECCIÓN AQUÍ: URL válida para el Iframe de Google Maps
        const urlVistaMapa = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=es&z=16&output=embed`;
        setMapaUrl(urlVistaMapa);

        try {
          // Buscamos el nombre de la calle
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`);
          const data = await res.json();
          
          setDatos({ ...datos, dir: data.display_name || `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}` });
          setGpsEstado({ tipo: 'success', mensaje: '✓ Ubicación detectada y mapa cargado' });
        } catch (e) {
          setDatos({ ...datos, dir: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}` });
          setGpsEstado({ tipo: 'success', mensaje: '✓ Coordenadas obtenidas' });
        }
      },
      (error) => {
        let errorMsg = 'Error al obtener ubicación.';
        if (error.code === 1) errorMsg = 'Permiso denegado. Activa el GPS.';
        setGpsEstado({ tipo: 'error', mensaje: errorMsg });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="section">
      <div className="step-label">Paso 2 — Zona de entrega</div>
      
      <div className="zona-grid">
        {zonas.map(z => (
          <button 
            key={z} 
            className={`zona-btn ${zonaActiva === z ? 'sel' : ''}`}
            onClick={() => setZonaActiva(z)}
          >
            {z}
          </button>
        ))}
      </div>

      <label>Dirección exacta</label>
      <input type="text" name="dir" value={datos.dir} onChange={handleChange} placeholder="Tu dirección..." />

      <div className="gps-box">
        <button className="btn-gps" onClick={usarGPS} disabled={gpsEstado.tipo === 'loading'}>
          📍 {gpsEstado.tipo === 'loading' ? 'Localizando...' : 'Usar mi ubicación actual'}
        </button>
        
        {gpsEstado.mensaje && <div className={`gps-alert ${gpsEstado.tipo}`}>{gpsEstado.mensaje}</div>}

        {/* --- AQUÍ ESTÁ EL MAPA --- */}
        {mapaUrl && (
          <div className="map-container">
            <iframe
              title="Mapa de entrega"
              src={mapaUrl}
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '12px', marginTop: '12px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            <p className="map-help">¿Es correcta la ubicación? Puedes ajustar la dirección arriba si es necesario.</p>
          </div>
        )}
      </div>

      <label>Referencia (opcional)</label>
      <input type="text" name="ref" value={datos.ref} onChange={handleChange} placeholder="Ej: portón negro, frente al parque" />
    </div>
  );
}