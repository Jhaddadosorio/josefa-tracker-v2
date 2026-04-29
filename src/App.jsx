import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jjsdjqhhlgwxhhjufpih.supabase.co";
const SUPABASE_KEY = "sb_publishable_t9Zft3LoUQ512V95sRMDqw_ojRQXnPB";
const UF_FALLBACK = 40000;
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const P = {
  lavender: "#EDE9F8", lavenderDark: "#7C6FC4",
  rose: "#FDEDF2", roseDark: "#C2547A",
  mint: "#E6F5F0", mintDark: "#2E8B6A",
  peach: "#FEF0E7", peachDark: "#C46A2E",
  sky: "#E8F4FD", skyDark: "#2A7AB8",
  sand: "#FAF7F0", text: "#2D2D2D", textMuted: "#8A8A8A",
  border: "rgba(0,0,0,0.08)", white: "#FFFFFF", bg: "#F7F5FF",
};

const STATUS_CFG = {
  reserva: { bg: P.peach, color: P.peachDark, label: "Reserva" },
  promesa: { bg: P.sky,   color: P.skyDark,   label: "Promesa" },
  pagado:  { bg: P.mint,  color: P.mintDark,  label: "Pagado"  },
};

const HITO_CFG = {
  promesa:   { label: "A la promesa",   color: P.skyDark },
  escritura: { label: "A la escritura", color: P.lavenderDark },
  mixto:     { label: "1.5% + 1.5%",   color: P.peachDark },
};

