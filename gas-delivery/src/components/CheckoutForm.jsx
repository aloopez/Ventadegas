export default function CheckoutForm({ datos, setDatos, horaActiva, setHoraActiva }) {
  const horarios = [
    'Lo antes posible', '10:00 – 12:00', '12:00 – 14:00', '14:00 – 17:00', '17:00 – 19:00'
  ];

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  // Función especial para validar y dar formato al teléfono de El Salvador
  const handlePhoneChange = (e) => {
    // 1. Quitamos todo lo que no sea número
    let value = e.target.value.replace(/\D/g, ''); 
    
    // 2. Limitamos a un máximo de 8 dígitos
    if (value.length > 8) value = value.slice(0, 8);
    
    // 3. Le agregamos el guion visualmente (ej: 7000-0000)
    let formattedValue = value;
    if (value.length > 4) {
      formattedValue = `${value.slice(0, 4)}-${value.slice(4)}`;
    }
    
    setDatos({ ...datos, tel: formattedValue });
  };

  // Verificamos si el usuario ya escribió algo pero el teléfono está incompleto o es inválido
  const numerosTel = datos.tel.replace(/\D/g, '');
  const telInvalido = numerosTel.length > 0 && (numerosTel.length < 8 || !/^[267]/.test(numerosTel));

  return (
    <div className="section">
      <div className="step-label">Paso 3 — Tus datos</div>

      <div className="row2">
        <div>
          <label>Nombre *</label>
          <input 
            type="text" 
            name="nombre" 
            value={datos.nombre} 
            onChange={handleChange} 
            placeholder="Tu nombre" 
            maxLength={50}
          />
        </div>
        <div>
          <label>Teléfono *</label>
          <input 
            type="tel" 
            name="tel" 
            value={datos.tel} 
            onChange={handlePhoneChange} 
            placeholder="Ej: 7000-0000" 
            className={telInvalido ? 'input-error' : ''}
          />
          {telInvalido && (
            <span className="error-text">Debe iniciar con 2, 6 o 7 y tener 8 dígitos</span>
          )}
        </div>
      </div>

      <label>Hora de entrega</label>
      <div className="hora-row">
        {horarios.map(h => (
          <button 
            key={h}
            className={`hora-btn ${horaActiva === h ? 'sel' : ''}`}
            onClick={() => setHoraActiva(h)}
          >
            {h}
          </button>
        ))}
      </div>

      <label>Forma de pago</label>
      <select name="pago" value={datos.pago} onChange={handleChange}>
        <option value="Efectivo">Efectivo al recibir</option>
        <option value="Transferencia">Transferencia bancaria</option>
        <option value="Tarjeta">Tarjeta / Bitcoin / PayPal</option>
      </select>

      <label>Nota para el repartidor (opcional)</label>
      <textarea 
        name="nota" 
        value={datos.nota} 
        onChange={handleChange} 
        placeholder="Instrucciones especiales para llegar..."
        maxLength={150}
      ></textarea>
    </div>
  );
}