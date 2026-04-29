import { useOrder } from '../context/OrderContext';

export default function CheckoutForm() {
  const { datosUsuario, setDatosUsuario, hora: horaActiva, setHora } = useOrder();
  
  const horarios = [
    'Lo antes posible', '10:00 – 12:00', '12:00 – 14:00', '14:00 – 17:00', '17:00 – 19:00'
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

  const numerosTel = datosUsuario.tel.replace(/\D/g, '');
  const telInvalido = numerosTel.length > 0 && (numerosTel.length < 8 || !/^[267]/.test(numerosTel));

  return (
    <div className="section">
      <div className="step-label">Paso 3 — Tus datos</div>

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
        <option value="Tarjeta">Tarjeta / Bitcoin / PayPal</option>
      </select>

      <label>Nota para el repartidor (opcional)</label>
      <textarea name="nota" value={datosUsuario.nota} onChange={handleChange} placeholder="Instrucciones especiales..." maxLength={150}></textarea>
    </div>
  );
}