const db = async (path, method = "GET", body) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : method === "PATCH" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  if (method === "DELETE") return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const S = {
  card: { background: P.white, borderRadius: 16, border: `1px solid ${P.border}`, padding: "16px 20px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  metricCard: (bg) => ({ background: bg, borderRadius: 16, padding: "16px 20px", flex: 1 }),
  inp: { width: "100%", marginBottom: 12, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${P.border}`, background: P.sand, color: P.text, fontSize: 14, boxSizing: "border-box", outline: "none" },
  btnPrimary: { padding: "12px 24px", borderRadius: 50, border: "none", background: P.lavenderDark, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnGhost: { padding: "10px 20px", borderRadius: 50, border: `1.5px solid ${P.border}`, background: "transparent", color: P.textMuted, fontWeight: 500, cursor: "pointer", fontSize: 14 },
  btnSmall: (color) => ({ padding: "5px 14px", borderRadius: 50, border: `1.5px solid ${color}`, background: "transparent", color, fontWeight: 500, cursor: "pointer", fontSize: 12 }),
  badge: (bg, color) => ({ background: bg, color, fontSize: 11, padding: "3px 10px", borderRadius: 50, fontWeight: 600, display: "inline-block" }),
  label: { fontSize: 12, color: P.textMuted, marginBottom: 4, display: "block" },
  navBtn: (active) => ({ padding: "9px 18px", borderRadius: 50, border: "none", background: active ? P.lavenderDark : "transparent", color: active ? "#fff" : P.textMuted, fontWeight: 600, cursor: "pointer", fontSize: 13 }),
};

function MiniModalEstado({ modalEstado, setModalEstado, confirmarEstado, proyectoById, P, S }) {
  const [fecha, setFecha] = useState("");
  const [mes, setMes] = useState("");
  const [prob, setProb] = useState(50);
  const [fechaEsc, setFechaEsc] = useState("");
  const [fechaTentativa, setFechaTentativa] = useState("");
  const { prop, estado, tipo } = modalEstado;
  const proy = proyectoById(prop.proyecto_id);
  const esMixto = proy?.hito_pago === "mixto";

  const guardar = () => {
    if (tipo === "reserva") confirmarEstado({ mes_forecast: mes, prob_forecast: prob, fecha_promesa: fechaTentativa || null });
    else if (tipo === "promesa") confirmarEstado({ fecha_promesa: fecha, fecha_escritura: esMixto ? fechaEsc : null, mes_forecast: null });
    else if (tipo === "pagado") confirmarEstado({ fecha_promesa: fecha, mes_forecast: null });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(80,60,120,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 250, backdropFilter: "blur(2px)" }}>
      <div style={{ background: P.white, borderRadius: 20, padding: "24px", width: 320, boxShadow: "0 4px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
          {tipo === "reserva" ? "🔖 Reserva" : tipo === "promesa" ? "📋 Promesa firmada" : "✅ Pagado"}
        </div>
        <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 16 }}>{prop.uf} UF · {proy?.nombre}</div>

        {tipo === "reserva" && (
          <>
            <label style={S.label}>Mes estimado de conversión a promesa</label>
            <input type="month" style={S.inp} value={mes} onChange={e => setMes(e.target.value)} />
            <label style={S.label}>Fecha tentativa de firma promesa (opcional)</label>
            <input type="date" style={S.inp} value={fechaTentativa} onChange={e => setFechaTentativa(e.target.value)} />
            <label style={S.label}>Probabilidad de cierre: <strong>{prob}%</strong></label>
            <input type="range" min={10} max={100} step={10} value={prob} onChange={e => setProb(parseInt(e.target.value))} style={{ width: "100%", marginBottom: 16, accentColor: P.peachDark }} />
          </>
        )}

        {(tipo === "promesa" || tipo === "pagado") && (
          <>
            <label style={S.label}>Fecha de firma promesa</label>
            <input type="date" style={S.inp} value={fecha} onChange={e => setFecha(e.target.value)} />
          </>
        )}

        {tipo === "promesa" && esMixto && (
          <>
            <label style={S.label}>Fecha estimada escritura (2do pago)</label>
            <input type="date" style={S.inp} value={fechaEsc} onChange={e => setFechaEsc(e.target.value)} />
          </>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btnPrimary, flex: 1 }} onClick={guardar}>Confirmar</button>
          <button style={S.btnGhost} onClick={() => setModalEstado(null)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [inmobiliarias, setInmobiliarias] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [ufHoy, setUfHoy] = useState(UF_FALLBACK);
  const [vista, setVista] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editUF, setEditUF] = useState(false);
  const [ufInput, setUfInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inm, proy, cli, prop] = await Promise.all([
        db("inmobiliarias?select=*&order=nombre"),
        db("proyectos?select=*&order=nombre"),
        db("clientes?select=*&order=created_at"),
        db("propiedades?select=*&order=created_at"),
      ]);
      setInmobiliarias(inm || []);
      setProyectos(proy || []);
      setClientes(cli || []);
      setPropiedades(prop || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const fmt = n => Math.round(n).toLocaleString("es-CL");
  const fmtUF = n => Number(n).toFixed(2);
  const proyectoById = id => proyectos.find(p => p.id === id);
  const inmobiliariaById = id => inmobiliarias.find(i => i.id === id);
  const clienteById = id => clientes.find(c => c.id === id);
  const pctJosefa = cid => clienteById(cid)?.tipo === "referido" ? 50 : 30;

  const comisionTotal = prop => {
    const proy = proyectoById(prop.proyecto_id);
    if (!proy) return 0;
    return prop.uf * (proy.porcentaje_zaror / 100) * (pctJosefa(prop.cliente_id) / 100);
  };

  const addDays = (dateStr, days) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + days);
    return d;
  };

  const pagosDePropiedad = prop => {
    const proy = proyectoById(prop.proyecto_id);
    if (!proy) return [];
    const com = comisionTotal(prop);
    const pagos = [];
    if (prop.estado === "pagado") {
      pagos.push({ tipo: "pagado", monto: com, fecha: addDays(prop.fecha_promesa, 30) });
    } else if (prop.estado === "promesa") {
      if (proy.hito_pago === "mixto") {
        pagos.push({ tipo: "comprometido", monto: com / 2, fecha: addDays(prop.fecha_promesa, 30) });
        pagos.push({ tipo: "comprometido", monto: com / 2, fecha: addDays(prop.fecha_escritura, 0) });
      } else if (proy.hito_pago === "escritura") {
        pagos.push({ tipo: "comprometido", monto: com, fecha: addDays(prop.fecha_escritura, 0) });
      } else {
        pagos.push({ tipo: "comprometido", monto: com, fecha: addDays(prop.fecha_promesa, 30) });
      }
    } else if (prop.estado === "reserva" && prop.mes_forecast && prop.prob_forecast) {
      const [y, m] = prop.mes_forecast.split("-");
      const d = new Date(parseInt(y), parseInt(m) - 1, 15);
      d.setDate(d.getDate() + 30);
      pagos.push({ tipo: "forecast", monto: com * (prop.prob_forecast / 100), fecha: d });
    }
    return pagos;
  };

  const proyeccionMeses = () => {
    const hoy = new Date();
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      return { year: d.getFullYear(), month: d.getMonth(), pagado: 0, comprometido: 0, forecast: 0 };
    });
    propiedades.forEach(prop => {
      pagosDePropiedad(prop).forEach(pago => {
        if (!pago.fecha) return;
        const idx = meses.findIndex(m => m.year === pago.fecha.getFullYear() && m.month === pago.fecha.getMonth());
        if (idx < 0) return;
        meses[idx][pago.tipo] += pago.monto;
      });
    });
    return meses;
  };

  const totales = () => {
    let pendiente = 0, cobrado = 0, forecast = 0;
    propiedades.forEach(prop => {
      const com = comisionTotal(prop);
      if (prop.estado === "pagado") cobrado += com;
      else if (prop.estado === "promesa") pendiente += com;
      else if (prop.estado === "reserva" && prop.prob_forecast) forecast += com * (prop.prob_forecast / 100);
    });
    return { pendiente, cobrado, forecast };
  };

  const meses = proyeccionMeses();
  const tots = totales();
  const maxBar = Math.max(...meses.map(m => m.pagado + m.comprometido + m.forecast), 1);

  const openModal = (tipo, obj = {}) => {
    if (tipo === "propiedad" && obj.proyecto_id) {
      const proy = proyectoById(obj.proyecto_id);
      obj._inmob = proy?.inmobiliaria_id || "";
    }
    setModal(tipo);
    setForm({ ...obj });
  };

  const closeModal = () => { setModal(null); setForm({}); };
  const ff = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [modalEstado, setModalEstado] = useState(null); // { prop, estado }

  const cambiarEstado = (prop, nuevoEstado) => {
    if (nuevoEstado === prop.estado) return;
    if (nuevoEstado === "reserva") {
      // reserva no necesita fecha, solo mes forecast
      setModalEstado({ prop, estado: nuevoEstado, tipo: "reserva" });
    } else if (nuevoEstado === "promesa") {
      setModalEstado({ prop, estado: nuevoEstado, tipo: "promesa" });
    } else if (nuevoEstado === "pagado") {
      setModalEstado({ prop, estado: nuevoEstado, tipo: "pagado" });
    }
  };

  const confirmarEstado = async (extra = {}) => {
    const { prop, estado } = modalEstado;
    const body = { estado, ...extra };
    await db(`propiedades?id=eq.${prop.id}`, "PATCH", body);
    setModalEstado(null);
    await load();
  };

  const cambiarProb = async (prop, val) => {
    setPropiedades(ps => ps.map(p => p.id === prop.id ? { ...p, prob_forecast: val } : p));
  };

  const guardarProb = async (prop, val) => {
    await db(`propiedades?id=eq.${prop.id}`, "PATCH", { prob_forecast: val });
  };

  const savePropiedad = async () => {
    setSaving(true);
    const proy = proyectoById(form.proyecto_id);
    const body = {
      cliente_id: form.cliente_id,
      proyecto_id: form.proyecto_id,
      uf: parseFloat(form.uf) || 0,
      estado: form.estado || "reserva",
      fecha_promesa: (form.estado === "promesa" || form.estado === "pagado") ? form.fecha_promesa : null,
      fecha_escritura: (form.estado === "promesa" && proy?.hito_pago === "mixto") ? form.fecha_escritura : null,
      mes_forecast: form.estado === "reserva" ? form.mes_forecast : null,
      prob_forecast: form.estado === "reserva" ? parseInt(form.prob_forecast) || 50 : null,
    };
    try {
      if (form.id) await db(`propiedades?id=eq.${form.id}`, "PATCH", body);
      else await db("propiedades", "POST", body);
      await load(); closeModal();
    } catch(e) { alert("Error al guardar: " + e.message); }
    setSaving(false);
  };

  const saveCliente = async () => {
    setSaving(true);
    const body = { nombre: form.nombre, tipo: form.tipo || "lead" };
    try {
      if (form.id) await db(`clientes?id=eq.${form.id}`, "PATCH", body);
      else await db("clientes", "POST", body);
      await load(); closeModal();
    } catch(e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  const saveProyecto = async () => {
    setSaving(true);
    const body = {
      nombre: form.nombre,
      inmobiliaria_id: form.inmobiliaria_id,
      porcentaje_zaror: parseFloat(form.porcentaje_zaror) || 3,
      hito_pago: form.hito_pago || "promesa",
    };
    try {
      if (form.id) await db(`proyectos?id=eq.${form.id}`, "PATCH", body);
      else await db("proyectos", "POST", body);
      await load(); closeModal();
    } catch(e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  const deletePropiedad = async id => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    await db(`propiedades?id=eq.${id}`, "DELETE");
    await load();
  };

  const proyectoSeleccionado = proyectoById(form.proyecto_id);
  const navItems = [
    { id: "dashboard", label: "Inicio" },
    { id: "propiedades", label: "Propiedades" },
    { id: "clientes", label: "Clientes" },
    { id: "proyectos", label: "Proyectos" },
  ];

  if (loading) return (
    <div style={{ padding: 60, textAlign: "center", fontFamily: "system-ui", color: P.textMuted }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
      <div style={{ fontSize: 14 }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: P.bg, minHeight: "100vh", color: P.text }}>

      {/* Header */}
      <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: P.lavenderDark }}>mis comisiones ✦</div>
          <button onClick={() => { setUfInput(String(ufHoy)); setEditUF(true); }} style={{ fontSize: 12, color: P.lavenderDark, fontWeight: 600, background: P.lavender, border: "none", borderRadius: 8, padding: "3px 8px", cursor: "pointer", marginTop: 2 }}>
            UF: ${fmt(ufHoy)} ✎
          </button>
        </div>
        <nav style={{ display: "flex", gap: 4, background: P.lavender, borderRadius: 50, padding: 4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setVista(n.id)} style={S.navBtn(vista === n.id)}>{n.label}</button>
          ))}
        </nav>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* DASHBOARD */}
        {vista === "dashboard" && (
          <>
            {/* Banner motivacional */}
            <div style={{ background: `linear-gradient(135deg, ${P.lavenderDark}, #C2547A)`, borderRadius: 20, padding: "20px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -10, top: -10, fontSize: 80, opacity: 0.15, transform: "rotate(15deg)" }}>🏠</div>
              <div style={{ position: "absolute", right: 40, bottom: -15, fontSize: 60, opacity: 0.1, transform: "rotate(-10deg)" }}>✦</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 8 }}>
                {tots.pendiente + tots.cobrado + tots.forecast === 0
                  ? "¡Vamos Josefa! 🚀"
                  : tots.cobrado > 0
                  ? "¡Estás on fire, Josefa! 🔥"
                  : "¡Vas con todo, Josefa! 💪"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                {tots.pendiente + tots.cobrado + tots.forecast === 0
                  ? "Cada gran pipeline empieza con una primera venta. ¡Tú puedes!"
                  : tots.cobrado > 0
                  ? `Ya tienes ${fmtUF(tots.cobrado)} UF cobradas. ¡Sigue así!`
                  : `Tienes ${fmtUF(tots.pendiente)} UF comprometidas. ¡El pago viene!`}
              </div>
              {propiedades.length > 0 && (
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{propiedades.filter(p => p.estado === "reserva").length}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Reservas</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{propiedades.filter(p => p.estado === "promesa").length}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Promesas</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{propiedades.filter(p => p.estado === "pagado").length}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Pagadas</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "8px 14px", textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{fmtUF(tots.cobrado + tots.pendiente)} UF</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Total pipeline</div>
                  </div>
                </div>
              )}
            </div>
              {[
                { label: "Cobrado", val: tots.cobrado, bg: P.mint, color: P.mintDark },
                { label: "Por cobrar", val: tots.pendiente, bg: P.sky, color: P.skyDark },
                { label: "Forecast", val: tots.forecast, bg: P.peach, color: P.peachDark },
              ].map(c => (
                <div key={c.label} style={S.metricCard(c.bg)}>
                  <div style={{ fontSize: 11, color: c.color, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{fmtUF(c.val)} UF</div>
                  <div style={{ fontSize: 13, color: c.color, opacity: 0.85, marginTop: 2 }}>${fmt(c.val * ufHoy)}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, padding: "20px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Proyección 6 meses</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 11 }}>
                {[["Pagado", P.mintDark, P.mint], ["Comprometido", P.skyDark, P.sky], ["Forecast", P.peachDark, P.peach]].map(([l, c, bg]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: c, fontWeight: 600 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `2px solid ${c}`, display: "inline-block" }}></span>{l}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 160 }}>
                {meses.map((m, i) => {
                  const total = m.pagado + m.comprometido + m.forecast;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      {total > 0 && (
                        <div style={{ fontSize: 8, color: P.textMuted, textAlign: "center", lineHeight: 1.3 }}>
                          {fmtUF(total)}<br/><span style={{ fontSize: 7 }}>${Math.round(total * ufHoy / 1000)}k</span>
                        </div>
                      )}
                      <div style={{ width: "100%", height: 110, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        <div style={{ display: "flex", flexDirection: "column", borderRadius: "5px 5px 0 0", overflow: "hidden" }}>
                          {m.forecast > 0 && <div style={{ height: Math.max((m.forecast / maxBar) * 110, 3), background: P.peach, border: `1px solid ${P.peachDark}` }}></div>}
                          {m.comprometido > 0 && <div style={{ height: Math.max((m.comprometido / maxBar) * 110, 3), background: P.sky, border: `1px solid ${P.skyDark}` }}></div>}
                          {m.pagado > 0 && <div style={{ height: Math.max((m.pagado / maxBar) * 110, 3), background: P.mint, border: `1px solid ${P.mintDark}` }}></div>}
                        </div>
                      </div>
                      <div style={{ fontSize: 9, color: P.textMuted, textAlign: "center", lineHeight: 1.3 }}>{MESES[m.month]}<br />{String(m.year).slice(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {propiedades.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px", color: P.textMuted }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏠</div>
                <div style={{ fontWeight: 600 }}>Aún no hay propiedades</div>
                <div style={{ fontSize: 13 }}>Ve a Propiedades y agrega tu primera venta</div>
              </div>
            )}
          </>
        )}

        {/* PROPIEDADES */}
        {vista === "propiedades" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Propiedades</div>
              <button style={S.btnPrimary} onClick={() => openModal("propiedad")}>+ Nueva</button>
            </div>
            {propiedades.length === 0 && <div style={{ color: P.textMuted, textAlign: "center", padding: 32 }}>Sin propiedades aún.</div>}
            {propiedades.map(prop => {
              const proy = proyectoById(prop.proyecto_id);
              const cli = clienteById(prop.cliente_id);
              const com = comisionTotal(prop);
              const sc = STATUS_CFG[prop.estado] || STATUS_CFG.reserva;
              const hc = proy ? HITO_CFG[proy.hito_pago] : null;
              return (
                <div key={prop.id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{cli?.nombre || "Sin cliente"}</div>
                      <div style={{ fontSize: 12, color: P.textMuted }}>{proy?.nombre}</div>
                    </div>
                    <span style={S.badge(sc.bg, sc.color)}>{sc.label}</span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={S.badge(P.lavender, P.lavenderDark)}>{prop.uf} UF</span>
                    {proy && <span style={S.badge(P.sand, P.textMuted)}>Zaror {proy.porcentaje_zaror}%</span>}
                    <span style={S.badge(P.rose, P.roseDark)}>Josefa {pctJosefa(prop.cliente_id)}%</span>
                    {hc && <span style={S.badge("#f5f5f5", hc.color)}>{hc.label}</span>}
                  </div>

                  <div style={{ background: P.lavender, borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: P.lavenderDark, fontWeight: 600, marginBottom: 2 }}>Comisión Josefa</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: P.lavenderDark }}>{fmtUF(com)} UF</div>
                    <div style={{ fontSize: 12, color: P.lavenderDark, opacity: 0.8 }}>${fmt(com * ufHoy)}</div>
                  </div>

                  {/* Cambio de estado rápido */}
                  <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${P.border}`, marginBottom: prop.estado === "reserva" ? 10 : 0 }}>
                    {["reserva","promesa","pagado"].map(e => {
                      const cfg = STATUS_CFG[e];
                      const active = prop.estado === e;
                      return (
                        <button key={e} onClick={() => cambiarEstado(prop, e)} style={{ flex: 1, padding: "7px 4px", border: "none", background: active ? cfg.color : "transparent", color: active ? "#fff" : P.textMuted, fontSize: 11, fontWeight: active ? 700 : 400, cursor: "pointer" }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Slider probabilidad solo en reserva */}
                  {prop.estado === "reserva" && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: P.textMuted, marginBottom: 4 }}>
                        Probabilidad cierre: <strong style={{ color: P.peachDark }}>{prop.prob_forecast || 50}%</strong>
                        {prop.mes_forecast && <span> · {prop.mes_forecast}</span>}
                      </div>
                      <input type="range" min={0} max={100} step={10}
                        value={prop.prob_forecast || 50}
                        onChange={e => cambiarProb(prop, parseInt(e.target.value))}
                        onMouseUp={e => guardarProb(prop, parseInt(e.target.value))}
                        onTouchEnd={e => guardarProb(prop, prop.prob_forecast)}
                        style={{ width: "100%", accentColor: P.peachDark }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: P.textMuted }}>
                        <span>0%</span><span>50%</span><span>100%</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={S.btnSmall(P.lavenderDark)} onClick={() => openModal("propiedad", { ...prop })}>✎ Editar</button>
                    <button style={S.btnSmall(P.roseDark)} onClick={() => deletePropiedad(prop.id)}>✕ Eliminar</button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* CLIENTES */}
        {vista === "clientes" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Clientes</div>
              <button style={S.btnPrimary} onClick={() => openModal("cliente")}>+ Nuevo</button>
            </div>
            {clientes.length === 0 && <div style={{ color: P.textMuted, textAlign: "center", padding: 32 }}>Sin clientes aún.</div>}
            {clientes.map(c => {
              const props = propiedades.filter(p => p.cliente_id === c.id);
              const total = props.reduce((s, p) => s + comisionTotal(p), 0);
              return (
                <div key={c.id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: P.textMuted, marginTop: 2 }}>{props.length} propiedad{props.length !== 1 ? "es" : ""} · {fmtUF(total)} UF</div>
                    </div>
                    <span style={S.badge(c.tipo === "referido" ? P.sky : P.mint, c.tipo === "referido" ? P.skyDark : P.mintDark)}>
                      {c.tipo === "referido" ? "Referido 50%" : "Lead 30%"}
                    </span>
                  </div>
                  <button style={{ ...S.btnSmall(P.lavenderDark), marginTop: 12 }} onClick={() => openModal("cliente", { ...c })}>✎ Editar</button>
                </div>
              );
            })}
          </>
        )}

        {/* PROYECTOS */}
        {vista === "proyectos" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Proyectos</div>
              <button style={S.btnPrimary} onClick={() => openModal("proyecto")}>+ Nuevo</button>
            </div>
            {inmobiliarias.map(inm => {
              const proys = proyectos.filter(p => p.inmobiliaria_id === inm.id);
              if (proys.length === 0) return null;
              return (
                <div key={inm.id} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: P.lavenderDark, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{inm.nombre}</div>
                  {proys.map(p => (
                    <div key={p.id} style={{ ...S.card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                          <span style={S.badge(P.lavender, P.lavenderDark)}>{p.porcentaje_zaror}% Zaror</span>
                          <span style={S.badge(P.sand, P.textMuted)}>{HITO_CFG[p.hito_pago]?.label}</span>
                        </div>
                      </div>
                      <button style={S.btnSmall(P.lavenderDark)} onClick={() => openModal("proyecto", { ...p })}>Editar</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* MODAL UF */}
      {editUF && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(80,60,120,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(2px)" }}>
          <div style={{ background: P.white, borderRadius: 20, padding: "28px 24px", width: 300, boxShadow: "0 4px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Actualizar UF</div>
            <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 16 }}>Ingresa el valor de la UF de hoy</div>
            <input autoFocus type="number" value={ufInput} onChange={e => setUfInput(e.target.value)}
              placeholder="Ej: 40000" style={{ ...S.inp, fontSize: 18, fontWeight: 600, textAlign: "center" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btnPrimary, flex: 1 }} onClick={() => { const v = parseFloat(ufInput); if (v > 1000) setUfHoy(v); setEditUF(false); }}>Guardar</button>
              <button style={S.btnGhost} onClick={() => setEditUF(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MINI MODAL ESTADO */}
      {modalEstado && <MiniModalEstado modalEstado={modalEstado} setModalEstado={setModalEstado} confirmarEstado={confirmarEstado} proyectoById={proyectoById} P={P} S={S} />}

      {/* MODAL PRINCIPAL */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(80,60,120,0.25)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)" }}>
          <div style={{ background: P.white, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 -4px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ width: 36, height: 4, background: P.border, borderRadius: 2, margin: "0 auto 20px" }}></div>

            {modal === "propiedad" && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{form.id ? "Editar" : "Nueva"} propiedad</div>
                <label style={S.label}>Cliente</label>
                <select style={S.inp} value={form.cliente_id || ""} onChange={e => ff("cliente_id", e.target.value)}>
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.tipo === "referido" ? "Referido 50%" : "Lead 30%"}</option>)}
                </select>
                <label style={S.label}>Inmobiliaria</label>
                <select style={S.inp} value={form._inmob || ""} onChange={e => { ff("_inmob", e.target.value); ff("proyecto_id", ""); }}>
                  <option value="">Seleccionar inmobiliaria</option>
                  {inmobiliarias.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
                {form._inmob && (
                  <>
                    <label style={S.label}>Proyecto</label>
                    <select style={S.inp} value={form.proyecto_id || ""} onChange={e => ff("proyecto_id", e.target.value)}>
                      <option value="">Seleccionar proyecto</option>
                      {proyectos.filter(p => p.inmobiliaria_id === form._inmob).map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} · {p.porcentaje_zaror}% · {HITO_CFG[p.hito_pago]?.label}</option>
                      ))}
                    </select>
                  </>
                )}
                <label style={S.label}>Valor en UF</label>
                <input placeholder="Ej: 3500" type="number" style={S.inp} value={form.uf || ""} onChange={e => ff("uf", e.target.value)} />
                <label style={S.label}>Estado</label>
                <select style={S.inp} value={form.estado || "reserva"} onChange={e => ff("estado", e.target.value)}>
                  <option value="reserva">Reserva</option>
                  <option value="promesa">Promesa firmada</option>
                  <option value="pagado">Pagado</option>
                </select>
                {(form.estado === "promesa" || form.estado === "pagado") && (
                  <>
                    <label style={S.label}>Fecha de firma promesa</label>
                    <input type="date" style={S.inp} value={form.fecha_promesa || ""} onChange={e => ff("fecha_promesa", e.target.value)} />
                  </>
                )}
                {form.estado === "promesa" && proyectoSeleccionado?.hito_pago === "mixto" && (
                  <>
                    <label style={S.label}>Fecha estimada escritura</label>
                    <input type="date" style={S.inp} value={form.fecha_escritura || ""} onChange={e => ff("fecha_escritura", e.target.value)} />
                  </>
                )}
                {form.estado === "reserva" && (
                  <>
                    <label style={S.label}>Mes estimado de conversión</label>
                    <input type="month" style={S.inp} value={form.mes_forecast || ""} onChange={e => ff("mes_forecast", e.target.value)} />
                    <label style={S.label}>Probabilidad: <strong>{form.prob_forecast || 50}%</strong></label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {[10,25,50,75,90,100].map(v => (
                        <button key={v} onClick={() => ff("prob_forecast", v)} style={{ padding: "6px 14px", borderRadius: 50, border: `1.5px solid ${(form.prob_forecast || 50) === v ? P.lavenderDark : P.border}`, background: (form.prob_forecast || 50) === v ? P.lavender : "transparent", color: (form.prob_forecast || 50) === v ? P.lavenderDark : P.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{v}%</button>
                      ))}
                    </div>
                  </>
                )}
                {proyectoSeleccionado && form.uf && form.cliente_id && (
                  <div style={{ background: P.lavender, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: P.lavenderDark, fontWeight: 600, marginBottom: 4 }}>Vista previa comisión</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: P.lavenderDark }}>
                      {fmtUF(parseFloat(form.uf||0) * (proyectoSeleccionado.porcentaje_zaror/100) * (pctJosefa(form.cliente_id)/100))} UF
                    </div>
                    <div style={{ fontSize: 12, color: P.lavenderDark, opacity: 0.75 }}>
                      ${fmt(parseFloat(form.uf||0) * (proyectoSeleccionado.porcentaje_zaror/100) * (pctJosefa(form.cliente_id)/100) * ufHoy)}
                    </div>
                  </div>
                )}
              </>
            )}

            {modal === "cliente" && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{form.id ? "Editar" : "Nuevo"} cliente</div>
                <label style={S.label}>Nombre completo</label>
                <input placeholder="Ej: María González" style={S.inp} value={form.nombre || ""} onChange={e => ff("nombre", e.target.value)} />
                <label style={S.label}>Tipo de cliente</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  {[["lead","Lead","30%",P.mint,P.mintDark],["referido","Referido","50%",P.sky,P.skyDark]].map(([val,label,pct,bg,color]) => (
                    <button key={val} onClick={() => ff("tipo", val)} style={{ flex: 1, padding: "14px", borderRadius: 14, border: `2px solid ${(form.tipo||"lead")===val ? color : P.border}`, background: (form.tipo||"lead")===val ? bg : "transparent", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 12, color, opacity: 0.8 }}>Josefa gana {pct}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {modal === "proyecto" && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{form.id ? "Editar" : "Nuevo"} proyecto</div>
                <label style={S.label}>Inmobiliaria</label>
                <select style={S.inp} value={form.inmobiliaria_id || ""} onChange={e => ff("inmobiliaria_id", e.target.value)}>
                  <option value="">Seleccionar inmobiliaria</option>
                  {inmobiliarias.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
                <label style={S.label}>Nombre del proyecto</label>
                <input placeholder="Ej: Torre Alameda" style={S.inp} value={form.nombre || ""} onChange={e => ff("nombre", e.target.value)} />
                <label style={S.label}>% que gana Zaror Invest: <strong>{form.porcentaje_zaror || 3}%</strong></label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {[2,2.5,3,3.5,4].map(v => (
                    <button key={v} onClick={() => ff("porcentaje_zaror", v)} style={{ padding: "7px 16px", borderRadius: 50, border: `1.5px solid ${(parseFloat(form.porcentaje_zaror)||3)===v ? P.lavenderDark : P.border}`, background: (parseFloat(form.porcentaje_zaror)||3)===v ? P.lavender : "transparent", color: (parseFloat(form.porcentaje_zaror)||3)===v ? P.lavenderDark : P.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{v}%</button>
                  ))}
                </div>
                <label style={S.label}>Condición de pago</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {[["promesa","A la promesa","Pago al firmar la promesa"],["escritura","A la escritura","Pago al firmar la escritura"],["mixto","1.5% promesa + 1.5% escritura","Pago dividido en dos hitos"]].map(([val,label,desc]) => (
                    <button key={val} onClick={() => ff("hito_pago", val)} style={{ padding: "12px 16px", borderRadius: 14, border: `2px solid ${(form.hito_pago||"promesa")===val ? P.lavenderDark : P.border}`, background: (form.hito_pago||"promesa")===val ? P.lavender : "transparent", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ fontWeight: 700, color: (form.hito_pago||"promesa")===val ? P.lavenderDark : P.text, fontSize: 13 }}>{label}</div>
                      <div style={{ fontSize: 11, color: P.textMuted, marginTop: 2 }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btnPrimary, flex: 1, opacity: saving ? 0.6 : 1 }} disabled={saving}
                onClick={modal === "propiedad" ? savePropiedad : modal === "cliente" ? saveCliente : saveProyecto}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button style={S.btnGhost} onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
