import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jjsdjqhhlgwxhhjufpih.supabase.co";
const SUPABASE_KEY = "sb_publishable_t9Zft3LoUQ512V95sRMDqw_ojRQXnPB";
const UF_FALLBACK = 40000;
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ── Paleta pastel ──────────────────────────────────────────────
const P = {
  lavender: "#EDE9F8",
  lavenderDark: "#7C6FC4",
  rose: "#FDEDF2",
  roseDark: "#C2547A",
  mint: "#E6F5F0",
  mintDark: "#2E8B6A",
  peach: "#FEF0E7",
  peachDark: "#C46A2E",
  sky: "#E8F4FD",
  skyDark: "#2A7AB8",
  sand: "#FAF7F0",
  text: "#2D2D2D",
  textMuted: "#8A8A8A",
  border: "rgba(0,0,0,0.08)",
  white: "#FFFFFF",
  bg: "#F7F5FF",
};

const STATUS_CFG = {
  reserva:  { bg: P.peach,    color: P.peachDark,   label: "Reserva"  },
  promesa:  { bg: P.sky,      color: P.skyDark,      label: "Promesa"  },
  pagado:   { bg: P.mint,     color: P.mintDark,     label: "Pagado"   },
};

const HITO_CFG = {
  promesa:   { label: "A la promesa",   color: P.skyDark   },
  escritura: { label: "A la escritura", color: P.lavenderDark },
  mixto:     { label: "1.5% + 1.5%",   color: P.peachDark },
};

// ── Datos base: inmobiliarias y proyectos ──────────────────────
const INMOBILIARIAS_BASE = [
  { nombre: "Ingevec" },
  { nombre: "Imagina" },
  { nombre: "Norte Verde" },
  { nombre: "Sento" },
  { nombre: "Stitchkin" },
  { nombre: "Paz" },
  { nombre: "Urmeneta" },
  { nombre: "OHC" },
  { nombre: "Grupo Araucana" },
  { nombre: "Contempla" },
  { nombre: "SSilva" },
  { nombre: "Torina" },
  { nombre: "Simonetti" },
  { nombre: "Copahue" },
  { nombre: "AJ Urbana" },
  { nombre: "Lucval" },
  { nombre: "Fundamenta" },
  { nombre: "Sur Profundo" },
];

