import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jjsdjqhhlgwxhhjufpih.supabase.co";
const SUPABASE_KEY = "sb_publishable_t9Zft3LoUQ512V95sRMDqw_ojRQXnPB";
const UF_FALLBACK = 40000;
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const P = {
  lavender:"#EDE9F8", lavenderDark:"#7C6FC4",
  rose:"#FDEDF2", roseDark:"#C2547A",
  mint:"#E6F5F0", mintDark:"#2E8B6A",
  peach:"#FEF0E7", peachDark:"#C46A2E",
  sky:"#E8F4FD", skyDark:"#2A7AB8",
  sand:"#FAF7F0", text:"#2D2D2D", textMuted:"#8A8A8A",
  border:"rgba(0,0,0,0.08)", white:"#FFFFFF", bg:"#F7F5FF",
};

const STATUS = {
  reserva:{ bg:P.peach, color:P.peachDark, label:"Reserva" },
  promesa:{ bg:P.sky,   color:P.skyDark,   label:"Promesa" },
  pagado: { bg:P.mint,  color:P.mintDark,  label:"Pagado"  },
};

const HITO = {
  promesa:  { label:"A la promesa",   color:P.skyDark },
  escritura:{ label:"A la escritura", color:P.lavenderDark },
  mixto:    { label:"1.5% + 1.5%",   color:P.peachDark },
};

