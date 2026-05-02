import { useOrder } from '../context/OrderContext';

export default function CheckoutForm() {
  const { datosUsuario, setDatosUsuario, hora: horaActiva, setHora } = useOrder();
  const horarios = [
    'Lo antes posible', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 17:00', '17:00 - 19:00'
  ];

  const handleChange = (e) => {
    setDatosUsuario({ ...datosUsuario, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 8) value = value.slice(0, 8);
    let formattedValue = value;
    if (value.length > 4) {
      formattedValue = `${value.slice(0, 4)}-${value.slice(4)}`;
    }
    setDatosUsuario({ ...datosUsuario, tel: formattedValue });
  };

  // Función para dar formato al DUI automáticamente
  const handleDuiChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 9) value = value.slice(0, 9); 
    
    let formattedValue = value;
    if (value.length > 8) {
      formattedValue = `${value.slice(0, 8)}-${value.slice(8)}`;
    }
    setDatosUsuario({ ...datosUsuario, dui: formattedValue });
  };

  const numerosTel = datosUsuario.tel.replace(/\D/g, '');
  const telInvalido = numerosTel.length > 0 && (numerosTel.length < 8 || !/^[267]/.test(numerosTel));
  
  // Validar si el DUI está incompleto
  const duiInvalido = datosUsuario.dui.length > 0 && !/^\d{8}-\d$/.test(datosUsuario.dui);

  return (
    <div className="section">
      <div className="step-label">Paso 3 – Tus datos</div>
      
      <div style={{ marginBottom: '12px' }}>
        <label>DUI *</label>
        <input 
          type="text" 
          name="dui" 
          value={datosUsuario.dui} 
          onChange={handleDuiChange} 
          placeholder="Ej: 12345678-9" 
          className={duiInvalido ? 'input-error' : ''} 
        />
        {duiInvalido && <span className="error-text">Debe tener 9 dígitos y un guion</span>}
      </div>

      <div className="row2">
        <div>
          <label>Nombre *</label>
          <input type="text" name="nombre" value={datosUsuario.nombre} onChange={handleChange} placeholder="Tu nombre" maxLength={50}/>
        </div>
        <div>
          <label>Teléfono *</label>
          <input type="tel" name="tel" value={datosUsuario.tel} onChange={handlePhoneChange} placeholder="Ej: 7000-0000" className={telInvalido ? 'input-error' : ''} />
          {telInvalido && <span className="error-text">Debe iniciar con 2, 6 o 7 y tener 8 dígitos</span>}
        </div>
      </div>

      <label>Hora de entrega</label>
      <div className="hora-row">
        {horarios.map(h => (
          <button key={h} className={`hora-btn ${horaActiva === h ? 'sel' : ''}`} onClick={() => setHora(h)}>
            {h}
          </button>
        ))}
      </div>

      <label>Forma de pago</label>
      <select name="pago" value={datosUsuario.pago} onChange={handleChange}>
        <option value="Efectivo">Efectivo al recibir</option>
        <option value="Transferencia">Transferencia bancaria</option>
      </select>

      {/* --- NUEVO: PREGUNTA DE CAMBIO CONDICIONAL --- */}
      {datosUsuario.pago === 'Efectivo' && (
        <div style={{ marginTop: '12px', marginBottom: '16px', animation: 'fadeIn 0.3s ease-in-out' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            ¿Con qué billete vas a pagar? 
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Opcional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>$</span>
            <input 
              type="number" 
              name="billete" 
              value={datosUsuario.billete} 
              onChange={handleChange} 
              placeholder="Ej: 20" 
              min="0"
              style={{ paddingLeft: '28px' }} // Espacio para el signo de dólar
            />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Para que el repartidor lleve el cambio exacto.
          </p>
        </div>
      )}
      {/* ------------------------------------------- */}

    
      {/* Etiqueta con contador de caracteres */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 8px' }}>
        <label style={{ margin: 0 }}>Nota para el repartidor (opcional)</label>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
          {datosUsuario.nota?.length || 0}/150
        </span>
      </div>
      
      <textarea 
        name="nota" 
        value={datosUsuario.nota} 
        onChange={handleChange} 
        placeholder="Instrucciones especiales..." 
        maxLength={150}
      ></textarea>
    </div>
  );
}