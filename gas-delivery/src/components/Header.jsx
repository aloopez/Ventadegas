import { useOrder } from '../context/OrderContext';

export default function Header() {
  const { agencia } = useOrder();

  // Si la agencia aún no ha cargado desde la base de datos, evitamos que la página explote
  if (!agencia) return null;

  // 1. Calculamos la hora actual en El Salvador
  const svTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/El_Salvador" }));
  const tiempoActual = svTime.getHours() + (svTime.getMinutes() / 60);

  // 2. Extraemos los horarios de la agencia de la base de datos
  let horaApertura = 7, horaCierre = 19;
  
  if (agencia.hora_apertura) {
    const [h, m] = agencia.hora_apertura.split(':');
    horaApertura = parseInt(h, 10) + (parseInt(m, 10) / 60);
  }
  if (agencia.hora_cierre) {
    const [h, m] = agencia.hora_cierre.split(':');
    horaCierre = parseInt(h, 10) + (parseInt(m, 10) / 60);
  }

  // 3. Verificamos si ahorita mismo está abierto
  const estaAbierto = tiempoActual >= horaApertura && tiempoActual < horaCierre;

  // 4. Función para darle formato bonito (ej. 19:00:00 -> 7pm)
  const formatearHora = (horaSql) => {
    if (!horaSql) return '';
    const [h, m] = horaSql.split(':');
    let horaInt = parseInt(h, 10);
    const ampm = horaInt >= 12 ? 'pm' : 'am';
    horaInt = horaInt % 12 || 12;
    return `${horaInt}${m !== '00' ? ':'+m : ''}${ampm}`;
  };

  const textoHorario = `lun a dom, ${formatearHora(agencia.hora_apertura || '07:00:00')}–${formatearHora(agencia.hora_cierre || '19:00:00')}`;

  // Usamos el color de la base de datos, si no hay, cae al naranja por defecto
  const colorMarca = agencia.color_primario || '#e85d04';

  return (
    <div className="header" style={{ '--primary': colorMarca }}>
      <div className="header-top">
        <div className="logo-box">{agencia.logo || agencia.nombre.charAt(0)}</div>
        <span className="site-name">{agencia.nombre}</span>
      </div>
      <div className="tagline">{agencia.slogan}</div>
      
      {/* MAGIA: Renderizamos el letrero verde o rojo dependiendo de la hora */}
      {estaAbierto ? (
        <div className="avail">
          <span className="dot"></span>
          Disponible ahora — {textoHorario}
        </div>
      ) : (
        <div className="avail" style={{ color: '#ef4444', backgroundColor: '#fef2f2' }}>
          <span className="dot" style={{ backgroundColor: '#ef4444', animation: 'none' }}></span>
          Cerrado ahora — {textoHorario}
        </div>
      )}
    </div>
  );
}