const cardStyle = { background:"#fff", borderRadius:16, border:"1px solid rgba(0,0,0,0.08)", padding:"16px 20px", marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" };
const inpStyle  = { width:"100%", marginBottom:12, padding:"11px 14px", borderRadius:12, border:"1.5px solid rgba(0,0,0,0.08)", background:P.sand, color:P.text, fontSize:14, boxSizing:"border-box", outline:"none" };
const btnP      = { padding:"12px 24px", borderRadius:50, border:"none", background:P.lavenderDark, color:"#fff", fontWeight:600, cursor:"pointer", fontSize:14 };
const btnG      = { padding:"10px 20px", borderRadius:50, border:"1.5px solid rgba(0,0,0,0.08)", background:"transparent", color:P.textMuted, fontWeight:500, cursor:"pointer", fontSize:14 };
const btnS      = (c) => ({ padding:"5px 14px", borderRadius:50, border:"1.5px solid "+c, background:"transparent", color:c, fontWeight:500, cursor:"pointer", fontSize:12 });
const badge     = (bg,c) => ({ background:bg, color:c, fontSize:11, padding:"3px 10px", borderRadius:50, fontWeight:600, display:"inline-block" });
const navBtn    = (a) => ({ padding:"9px 18px", borderRadius:50, border:"none", background:a?P.lavenderDark:"transparent", color:a?"#fff":P.textMuted, fontWeight:600, cursor:"pointer", fontSize:13 });
const lbl       = { fontSize:12, color:P.textMuted, marginBottom:4, display:"block" };

const db = async (path, method="GET", body) => {
  const res = await fetch(SUPABASE_URL+"/rest/v1/"+path, {
    method,
    headers:{ apikey:SUPABASE_KEY, Authorization:"Bearer "+SUPABASE_KEY, "Content-Type":"application/json", Prefer: method==="POST"?"return=representation":method==="PATCH"?"return=representation":"" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  if (method==="DELETE") return null;
  const t = await res.text();
  return t ? JSON.parse(t) : null;
};

function MiniModal({ me, setMe, confirm, proyectoById }) {
  const [fecha, setFecha] = useState("");
  const [mes, setMes] = useState("");
  const [prob, setProb] = useState(50);
  const [fechaEsc, setFechaEsc] = useState("");
  const [fechaTent, setFechaTent] = useState("");
  const { prop, tipo } = me;
  const proy = proyectoById(prop.proyecto_id);
  const esMixto = proy?.hito_pago === "mixto";

  const guardar = () => {
    if (tipo==="reserva") confirm({ mes_forecast:mes, prob_forecast:prob, fecha_promesa:fechaTent||null });
    else if (tipo==="promesa") confirm({ fecha_promesa:fecha, fecha_escritura:esMixto?fechaEsc:null, mes_forecast:null });
    else confirm({ fecha_promesa:fecha, mes_forecast:null });
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(80,60,120,0.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:250, backdropFilter:"blur(2px)" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:24, width:320, boxShadow:"0 4px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>
          {tipo==="reserva"?"🔖 Reserva":tipo==="promesa"?"📋 Promesa firmada":"✅ Pagado"}
        </div>
        <div style={{ fontSize:12, color:P.textMuted, marginBottom:16 }}>{prop.uf} UF · {proy?.nombre}</div>
        {tipo==="reserva" && (
          <>
            <span style={lbl}>Mes estimado de conversión</span>
            <input type="month" style={inpStyle} value={mes} onChange={e=>setMes(e.target.value)} />
            <span style={lbl}>Fecha tentativa firma promesa (opcional)</span>
            <input type="date" style={inpStyle} value={fechaTent} onChange={e=>setFechaTent(e.target.value)} />
            <span style={lbl}>{"Probabilidad: "+prob+"%"}</span>
            <input type="range" min={10} max={100} step={10} value={prob} onChange={e=>setProb(parseInt(e.target.value))} style={{ width:"100%", marginBottom:16, accentColor:P.peachDark }} />
          </>
        )}
        {(tipo==="promesa"||tipo==="pagado") && (
          <>
            <span style={lbl}>Fecha de firma promesa</span>
            <input type="date" style={inpStyle} value={fecha} onChange={e=>setFecha(e.target.value)} />
          </>
        )}
        {tipo==="promesa" && esMixto && (
          <>
            <span style={lbl}>Fecha estimada escritura (2do pago)</span>
            <input type="date" style={inpStyle} value={fechaEsc} onChange={e=>setFechaEsc(e.target.value)} />
          </>
        )}
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ ...btnP, flex:1 }} onClick={guardar}>Confirmar</button>
          <button style={btnG} onClick={()=>setMe(null)}>Cancelar</button>
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
  const [miniModal, setMiniModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inm,proy,cli,prop] = await Promise.all([
        db("inmobiliarias?select=*&order=nombre"),
        db("proyectos?select=*&order=nombre"),
        db("clientes?select=*&order=created_at"),
        db("propiedades?select=*&order=created_at"),
      ]);
      setInmobiliarias(inm||[]);
      setProyectos(proy||[]);
      setClientes(cli||[]);
      setPropiedades(prop||[]);
    } catch(e){ console.error(e); }
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); },[]);

  const fmt    = n => Math.round(n).toLocaleString("es-CL");
  const fmtUF  = n => Number(n).toFixed(2);
  const proyById = id => proyectos.find(p=>p.id===id);
  const inmById  = id => inmobiliarias.find(i=>i.id===id);
  const cliById  = id => clientes.find(c=>c.id===id);
  const pctJ     = cid => cliById(cid)?.tipo==="referido"?50:30;

  const comision = prop => {
    const p = proyById(prop.proyecto_id);
    if (!p) return 0;
    return prop.uf * (p.porcentaje_zaror/100) * (pctJ(prop.cliente_id)/100);
  };

  const addDays = (s,d) => {
    if (!s) return null;
    const dt = new Date(s+"T12:00:00");
    dt.setDate(dt.getDate()+d);
    return dt;
  };

  const pagos = prop => {
    const p = proyById(prop.proyecto_id);
    if (!p) return [];
    const com = comision(prop);
    if (prop.estado==="pagado") return [{ tipo:"pagado", monto:com, fecha:addDays(prop.fecha_promesa,30) }];
    if (prop.estado==="promesa") {
      if (p.hito_pago==="mixto") return [
        { tipo:"comprometido", monto:com/2, fecha:addDays(prop.fecha_promesa,30) },
        { tipo:"comprometido", monto:com/2, fecha:addDays(prop.fecha_escritura,0) },
      ];
      if (p.hito_pago==="escritura") return [{ tipo:"comprometido", monto:com, fecha:addDays(prop.fecha_escritura,0) }];
      return [{ tipo:"comprometido", monto:com, fecha:addDays(prop.fecha_promesa,30) }];
    }
    if (prop.estado==="reserva"&&prop.mes_forecast&&prop.prob_forecast) {
      const [y,m] = prop.mes_forecast.split("-");
      const dt = new Date(parseInt(y),parseInt(m)-1,15);
      dt.setDate(dt.getDate()+30);
      return [{ tipo:"forecast", monto:com*(prop.prob_forecast/100), fecha:dt }];
    }
    return [];
  };

  const proyeccionMeses = () => {
    const hoy = new Date();
    const ms = Array.from({length:6},(_,i)=>{
      const d = new Date(hoy.getFullYear(),hoy.getMonth()+i,1);
      return { year:d.getFullYear(), month:d.getMonth(), pagado:0, comprometido:0, forecast:0 };
    });
    propiedades.forEach(prop=>{
      pagos(prop).forEach(pg=>{
        if (!pg.fecha) return;
        const idx = ms.findIndex(m=>m.year===pg.fecha.getFullYear()&&m.month===pg.fecha.getMonth());
        if (idx>=0) ms[idx][pg.tipo]+=pg.monto;
      });
    });
    return ms;
  };

  const totales = () => {
    let pen=0,cob=0,for_=0;
    propiedades.forEach(p=>{
      const c=comision(p);
      if (p.estado==="pagado") cob+=c;
      else if (p.estado==="promesa") pen+=c;
      else if (p.estado==="reserva"&&p.prob_forecast) for_+=c*(p.prob_forecast/100);
    });
    return { pendiente:pen, cobrado:cob, forecast:for_ };
  };

  const meses  = proyeccionMeses();
  const tots   = totales();
  const maxBar = Math.max(...meses.map(m=>m.pagado+m.comprometido+m.forecast),1);

  const openModal = (tipo,obj={}) => {
    if (tipo==="propiedad"&&obj.proyecto_id) {
      const p = proyById(obj.proyecto_id);
      obj._inmob = p?.inmobiliaria_id||"";
    }
    setModal(tipo); setForm({...obj});
  };
  const closeModal = () => { setModal(null); setForm({}); };
  const ff = (k,v) => setForm(f=>({...f,[k]:v}));

  const cambiarEstado = (prop,nuevoEstado) => {
    if (nuevoEstado===prop.estado) return;
    setMiniModal({ prop, tipo:nuevoEstado });
  };

  const confirmarEstado = async (extra={}) => {
    const { prop } = miniModal;
    await db("propiedades?id=eq."+prop.id,"PATCH",{ estado:miniModal.tipo, ...extra });
    setMiniModal(null);
    await load();
  };

  const cambiarProb = (prop,val) => setPropiedades(ps=>ps.map(p=>p.id===prop.id?{...p,prob_forecast:val}:p));
  const guardarProb = async (prop,val) => { await db("propiedades?id=eq."+prop.id,"PATCH",{prob_forecast:val}); };

  const savePropiedad = async () => {
    setSaving(true);
    const p = proyById(form.proyecto_id);
    const body = {
      cliente_id:form.cliente_id, proyecto_id:form.proyecto_id,
      uf:parseFloat(form.uf)||0, estado:form.estado||"reserva",
      fecha_promesa:(form.estado==="promesa"||form.estado==="pagado")?form.fecha_promesa:null,
      fecha_escritura:(form.estado==="promesa"&&p?.hito_pago==="mixto")?form.fecha_escritura:null,
      mes_forecast:form.estado==="reserva"?form.mes_forecast:null,
      prob_forecast:form.estado==="reserva"?parseInt(form.prob_forecast)||50:null,
    };
    try {
      if (form.id) await db("propiedades?id=eq."+form.id,"PATCH",body);
      else await db("propiedades","POST",body);
      await load(); closeModal();
    } catch(e){ alert("Error: "+e.message); }
    setSaving(false);
  };

  const saveCliente = async () => {
    setSaving(true);
    const body = { nombre:form.nombre, tipo:form.tipo||"lead" };
    try {
      if (form.id) await db("clientes?id=eq."+form.id,"PATCH",body);
      else await db("clientes","POST",body);
      await load(); closeModal();
    } catch(e){ alert("Error"); }
    setSaving(false);
  };

  const saveProyecto = async () => {
    setSaving(true);
    const body = { nombre:form.nombre, inmobiliaria_id:form.inmobiliaria_id, porcentaje_zaror:parseFloat(form.porcentaje_zaror)||3, hito_pago:form.hito_pago||"promesa" };
    try {
      if (form.id) await db("proyectos?id=eq."+form.id,"PATCH",body);
      else await db("proyectos","POST",body);
      await load(); closeModal();
    } catch(e){ alert("Error"); }
    setSaving(false);
  };

  const deleteProp = async id => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    await db("propiedades?id=eq."+id,"DELETE");
    await load();
  };

  const proySel = proyById(form.proyecto_id);
  const navs = [
    {id:"dashboard",label:"Inicio"},
    {id:"propiedades",label:"Propiedades"},
    {id:"clientes",label:"Clientes"},
    {id:"proyectos",label:"Proyectos"},
  ];

  if (loading) return (
    <div style={{ padding:60, textAlign:"center", fontFamily:"system-ui", color:P.textMuted }}>
      <div style={{ fontSize:32, marginBottom:12 }}>✦</div>
      <div style={{ fontSize:14 }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:P.bg, minHeight:"100vh", color:P.text }}>

      {/* HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid rgba(0,0,0,0.08)", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:P.lavenderDark }}>mis comisiones ✦</div>
          <button onClick={()=>{ setUfInput(String(ufHoy)); setEditUF(true); }} style={{ fontSize:12, color:P.lavenderDark, fontWeight:600, background:P.lavender, border:"none", borderRadius:8, padding:"3px 8px", cursor:"pointer", marginTop:2 }}>
            {"UF: $"+fmt(ufHoy)+" ✎"}
          </button>
        </div>
        <nav style={{ display:"flex", gap:4, background:P.lavender, borderRadius:50, padding:4 }}>
          {navs.map(n=>(
            <button key={n.id} onClick={()=>setVista(n.id)} style={navBtn(vista===n.id)}>{n.label}</button>
          ))}
        </nav>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 60px" }}>

        {/* DASHBOARD */}
        {vista==="dashboard" && (
          <>
            {/* Banner motivacional */}
            {(()=>{
              const total = tots.pendiente+tots.cobrado+tots.forecast;
              const msg = total===0?"¡Vamos Josefa! 🚀":tots.cobrado>0?"¡Estás on fire, Josefa! 🔥":"¡Vas con todo, Josefa! 💪";
              const sub = total===0?"Cada gran pipeline empieza con una primera venta."
                :tots.cobrado>0?"Ya tienes "+fmtUF(tots.cobrado)+" UF cobradas. ¡Sigue así!"
                :"Tienes "+fmtUF(tots.pendiente)+" UF comprometidas. ¡El pago viene!";
              return (
                <div style={{ background:"linear-gradient(135deg,#7C6FC4,#C2547A)", borderRadius:20, padding:"20px 24px", marginBottom:20, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", right:-10, top:-10, fontSize:80, opacity:0.15, transform:"rotate(15deg)" }}>🏠</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>
                    {new Date().toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})}
                  </div>
                  <div style={{ fontSize:22, fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:6 }}>{msg}</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.85)", marginBottom:propiedades.length>0?14:0 }}>{sub}</div>
                  {propiedades.length>0 && (
                    <div style={{ display:"flex", gap:8 }}>
                      {[["reserva","Reservas"],["promesa","Promesas"],["pagado","Pagadas"]].map(([est,lbl_])=>(
                        <div key={est} style={{ background:"rgba(255,255,255,0.2)", borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                          <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{propiedades.filter(p=>p.estado===est).length}</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)" }}>{lbl_}</div>
                        </div>
                      ))}
                      <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:10, padding:"8px 14px", textAlign:"center", flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{fmtUF(tots.cobrado+tots.pendiente)} UF</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)" }}>Pipeline total</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Métricas */}
            <div style={{ display:"flex", gap:10, marginBottom:20 }}>
              {[
                {label:"Cobrado",    val:tots.cobrado,   bg:P.mint,  color:P.mintDark},
                {label:"Por cobrar", val:tots.pendiente, bg:P.sky,   color:P.skyDark},
                {label:"Forecast",   val:tots.forecast,  bg:P.peach, color:P.peachDark},
              ].map(c=>(
                <div key={c.label} style={{ background:c.bg, borderRadius:16, padding:"16px 20px", flex:1 }}>
                  <div style={{ fontSize:11, color:c.color, fontWeight:600, marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>{c.label}</div>
                  <div style={{ fontSize:20, fontWeight:700, color:c.color }}>{fmtUF(c.val)} UF</div>
                  <div style={{ fontSize:13, color:c.color, opacity:0.85, marginTop:2 }}>{"$"+fmt(c.val*ufHoy)}</div>
                </div>
              ))}
            </div>

            {/* Gráfico */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid rgba(0,0,0,0.08)", padding:20, marginBottom:20, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Proyección 6 meses</div>
              <div style={{ display:"flex", gap:10, marginBottom:12, fontSize:11 }}>
                {[["Pagado",P.mintDark,P.mint],["Comprometido",P.skyDark,P.sky],["Forecast",P.peachDark,P.peach]].map(([l,c,bg])=>(
                  <span key={l} style={{ display:"flex", alignItems:"center", gap:4, color:c, fontWeight:600 }}>
                    <span style={{ width:10, height:10, borderRadius:2, background:bg, border:"2px solid "+c, display:"inline-block" }}></span>{l}
                  </span>
                ))}
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:220 }}>
                {meses.map((m,i)=>{
                  const total = m.pagado+m.comprometido+m.forecast;
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                      {total>0 && (
                        <div style={{ fontSize:9, color:P.textMuted, textAlign:"center", lineHeight:1.5 }}>
                          <div style={{ fontWeight:700 }}>{fmtUF(total)} UF</div>
                          <div>{"$"+fmt(total*ufHoy)}</div>
                        </div>
                      )}
                      <div style={{ width:"100%", height:150, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                        <div style={{ display:"flex", flexDirection:"column", borderRadius:"5px 5px 0 0", overflow:"hidden" }}>
                          {m.forecast>0    && <div style={{ height:Math.max((m.forecast/maxBar)*150,3),    background:P.peach, border:"1px solid "+P.peachDark }}></div>}
                          {m.comprometido>0 && <div style={{ height:Math.max((m.comprometido/maxBar)*150,3), background:P.sky,   border:"1px solid "+P.skyDark }}></div>}
                          {m.pagado>0      && <div style={{ height:Math.max((m.pagado/maxBar)*150,3),      background:P.mint,  border:"1px solid "+P.mintDark }}></div>}
                        </div>
                      </div>
                      <div style={{ fontSize:10, color:P.textMuted, textAlign:"center", lineHeight:1.3 }}>{MESES[m.month]}<br />{String(m.year).slice(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {propiedades.length===0 && (
              <div style={{ textAlign:"center", padding:32, color:P.textMuted }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🏠</div>
                <div style={{ fontWeight:600 }}>Aún no hay propiedades</div>
                <div style={{ fontSize:13 }}>Ve a Propiedades y agrega tu primera venta</div>
              </div>
            )}
          </>
        )}

        {/* PROPIEDADES */}
        {vista==="propiedades" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700 }}>Propiedades</div>
              <button style={btnP} onClick={()=>openModal("propiedad")}>+ Nueva</button>
            </div>
            {propiedades.length===0 && <div style={{ color:P.textMuted, textAlign:"center", padding:32 }}>Sin propiedades aún.</div>}
            {propiedades.map(prop=>{
              const proy = proyById(prop.proyecto_id);
              const cli  = cliById(prop.cliente_id);
              const com  = comision(prop);
              const sc   = STATUS[prop.estado]||STATUS.reserva;
              const hc   = proy?HITO[proy.hito_pago]:null;
              return (
                <div key={prop.id} style={cardStyle}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>{cli?.nombre||"Sin cliente"}</div>
                      <div style={{ fontSize:12, color:P.textMuted }}>{proy?.nombre}</div>
                    </div>
                    <span style={badge(sc.bg,sc.color)}>{sc.label}</span>
                  </div>

                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                    <span style={badge(P.lavender,P.lavenderDark)}>{prop.uf} UF</span>
                    {proy && <span style={badge(P.sand,P.textMuted)}>{"Zaror "+proy.porcentaje_zaror+"%"}</span>}
                    <span style={badge(P.rose,P.roseDark)}>{"Josefa "+pctJ(prop.cliente_id)+"%"}</span>
                    {hc && <span style={badge("#f5f5f5",hc.color)}>{hc.label}</span>}
                  </div>

                  <div style={{ background:P.lavender, borderRadius:10, padding:"10px 14px", marginBottom:10 }}>
                    <div style={{ fontSize:11, color:P.lavenderDark, fontWeight:600, marginBottom:2 }}>Comisión Josefa</div>
                    <div style={{ fontSize:18, fontWeight:700, color:P.lavenderDark }}>{fmtUF(com)} UF</div>
                    <div style={{ fontSize:13, color:P.lavenderDark, opacity:0.85 }}>{"$"+fmt(com*ufHoy)}</div>
                  </div>

                  {/* Cambio estado rápido */}
                  <div style={{ display:"flex", borderRadius:10, overflow:"hidden", border:"1px solid rgba(0,0,0,0.08)", marginBottom:10 }}>
                    {["reserva","promesa","pagado"].map(e=>{
                      const cfg = STATUS[e];
                      const active = prop.estado===e;
                      return (
                        <button key={e} onClick={()=>cambiarEstado(prop,e)} style={{ flex:1, padding:"7px 4px", border:"none", background:active?cfg.color:"transparent", color:active?"#fff":P.textMuted, fontSize:11, fontWeight:active?700:400, cursor:"pointer" }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Slider probabilidad */}
                  {prop.estado==="reserva" && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:11, color:P.textMuted, marginBottom:4 }}>
                        {"Probabilidad cierre: "}
                        <strong style={{ color:P.peachDark }}>{(prop.prob_forecast||50)+"%"}</strong>
                        {prop.mes_forecast?" · "+prop.mes_forecast:""}
                      </div>
                      <input type="range" min={0} max={100} step={10}
                        value={prop.prob_forecast||50}
                        onChange={e=>cambiarProb(prop,parseInt(e.target.value))}
                        onMouseUp={e=>guardarProb(prop,parseInt(e.target.value))}
                        onTouchEnd={()=>guardarProb(prop,prop.prob_forecast||50)}
                        style={{ width:"100%", accentColor:P.peachDark }}
                      />
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:P.textMuted }}>
                        <span>0%</span><span>50%</span><span>100%</span>
                      </div>
                    </div>
                  )}

                  {(prop.estado==="promesa"||prop.estado==="pagado") && prop.fecha_promesa && (
                    <div style={{ fontSize:12, color:P.textMuted, marginBottom:8 }}>
                      {"Promesa: "+new Date(prop.fecha_promesa+"T12:00:00").toLocaleDateString("es-CL")}
                    </div>
                  )}

                  <div style={{ display:"flex", gap:8 }}>
                    <button style={btnS(P.lavenderDark)} onClick={()=>openModal("propiedad",{...prop})}>✎ Editar</button>
                    <button style={btnS(P.roseDark)} onClick={()=>deleteProp(prop.id)}>✕ Eliminar</button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* CLIENTES */}
        {vista==="clientes" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700 }}>Clientes</div>
              <button style={btnP} onClick={()=>openModal("cliente")}>+ Nuevo</button>
            </div>
            {clientes.length===0 && <div style={{ color:P.textMuted, textAlign:"center", padding:32 }}>Sin clientes aún.</div>}
            {clientes.map(c=>{
              const props = propiedades.filter(p=>p.cliente_id===c.id);
              const total = props.reduce((s,p)=>s+comision(p),0);
              return (
                <div key={c.id} style={cardStyle}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>{c.nombre}</div>
                      <div style={{ fontSize:12, color:P.textMuted, marginTop:2 }}>{props.length+" propiedad"+(props.length!==1?"es":"")+" · "+fmtUF(total)+" UF"}</div>
                    </div>
                    <span style={badge(c.tipo==="referido"?P.sky:P.mint, c.tipo==="referido"?P.skyDark:P.mintDark)}>
                      {c.tipo==="referido"?"Referido 50%":"Lead 30%"}
                    </span>
                  </div>
                  <button style={{ ...btnS(P.lavenderDark), marginTop:12 }} onClick={()=>openModal("cliente",{...c})}>✎ Editar</button>
                </div>
              );
            })}
          </>
        )}

        {/* PROYECTOS */}
        {vista==="proyectos" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700 }}>Proyectos</div>
              <button style={btnP} onClick={()=>openModal("proyecto")}>+ Nuevo</button>
            </div>
            {inmobiliarias.map(inm=>{
              const proys = proyectos.filter(p=>p.inmobiliaria_id===inm.id);
              if (proys.length===0) return null;
              return (
                <div key={inm.id} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:P.lavenderDark, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>{inm.nombre}</div>
                  {proys.map(p=>(
                    <div key={p.id} style={{ ...cardStyle, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{p.nombre}</div>
                        <div style={{ display:"flex", gap:6, marginTop:5 }}>
                          <span style={badge(P.lavender,P.lavenderDark)}>{p.porcentaje_zaror+"% Zaror"}</span>
                          <span style={badge(P.sand,P.textMuted)}>{HITO[p.hito_pago]?.label}</span>
                        </div>
                      </div>
                      <button style={btnS(P.lavenderDark)} onClick={()=>openModal("proyecto",{...p})}>Editar</button>
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
        <div style={{ position:"fixed", inset:0, background:"rgba(80,60,120,0.25)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, backdropFilter:"blur(2px)" }}>
          <div style={{ background:"#fff", borderRadius:20, padding:28, width:300, boxShadow:"0 4px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Actualizar UF</div>
            <div style={{ fontSize:12, color:P.textMuted, marginBottom:16 }}>Ingresa el valor de la UF de hoy</div>
            <input autoFocus type="number" value={ufInput} onChange={e=>setUfInput(e.target.value)}
              placeholder="Ej: 40000" style={{ ...inpStyle, fontSize:18, fontWeight:600, textAlign:"center" }} />
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...btnP, flex:1 }} onClick={()=>{ const v=parseFloat(ufInput); if(v>1000) setUfHoy(v); setEditUF(false); }}>Guardar</button>
              <button style={btnG} onClick={()=>setEditUF(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MINI MODAL ESTADO */}
      {miniModal && <MiniModal me={miniModal} setMe={setMiniModal} confirm={confirmarEstado} proyectoById={proyById} />}

      {/* MODAL PRINCIPAL */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(80,60,120,0.25)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, backdropFilter:"blur(2px)" }}>
          <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 -4px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ width:36, height:4, background:P.border, borderRadius:2, margin:"0 auto 20px" }}></div>

            {modal==="propiedad" && (
              <>
                <div style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>{form.id?"Editar":"Nueva"} propiedad</div>
                <span style={lbl}>Cliente</span>
                <select style={inpStyle} value={form.cliente_id||""} onChange={e=>ff("cliente_id",e.target.value)}>
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre+" — "+(c.tipo==="referido"?"Referido 50%":"Lead 30%")}</option>)}
                </select>
                <span style={lbl}>Inmobiliaria</span>
                <select style={inpStyle} value={form._inmob||""} onChange={e=>{ ff("_inmob",e.target.value); ff("proyecto_id",""); }}>
                  <option value="">Seleccionar inmobiliaria</option>
                  {inmobiliarias.map(i=><option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
                {form._inmob && (
                  <>
                    <span style={lbl}>Proyecto</span>
                    <select style={inpStyle} value={form.proyecto_id||""} onChange={e=>ff("proyecto_id",e.target.value)}>
                      <option value="">Seleccionar proyecto</option>
                      {proyectos.filter(p=>p.inmobiliaria_id===form._inmob).map(p=>(
                        <option key={p.id} value={p.id}>{p.nombre+" · "+p.porcentaje_zaror+"% · "+(HITO[p.hito_pago]?.label)}</option>
                      ))}
                    </select>
                  </>
                )}
                <span style={lbl}>Valor en UF</span>
                <input placeholder="Ej: 3500" type="number" style={inpStyle} value={form.uf||""} onChange={e=>ff("uf",e.target.value)} />
                <span style={lbl}>Estado</span>
                <select style={inpStyle} value={form.estado||"reserva"} onChange={e=>ff("estado",e.target.value)}>
                  <option value="reserva">Reserva</option>
                  <option value="promesa">Promesa firmada</option>
                  <option value="pagado">Pagado</option>
                </select>
                {(form.estado==="promesa"||form.estado==="pagado") && (
                  <>
                    <span style={lbl}>Fecha de firma promesa</span>
                    <input type="date" style={inpStyle} value={form.fecha_promesa||""} onChange={e=>ff("fecha_promesa",e.target.value)} />
                  </>
                )}
                {form.estado==="promesa" && proySel?.hito_pago==="mixto" && (
                  <>
                    <span style={lbl}>Fecha estimada escritura</span>
                    <input type="date" style={inpStyle} value={form.fecha_escritura||""} onChange={e=>ff("fecha_escritura",e.target.value)} />
                  </>
                )}
                {form.estado==="reserva" && (
                  <>
                    <span style={lbl}>Mes estimado de conversión</span>
                    <input type="month" style={inpStyle} value={form.mes_forecast||""} onChange={e=>ff("mes_forecast",e.target.value)} />
                    <span style={lbl}>{"Probabilidad: "+(form.prob_forecast||50)+"%"}</span>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                      {[10,25,50,75,90,100].map(v=>(
                        <button key={v} onClick={()=>ff("prob_forecast",v)} style={{ padding:"6px 14px", borderRadius:50, border:"1.5px solid "+((form.prob_forecast||50)===v?P.lavenderDark:P.border), background:(form.prob_forecast||50)===v?P.lavender:"transparent", color:(form.prob_forecast||50)===v?P.lavenderDark:P.textMuted, fontSize:13, fontWeight:600, cursor:"pointer" }}>{v+"%"}</button>
                      ))}
                    </div>
                  </>
                )}
                {proySel && form.uf && form.cliente_id && (
                  <div style={{ background:P.lavender, borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
                    <div style={{ fontSize:11, color:P.lavenderDark, fontWeight:600, marginBottom:4 }}>Vista previa comisión</div>
                    <div style={{ fontSize:20, fontWeight:700, color:P.lavenderDark }}>
                      {fmtUF(parseFloat(form.uf||0)*(proySel.porcentaje_zaror/100)*(pctJ(form.cliente_id)/100))+" UF"}
                    </div>
                    <div style={{ fontSize:13, color:P.lavenderDark, opacity:0.8 }}>
                      {"$"+fmt(parseFloat(form.uf||0)*(proySel.porcentaje_zaror/100)*(pctJ(form.cliente_id)/100)*ufHoy)}
                    </div>
                  </div>
                )}
              </>
            )}

            {modal==="cliente" && (
              <>
                <div style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>{form.id?"Editar":"Nuevo"} cliente</div>
                <span style={lbl}>Nombre completo</span>
                <input placeholder="Ej: María González" style={inpStyle} value={form.nombre||""} onChange={e=>ff("nombre",e.target.value)} />
                <span style={lbl}>Tipo de cliente</span>
                <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                  {[["lead","Lead","30%",P.mint,P.mintDark],["referido","Referido","50%",P.sky,P.skyDark]].map(([val,label_,pct,bg,color])=>(
                    <button key={val} onClick={()=>ff("tipo",val)} style={{ flex:1, padding:14, borderRadius:14, border:"2px solid "+((form.tipo||"lead")===val?color:P.border), background:(form.tipo||"lead")===val?bg:"transparent", cursor:"pointer", textAlign:"center" }}>
                      <div style={{ fontWeight:700, color, fontSize:14 }}>{label_}</div>
                      <div style={{ fontSize:12, color, opacity:0.8 }}>{"Josefa gana "+pct}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {modal==="proyecto" && (
              <>
                <div style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>{form.id?"Editar":"Nuevo"} proyecto</div>
                <span style={lbl}>Inmobiliaria</span>
                <select style={inpStyle} value={form.inmobiliaria_id||""} onChange={e=>ff("inmobiliaria_id",e.target.value)}>
                  <option value="">Seleccionar inmobiliaria</option>
                  {inmobiliarias.map(i=><option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
                <span style={lbl}>Nombre del proyecto</span>
                <input placeholder="Ej: Torre Alameda" style={inpStyle} value={form.nombre||""} onChange={e=>ff("nombre",e.target.value)} />
                <span style={lbl}>{"% que gana Zaror Invest: "+(form.porcentaje_zaror||3)+"%"}</span>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                  {[2,2.5,3,3.5,4].map(v=>(
                    <button key={v} onClick={()=>ff("porcentaje_zaror",v)} style={{ padding:"7px 16px", borderRadius:50, border:"1.5px solid "+((parseFloat(form.porcentaje_zaror)||3)===v?P.lavenderDark:P.border), background:(parseFloat(form.porcentaje_zaror)||3)===v?P.lavender:"transparent", color:(parseFloat(form.porcentaje_zaror)||3)===v?P.lavenderDark:P.textMuted, fontSize:13, fontWeight:600, cursor:"pointer" }}>{v+"%"}</button>
                  ))}
                </div>
                <span style={lbl}>Condición de pago</span>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                  {[["promesa","A la promesa","Pago al firmar la promesa"],["escritura","A la escritura","Pago al firmar la escritura"],["mixto","1.5% promesa + 1.5% escritura","Pago dividido en dos hitos"]].map(([val,label_,desc])=>(
                    <button key={val} onClick={()=>ff("hito_pago",val)} style={{ padding:"12px 16px", borderRadius:14, border:"2px solid "+((form.hito_pago||"promesa")===val?P.lavenderDark:P.border), background:(form.hito_pago||"promesa")===val?P.lavender:"transparent", cursor:"pointer", textAlign:"left" }}>
                      <div style={{ fontWeight:700, color:(form.hito_pago||"promesa")===val?P.lavenderDark:P.text, fontSize:13 }}>{label_}</div>
                      <div style={{ fontSize:11, color:P.textMuted, marginTop:2 }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...btnP, flex:1, opacity:saving?0.6:1 }} disabled={saving}
                onClick={modal==="propiedad"?savePropiedad:modal==="cliente"?saveCliente:saveProyecto}>
                {saving?"Guardando...":"Guardar"}
              </button>
              <button style={btnG} onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