const PROYECTOS_BASE = [
  // Ingevec
  { inmob: "Ingevec", nombre: "Centenario I", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Tocornal", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Terrazo", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Brasil", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "El Aromo", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Matta 016", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Don Ignacio", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Abdon Cifuentes", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Diagonal Paraguay", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Vicuña Mackenna 7589", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Los Lilenes", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Coronel Godoy", comuna: "Estación Central", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Vivaceta", comuna: "Independencia", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Nueva Esmeralda", comuna: "La Cisterna", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Froilan Roa 5746", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Los Alerces", comuna: "Ñuñoa", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "La Parroquia", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "EURO Vicuña Mackenna 1432", comuna: "Ñuñoa", pct: 3.0, hito: "escritura" },
  { inmob: "Ingevec", nombre: "Guillermo Mann", comuna: "Ñuñoa", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Rosas 1444", comuna: "Santiago", pct: 3.0, hito: "escritura" },
  { inmob: "Ingevec", nombre: "Diagonal Vicuña", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Entre Vicuñas", comuna: "La Florida", pct: 2.5, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Froilan Roa 5731 Torre Norte", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Froilan Roa 5731 Torre Sur", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Don Pepe 154", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Mapocho 3521 Torre A", comuna: "Quinta Normal", pct: 3.0, hito: "escritura" },
  { inmob: "Ingevec", nombre: "Mapocho 3521 Torre B", comuna: "Quinta Normal", pct: 3.0, hito: "escritura" },
  { inmob: "Ingevec", nombre: "Independencia 4745", comuna: "Conchalí", pct: 3.0, hito: "promesa" },
  { inmob: "Ingevec", nombre: "Mirador Irarrazaval", comuna: "Ñuñoa", pct: 3.0, hito: "promesa" },
  // Imagina
  { inmob: "Imagina", nombre: "Urban Life", comuna: "Las Condes", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "Residential Park", comuna: "Ñuñoa", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "Urban Ñuñoa", comuna: "Ñuñoa", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "Metropolitan Park I", comuna: "Ñuñoa", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "One Town", comuna: "Santiago", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "Smart Montemar", comuna: "Concón", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "Smart Too", comuna: "Ñuñoa", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "Smart La Florida", comuna: "La Florida", pct: 3.5, hito: "promesa" },
  { inmob: "Imagina", nombre: "Residential Park Santiago", comuna: "San Joaquín", pct: 3.5, hito: "promesa" },
  // Norte Verde
  { inmob: "Norte Verde", nombre: "Norte Verde SF1204", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Norte Verde", nombre: "Vergara Domeyko", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Norte Verde", nombre: "Parque Panamá", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Norte Verde", nombre: "Parque Quinta", comuna: "Santiago", pct: 3.0, hito: "escritura" },
  { inmob: "Norte Verde", nombre: "Edificio Quinta Vista", comuna: "Santiago", pct: 3.0, hito: "escritura" },
  { inmob: "Norte Verde", nombre: "Origen Atacama", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Norte Verde", nombre: "Lira 622", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Norte Verde", nombre: "Borde Vivo", comuna: "Santiago", pct: 3.0, hito: "escritura" },
  { inmob: "Norte Verde", nombre: "Dual 390", comuna: "Providencia", pct: 3.0, hito: "promesa" },
  { inmob: "Norte Verde", nombre: "Vicuña Mackenna 6896", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  // Sento
  { inmob: "Sento", nombre: "Plaza Las Condes", comuna: "Las Condes", pct: 2.5, hito: "promesa" },
  { inmob: "Sento", nombre: "Compañía", comuna: "Santiago", pct: 2.5, hito: "escritura" },
  { inmob: "Sento", nombre: "Jofre 157", comuna: "Santiago", pct: 2.5, hito: "promesa" },
  { inmob: "Sento", nombre: "San Ignacio 280", comuna: "Santiago", pct: 2.5, hito: "promesa" },
  { inmob: "Sento", nombre: "Domeyko 2055", comuna: "Santiago", pct: 2.5, hito: "promesa" },
  // Stitchkin
  { inmob: "Stitchkin", nombre: "Las Condes 7039", comuna: "Las Condes", pct: 4.0, hito: "promesa" },
  { inmob: "Stitchkin", nombre: "Eleuterio Ramirez", comuna: "Santiago", pct: 4.0, hito: "escritura" },
  { inmob: "Stitchkin", nombre: "Novus G", comuna: "Macul", pct: 4.0, hito: "promesa" },
  { inmob: "Stitchkin", nombre: "Novus E", comuna: "Macul", pct: 4.0, hito: "promesa" },
  // Paz
  { inmob: "Paz", nombre: "Seminario II", comuna: "Ñuñoa", pct: 4.0, hito: "promesa" },
  { inmob: "Paz", nombre: "Carrión 2", comuna: "Independencia", pct: 4.0, hito: "promesa" },
  { inmob: "Paz", nombre: "Mosaic Art", comuna: "Santiago", pct: 4.0, hito: "promesa" },
  { inmob: "Paz", nombre: "Neo Art", comuna: "Santiago", pct: 4.0, hito: "promesa" },
  { inmob: "Paz", nombre: "Zorzal", comuna: "Estación Central", pct: 4.0, hito: "escritura" },
  { inmob: "Paz", nombre: "Santa Elvira", comuna: "Santiago", pct: 4.0, hito: "promesa" },
  { inmob: "Paz", nombre: "San Francisco 211", comuna: "Santiago", pct: 4.0, hito: "promesa" },
  // Urmeneta
  { inmob: "Urmeneta", nombre: "Ciudad Lyon (Deisa)", comuna: "Providencia", pct: 3.5, hito: "escritura" },
  { inmob: "Urmeneta", nombre: "Status (Santolaya)", comuna: "Santiago", pct: 3.0, hito: "escritura" },
  { inmob: "Urmeneta", nombre: "Walker Martinez (Santolaya)", comuna: "La Florida", pct: 3.5, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Marca Santiago (Deisa)", comuna: "Santiago", pct: 3.5, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Neo Florida III (Santolaya)", comuna: "La Florida", pct: 3.0, hito: "escritura" },
  { inmob: "Urmeneta", nombre: "Ciudad Matta (Deisa)", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Ciudad España (Deisa)", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Sueña Lira (Deisa)", comuna: "Santiago", pct: 3.5, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Seminario 775 (Santolaya)", comuna: "Ñuñoa", pct: 3.0, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Sueña Lincoyan (Deisa)", comuna: "Ñuñoa", pct: 3.5, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Barrio Cueto (Santolaya)", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Urmeneta", nombre: "Ciudad Cerrillos (Deisa)", comuna: "Cerrillos", pct: 3.5, hito: "promesa" },
  // OHC
  { inmob: "OHC", nombre: "Casa Bustamante", comuna: "Ñuñoa", pct: 3.0, hito: "escritura" },
  { inmob: "OHC", nombre: "Mirador Casona", comuna: "La Florida", pct: 3.0, hito: "escritura" },
  { inmob: "OHC", nombre: "Claudio Gay", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  // Grupo Araucana
  { inmob: "Grupo Araucana", nombre: "Miraflores", comuna: "Macul", pct: 4.0, hito: "escritura" },
  { inmob: "Grupo Araucana", nombre: "Aires de Marañon", comuna: "Viña del Mar", pct: 4.0, hito: "promesa" },
  { inmob: "Grupo Araucana", nombre: "Las Brisas de Macul", comuna: "Macul", pct: 4.0, hito: "escritura" },
  // Contempla
  { inmob: "Contempla", nombre: "Byte Ñuñoa", comuna: "Ñuñoa", pct: 3.0, hito: "escritura" },
  // SSilva
  { inmob: "SSilva", nombre: "Limit", comuna: "Macul", pct: 3.0, hito: "promesa" },
  // Torina
  { inmob: "Torina", nombre: "Rosas Brasil", comuna: "Santiago", pct: 3.5, hito: "promesa" },
  // Simonetti
  { inmob: "Simonetti", nombre: "San Pablo", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "Simonetti", nombre: "Froilan Lagos", comuna: "La Florida", pct: 3.0, hito: "promesa" },
  { inmob: "Simonetti", nombre: "Mirador Azul", comuna: "La Florida", pct: 3.0, hito: "escritura" },
  // Copahue
  { inmob: "Copahue", nombre: "Las Condes 7520", comuna: "Las Condes", pct: 3.0, hito: "escritura" },
  { inmob: "Copahue", nombre: "Macul Oriente 2", comuna: "Macul", pct: 3.0, hito: "mixto" },
  { inmob: "Copahue", nombre: "Los Barbechos", comuna: "Las Condes", pct: 3.0, hito: "mixto" },
  { inmob: "Copahue", nombre: "Brava", comuna: "Concón", pct: 3.0, hito: "mixto" },
  { inmob: "Copahue", nombre: "Macul Oriente 1", comuna: "Macul", pct: 3.0, hito: "mixto" },
  { inmob: "Copahue", nombre: "Hipódromo 1613", comuna: "Independencia", pct: 3.0, hito: "mixto" },
  { inmob: "Copahue", nombre: "Parque Jardín", comuna: "Ñuñoa", pct: 3.0, hito: "escritura" },
  { inmob: "Copahue", nombre: "Campus 80", comuna: "Ñuñoa", pct: 3.0, hito: "escritura" },
  // AJ Urbana
  { inmob: "AJ Urbana", nombre: "Teatinos 750", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  { inmob: "AJ Urbana", nombre: "Vista Amunategui", comuna: "Santiago", pct: 3.0, hito: "promesa" },
  // Lucval
  { inmob: "Lucval", nombre: "Puerta la Florida", comuna: "La Florida", pct: 3.5, hito: "promesa" },
  // Fundamenta
  { inmob: "Fundamenta", nombre: "Eco Egaña", comuna: "Ñuñoa", pct: 3.5, hito: "promesa" },
  { inmob: "Fundamenta", nombre: "Eco Espacios", comuna: "Santiago", pct: 3.5, hito: "promesa" },
  { inmob: "Fundamenta", nombre: "Eco Valdes I", comuna: "La Florida", pct: 3.5, hito: "promesa" },
  { inmob: "Fundamenta", nombre: "Eco Valdes II", comuna: "La Florida", pct: 3.5, hito: "promesa" },
  { inmob: "Fundamenta", nombre: "Eco Quilín I", comuna: "Macul", pct: 3.5, hito: "promesa" },
  { inmob: "Fundamenta", nombre: "Eco Quilín II", comuna: "Macul", pct: 3.5, hito: "promesa" },
  // Sur Profundo
  { inmob: "Sur Profundo", nombre: "San Andres Park", comuna: "Cerrillos", pct: 3.0, hito: "promesa" },
];

// ── Supabase helpers ───────────────────────────────────────────
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

// ── Styles ─────────────────────────────────────────────────────
const S = {
  card: { background: P.white, borderRadius: 16, border: `1px solid ${P.border}`, padding: "16px 20px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  metricCard: (bg) => ({ background: bg, borderRadius: 16, padding: "16px 20px", flex: 1 }),
  inp: { width: "100%", marginBottom: 12, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${P.border}`, background: P.sand, color: P.text, fontSize: 14, boxSizing: "border-box", outline: "none" },
  btnPrimary: { padding: "12px 24px", borderRadius: 50, border: "none", background: P.lavenderDark, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, letterSpacing: 0.3 },
  btnGhost: { padding: "10px 20px", borderRadius: 50, border: `1.5px solid ${P.border}`, background: "transparent", color: P.textMuted, fontWeight: 500, cursor: "pointer", fontSize: 14 },
  btnSmall: (color) => ({ padding: "5px 14px", borderRadius: 50, border: `1.5px solid ${color}`, background: "transparent", color, fontWeight: 500, cursor: "pointer", fontSize: 12 }),
  badge: (bg, color) => ({ background: bg, color, fontSize: 11, padding: "3px 10px", borderRadius: 50, fontWeight: 600, display: "inline-block" }),
  label: { fontSize: 12, color: P.textMuted, marginBottom: 4, display: "block" },
  navBtn: (active) => ({ padding: "9px 18px", borderRadius: 50, border: "none", background: active ? P.lavenderDark : "transparent", color: active ? "#fff" : P.textMuted, fontWeight: 600, cursor: "pointer", fontSize: 13 }),
};

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
  const [seeded, setSeeded] = useState(false);
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

  // Seed inmobiliarias + proyectos si no existen
  useEffect(() => {
    if (!loading && inmobiliarias.length === 0 && !seeded) {
      setSeeded(true);
      (async () => {
        try {
          const inms = await db("inmobiliarias", "POST", INMOBILIARIAS_BASE);
          const inmMap = {};
          inms.forEach(i => { inmMap[i.nombre] = i.id; });
          const proyBody = PROYECTOS_BASE.map(p => ({
            nombre: p.nombre, comuna: p.comuna,
            inmobiliaria_id: inmMap[p.inmob],
            porcentaje_zaror: p.pct, hito_pago: p.hito,
          }));
          await db("proyectos", "POST", proyBody);
          await load();
        } catch(e) { console.error("Seed error", e); }
      })();
    }
  }, [loading, inmobiliarias.length, seeded]);

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
        pagos.push({ tipo: "comprometido", monto: com / 2, fecha: addDays(prop.fecha_promesa, 30), label: "Promesa (1.5%)" });
        pagos.push({ tipo: "comprometido_escritura", monto: com / 2, fecha: addDays(prop.fecha_escritura, 0), label: "Escritura (1.5%)" });
      } else if (proy.hito_pago === "escritura") {
        pagos.push({ tipo: "comprometido_escritura", monto: com, fecha: addDays(prop.fecha_escritura, 0), label: "Escritura" });
      } else {
        pagos.push({ tipo: "comprometido", monto: com, fecha: addDays(prop.fecha_promesa, 30), label: "Promesa" });
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
        if (pago.tipo === "pagado") meses[idx].pagado += pago.monto;
        else if (pago.tipo.startsWith("comprometido")) meses[idx].comprometido += pago.monto;
        else if (pago.tipo === "forecast") meses[idx].forecast += pago.monto;
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
    setModal(tipo); setForm({ ...obj });
  };
  const closeModal = () => { setModal(null); setForm({}); };
  const ff = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
    } catch(e) { alert("Error al guardar"); }
    setSaving(false);
  };

  const saveCliente = async () => {
    setSaving(true);
    const body = { nombre: form.nombre, tipo: form.tipo || "lead" };
    try {
      if (form.id) await db(`clientes?id=eq.${form.id}`, "PATCH", body);
      else await db("clientes", "POST", body);
      await load(); closeModal();
    } catch(e) { alert("Error"); }
    setSaving(false);
  };

  const deletePropiedad = async id => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    await db(`propiedades?id=eq.${id}`, "DELETE");
    await load();
  };

  const proyectoSeleccionado = proyectoById(form.proyecto_id);

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
    } catch(e) { alert("Error"); }
    setSaving(false);
  };

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
      <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: P.lavenderDark, letterSpacing: -0.3 }}>mis comisiones ✦</div>
          <button onClick={() => { setUfInput(String(ufHoy)); setEditUF(true); }} style={{ fontSize: 12, color: P.lavenderDark, fontWeight: 600, background: P.lavender, border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", marginTop: 2 }}>
            UF: ${fmt(ufHoy)} ✎
          </button>
        </div>
        <nav style={{ display: "flex", gap: 6, background: P.lavender, borderRadius: 50, padding: 4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setVista(n.id)} style={S.navBtn(vista === n.id)}>{n.label}</button>
          ))}
        </nav>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* DASHBOARD */}
        {vista === "dashboard" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={S.metricCard(P.mint)}>
                <div style={{ fontSize: 11, color: P.mintDark, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Cobrado</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: P.mintDark }}>{fmtUF(tots.cobrado)} UF</div>
                <div style={{ fontSize: 12, color: P.mintDark, opacity: 0.7 }}>${fmt(tots.cobrado * ufHoy)}</div>
              </div>
              <div style={S.metricCard(P.sky)}>
                <div style={{ fontSize: 11, color: P.skyDark, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Por cobrar</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: P.skyDark }}>{fmtUF(tots.pendiente)} UF</div>
                <div style={{ fontSize: 12, color: P.skyDark, opacity: 0.7 }}>${fmt(tots.pendiente * ufHoy)}</div>
              </div>
              <div style={S.metricCard(P.peach)}>
                <div style={{ fontSize: 11, color: P.peachDark, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Forecast</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: P.peachDark }}>{fmtUF(tots.forecast)} UF</div>
                <div style={{ fontSize: 12, color: P.peachDark, opacity: 0.7 }}>${fmt(tots.forecast * ufHoy)}</div>
              </div>
            </div>

            <div style={{ ...S.card, padding: "20px 20px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 4 }}>Proyección mensual</div>
              <div style={{ display: "flex", gap: 14, marginBottom: 16, fontSize: 11 }}>
                {[["Pagado", P.mintDark, P.mint], ["Comprometido", P.skyDark, P.sky], ["Forecast", P.peachDark, P.peach]].map(([l, c, bg]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, color: c }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `2px solid ${c}`, display: "inline-block" }}></span>
                    <span style={{ fontWeight: 600 }}>{l}</span>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 140 }}>
                {meses.map((m, i) => {
                  const total = m.pagado + m.comprometido + m.forecast;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ fontSize: 9, color: P.textMuted, textAlign: "center" }}>{total > 0 ? fmtUF(total) : ""}</div>
                      <div style={{ width: "100%", height: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        <div style={{ display: "flex", flexDirection: "column", borderRadius: "6px 6px 0 0", overflow: "hidden" }}>
                          {m.forecast > 0 && <div style={{ height: Math.max((m.forecast / maxBar) * 100, 3), background: P.peach, border: `1px solid ${P.peachDark}` }}></div>}
                          {m.comprometido > 0 && <div style={{ height: Math.max((m.comprometido / maxBar) * 100, 3), background: P.sky, border: `1px solid ${P.skyDark}` }}></div>}
                          {m.pagado > 0 && <div style={{ height: Math.max((m.pagado / maxBar) * 100, 3), background: P.mint, border: `1px solid ${P.mintDark}` }}></div>}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: P.textMuted, textAlign: "center", lineHeight: 1.3 }}>{MESES[m.month]}<br /><span style={{ fontSize: 9 }}>{String(m.year).slice(2)}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {propiedades.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px", color: P.textMuted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏠</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Aún no hay propiedades</div>
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
            {propiedades.length === 0 && <div style={{ color: P.textMuted, fontSize: 14, textAlign: "center", padding: 32 }}>Sin propiedades aún.</div>}
            {propiedades.map(prop => {
              const proy = proyectoById(prop.proyecto_id);
              const cli = clienteById(prop.cliente_id);
              const com = comisionTotal(prop);
              const sc = STATUS_CFG[prop.estado] || STATUS_CFG.reserva;
              const hc = proy ? HITO_CFG[proy.hito_pago] : null;
              return (
                <div key={prop.id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{cli?.nombre || "Sin cliente"}</div>
                      <div style={{ fontSize: 12, color: P.textMuted, marginTop: 2 }}>{proy?.nombre} · {proy?.comuna}</div>
                    </div>
                    <span style={S.badge(sc.bg, sc.color)}>{sc.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
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
                  {prop.estado === "reserva" && prop.mes_forecast && (
                    <div style={{ fontSize: 12, color: P.textMuted }}>Forecast: {prop.mes_forecast} · {prop.prob_forecast}% prob.</div>
                  )}
                  {(prop.estado === "promesa" || prop.estado === "pagado") && prop.fecha_promesa && (
                    <div style={{ fontSize: 12, color: P.textMuted }}>Promesa: {new Date(prop.fecha_promesa + "T12:00:00").toLocaleDateString("es-CL")}</div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button style={S.btnSmall(P.lavenderDark)} onClick={() => openModal("propiedad", { ...prop })}>Editar</button>
                    <button style={S.btnSmall(P.roseDark)} onClick={() => deletePropiedad(prop.id)}>Eliminar</button>
                  </div>
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
                  <div style={{ fontSize: 12, fontWeight: 700, color: P.lavenderDark, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 4 }}>{inm.nombre}</div>
                  {proys.map(p => (
                    <div key={p.id} style={{ ...S.card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                          <span style={S.badge(P.lavender, P.lavenderDark)}>{p.porcentaje_zaror}% Zaror</span>
                          <span style={S.badge(P.sand, P.textMuted)}>{HITO_CFG[p.hito_pago]?.label}</span>
                        </div>
                      </div>
                      <button style={S.btnSmall(P.lavenderDark)} onClick={() => openModal("proyecto", { ...p, inmobiliaria_id: p.inmobiliaria_id })}>Editar</button>
                    </div>
                  ))}
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
            {clientes.length === 0 && <div style={{ color: P.textMuted, fontSize: 14, textAlign: "center", padding: 32 }}>Sin clientes aún.</div>}
            {clientes.map(c => {
              const props = propiedades.filter(p => p.cliente_id === c.id);
              const total = props.reduce((s, p) => s + comisionTotal(p), 0);
              return (
                <div key={c.id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: P.textMuted, marginTop: 2 }}>{props.length} propiedad{props.length !== 1 ? "es" : ""} · {fmtUF(total)} UF total</div>
                    </div>
                    <span style={S.badge(c.tipo === "referido" ? P.sky : P.mint, c.tipo === "referido" ? P.skyDark : P.mintDark)}>
                      {c.tipo === "referido" ? "Referido 50%" : "Lead 30%"}
                    </span>
                  </div>
                  <button style={{ ...S.btnSmall(P.lavenderDark), marginTop: 12 }} onClick={() => openModal("cliente", { ...c })}>Editar</button>
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
            <input
              autoFocus
              type="number"
              value={ufInput}
              onChange={e => setUfInput(e.target.value)}
              placeholder="Ej: 38500"
              style={{ ...S.inp, fontSize: 18, fontWeight: 600, textAlign: "center" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={{ ...S.btnPrimary, flex: 1 }} onClick={() => { const v = parseFloat(ufInput); if (v > 1000) setUfHoy(v); setEditUF(false); }}>Guardar</button>
              <button style={S.btnGhost} onClick={() => setEditUF(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(80,60,120,0.25)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)" }}>
          <div style={{ background: P.white, borderRadius: "24px 24px 0 0", padding: "28px 24px 36px", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -4px 32px rgba(0,0,0,0.12)" }}>
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
                    <label style={S.label}>Fecha estimada escritura (para 2do pago 1.5%)</label>
                    <input type="date" style={S.inp} value={form.fecha_escritura || ""} onChange={e => ff("fecha_escritura", e.target.value)} />
                  </>
                )}
                {form.estado === "reserva" && (
                  <>
                    <label style={S.label}>Mes estimado de conversión</label>
                    <input type="month" style={S.inp} value={form.mes_forecast || ""} onChange={e => ff("mes_forecast", e.target.value)} />
                    <label style={S.label}>Probabilidad de cierre: <strong>{form.prob_forecast || 50}%</strong></label>
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
                      {fmtUF(parseFloat(form.uf || 0) * (proyectoSeleccionado.porcentaje_zaror / 100) * (pctJosefa(form.cliente_id) / 100))} UF
                    </div>
                    <div style={{ fontSize: 12, color: P.lavenderDark, opacity: 0.75 }}>
                      ${fmt(parseFloat(form.uf || 0) * (proyectoSeleccionado.porcentaje_zaror / 100) * (pctJosefa(form.cliente_id) / 100) * ufHoy)}
                    </div>
                  </div>
                )}
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
                  {[2, 2.5, 3, 3.5, 4].map(v => (
                    <button key={v} onClick={() => ff("porcentaje_zaror", v)} style={{ padding: "7px 16px", borderRadius: 50, border: `1.5px solid ${(parseFloat(form.porcentaje_zaror) || 3) === v ? P.lavenderDark : P.border}`, background: (parseFloat(form.porcentaje_zaror) || 3) === v ? P.lavender : "transparent", color: (parseFloat(form.porcentaje_zaror) || 3) === v ? P.lavenderDark : P.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{v}%</button>
                  ))}
                </div>
                <label style={S.label}>Condición de pago</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {[["promesa","A la promesa","Pago al firmar la promesa"], ["escritura","A la escritura","Pago al firmar la escritura"], ["mixto","1.5% promesa + 1.5% escritura","Pago dividido en dos hitos"]].map(([val, label, desc]) => (
                    <button key={val} onClick={() => ff("hito_pago", val)} style={{ padding: "12px 16px", borderRadius: 14, border: `2px solid ${(form.hito_pago || "promesa") === val ? P.lavenderDark : P.border}`, background: (form.hito_pago || "promesa") === val ? P.lavender : "transparent", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ fontWeight: 700, color: (form.hito_pago || "promesa") === val ? P.lavenderDark : P.text, fontSize: 13 }}>{label}</div>
                      <div style={{ fontSize: 11, color: P.textMuted, marginTop: 2 }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {modal === "cliente" && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{form.id ? "Editar" : "Nuevo"} cliente</div>
                <label style={S.label}>Nombre completo</label>
                <input placeholder="Ej: María González" style={S.inp} value={form.nombre || ""} onChange={e => ff("nombre", e.target.value)} />
                <label style={S.label}>Tipo de cliente</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  {[["lead", "Lead", "30%", P.mint, P.mintDark], ["referido", "Referido", "50%", P.sky, P.skyDark]].map(([val, label, pct, bg, color]) => (
                    <button key={val} onClick={() => ff("tipo", val)} style={{ flex: 1, padding: "14px", borderRadius: 14, border: `2px solid ${(form.tipo || "lead") === val ? color : P.border}`, background: (form.tipo || "lead") === val ? bg : "transparent", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 12, color, opacity: 0.8 }}>Josefa gana {pct}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btnPrimary, flex: 1, opacity: saving ? 0.6 : 1 }} disabled={saving}               onClick={modal === "propiedad" ? savePropiedad : modal === "cliente" ? saveCliente : saveProyecto}>
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
