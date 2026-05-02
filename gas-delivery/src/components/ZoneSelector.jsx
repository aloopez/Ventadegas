import { useState } from 'react';
import { useOrder } from '../context/OrderContext';

export default function ZoneSelector() {
  const { zona: zonaActiva, setZona, datosUsuario, setDatosUsuario, agencia } = useOrder();
  
  const [gpsEstado, setGpsEstado] = useState({ tipo: '', mensaje: '' });
  const [mapaUrl, setMapaUrl] = useState('');

  const handleChange = (e) => {
    setDatosUsuario({ ...datosUsuario, [e.target.name]: e.target.value });
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
        const urlVistaMapa = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=es&z=16&output=embed`;
        setMapaUrl(urlVistaMapa);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`);
          const data = await res.json();
          setDatosUsuario({ 
            ...datosUsuario, 
            dir: data.display_name || `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
            latitud: latitude,   // <-- GUARDAMOS COORDENADAS EXACTAS
            longitud: longitude  // <-- GUARDAMOS COORDENADAS EXACTAS
          });
          setGpsEstado({ tipo: 'success', mensaje: '📍 Ubicación detectada y mapa cargado' });
        } catch (e) {
          setDatosUsuario({ 
            ...datosUsuario, 
            dir: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
            latitud: latitude,   // <-- GUARDAMOS COORDENADAS EXACTAS
            longitud: longitude  // <-- GUARDAMOS COORDENADAS EXACTAS
          });
          setGpsEstado({ tipo: 'success', mensaje: '📍 Coordenadas obtenidas' });
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
        {agencia.zonas?.map(z => (
          <button 
            key={z} 
            className={`zona-btn ${zonaActiva === z ? 'sel' : ''}`}
            onClick={() => setZona(z)}
          >
            {z}
          </button>
        ))}
      </div>

      <label>Dirección exacta</label>
      <input type="text" name="dir" value={datosUsuario.dir} onChange={handleChange} placeholder="Tu dirección..." />

      <div className="gps-box" style={{ marginTop: '14px' }}>
        <button className="btn-gps" onClick={usarGPS} disabled={gpsEstado.tipo === 'loading'}>
          📍 {gpsEstado.tipo === 'loading' ? 'Localizando...' : 'Usar mi ubicación actual'}
        </button>
        
        {gpsEstado.mensaje && <div className={`gps-alert ${gpsEstado.tipo}`}>{gpsEstado.mensaje}</div>}

        {mapaUrl && (
          <div className="map-container">
            <iframe title="Mapa de entrega" src={mapaUrl} width="100%" height="200" style={{ border: 0, borderRadius: '12px', marginTop: '12px' }} allowFullScreen="" loading="lazy"></iframe>
            <p className="map-help">¿Es correcta la ubicación? Puedes ajustar la dirección arriba si es necesario.</p>
          </div>
        )}
      </div>

      <label>Referencia (opcional)</label>
      <input type="text" name="ref" value={datosUsuario.ref} onChange={handleChange} placeholder="Ej: portón negro, frente al parque" />
    </div>
  );
} 