import { useState, useMemo, useRef, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

/* ─── BRAND TOKENS ─── */
const C = {
  accent:    "#C9A94F",
  accentHi:  "#DAA520",
  accentDim: "#C9A94F18",
  bg:        "#0C0B09",
  surface:   "#14120E",
  card:      "#1B1915",
  cardHi:    "#24211B",
  border:    "#2E2A21",
  borderHi:  "#4A4130",
  text1:     "#F3EFE9",
  text2:     "#A39A88",
  text3:     "#5E5747",
  champagne: "#E9D0A3",
  wine:      "#C0566F",
  forest:    "#5FA597",
  danger:    "#E0566B",
  warn:      "#E8961E",
  info:      "#5FA597",
  success:   "#7FBF8E",
  display:   "'Cinzel', Georgia, serif",
  font:      "'Inter', system-ui, sans-serif",
  fontBody:  "'Inter', system-ui, sans-serif",
};

/* ─── STATUSES ─── */
const STATUSES = [
  {id:"backlog",    label:"Backlog",        color:"#3A3A3A", bg:"#111",    icon:"○"},
  {id:"briefing",   label:"Briefing",       color:"#5FA597", bg:"#0A1F1D", icon:"📋"},
  {id:"planejando", label:"Planejando",     color:"#9FB6C9", bg:"#0F161C", icon:"🗂"},
  {id:"andamento",  label:"Em andamento",   color:"#DAA520", bg:"#1F1806", icon:"⚡"},
  {id:"producao",   label:"Em produção",    color:"#F59E0B", bg:"#1A1000", icon:"🎬"},
  {id:"revisao",    label:"Em revisão",     color:"#F97316", bg:"#1A0C00", icon:"👁"},
  {id:"aprovacao",  label:"Ag. aprovação",  color:"#E9D0A3", bg:"#1E1810", icon:"⏳"},
  {id:"ajustes",    label:"Ajustes",        color:"#C0566F", bg:"#220A10", icon:"✏️"},
  {id:"concluido",  label:"Concluído",      color:"#4ADE80", bg:"#081A08", icon:"✓"},
  {id:"pausado",    label:"Pausado",        color:"#666",    bg:"#111",    icon:"⏸"},
  {id:"cancelado",  label:"Cancelado",      color:"#FF4444", bg:"#1A0404", icon:"✕"},
];

const PRIORITY = [
  {id:"urgente", label:"Urgente", color:"#FF4444", bg:"#220404", icon:"🔴"},
  {id:"normal",  label:"Normal",  color:"#DAA520", bg:"#1F1806", icon:"🟡"},
  {id:"baixa",   label:"Baixa",   color:"#444",    bg:"#111",    icon:"⚪"},
];

const CONTENT_STATUS = [
  {id:"ideia",     label:"Ideia",     color:"#555",    bg:"#111"},
  {id:"rascunho",  label:"Rascunho",  color:"#9FB6C9", bg:"#0F161C"},
  {id:"agendado",  label:"Agendado",  color:"#DAA520", bg:"#1F1806"},
  {id:"publicado", label:"Publicado", color:"#4ADE80", bg:"#081A08"},
];

const PLATFORMS = [
  {id:"instagram", label:"Instagram", color:"#E1306C"},
  {id:"youtube",   label:"YouTube",   color:"#FF0000"},
  {id:"tiktok",    label:"TikTok",    color:"#69C9D0"},
  {id:"facebook",  label:"Facebook",  color:"#1877F2"},
];

/* ─── NEWS CATEGORIES (mesmas chaves de api/news.js) ─── */
const NEWS_CATS = [
  {id:"all",        label:"Todos",       color:C.accent},
  {id:"local",      label:"Goiânia",     color:C.accentHi},
  {id:"emalta",     label:"Em alta",     color:C.danger},
  {id:"criticas",   label:"Críticas",    color:"#B9A3D6"},
  {id:"cinema",     label:"Estreias",    color:C.champagne},
  {id:"bilheteria", label:"Bilheteria",  color:C.success},
  {id:"mercado",    label:"Mercado",     color:C.forest},
  {id:"streaming",  label:"Streaming",   color:C.wine},
  {id:"tech",       label:"Tecnologia",  color:"#9FB6C9"},
];

/* ─── CONCORRENTES (Goiânia) — métricas vêm ao vivo do business_discovery ─── */
const iCompetitors = [
  {id:1, name:"Cinemark",  handle:"@cinemarkoficial", platform:"instagram", location:"Flamboyant · Passeio das Águas"},
  {id:2, name:"Kinoplex",  handle:"@kinoplex",        platform:"instagram", location:"Goiânia Shopping"},
  {id:3, name:"Cinépolis", handle:"@cinepolisbrasil", platform:"instagram", location:"Shopping Cerrado"},
  {id:4, name:"Lumière",   handle:"@cinemaslumiere",  platform:"instagram", location:"Banana Shopping · Bougainville"},
];

/* ─── CONTENT MIX PIE (planejado) ─── */
const pieData = [
  {name:"Filmes/Estreias",  value:38, color:C.accentHi},
  {name:"Promoções",        value:28, color:C.champagne},
  {name:"Eventos",          value:18, color:C.wine},
  {name:"Institucional",    value:16, color:C.forest},
];

/* ─── INITIAL PROJECT/TASK DATA ─── */
let nPid=6, nTid=8, nCid=7;

const iProjects = [
  {id:1, name:"Campanha Semana do Cinema",    client:"Aurum Cinema", status:"andamento", priority:"urgente", deadline:"2026-11-03", desc:"Posts, stories e reels para a promoção"},
  {id:2, name:"Lançamento Sala Premium",       client:"Aurum Cinema", status:"producao",  priority:"urgente", deadline:"2026-11-14", desc:"Campanha completa da sala premium"},
  {id:3, name:"Reels Bastidores Outubro",      client:"Aurum Cinema", status:"concluido", priority:"normal",  deadline:"2026-10-15", desc:"Série de reels nos bastidores"},
  {id:4, name:"Identidade Stories Temporária", client:"Aurum Cinema", status:"revisao",   priority:"normal",  deadline:"2026-10-30", desc:"Template de stories para Novembro"},
  {id:5, name:"Integração App Ingresso",       client:"Aurum Cinema", status:"briefing",  priority:"baixa",   deadline:"2026-12-01", desc:"Visual para campanha app"},
];

const iTasks = [
  {id:1, projectId:1, title:"Artes para feed Instagram",    assignee:"Ana",   status:"concluido", priority:"urgente", deadline:"2026-10-22"},
  {id:2, projectId:1, title:"Stories animados promo",       assignee:"Bruno", status:"andamento", priority:"urgente", deadline:"2026-10-27"},
  {id:3, projectId:1, title:"Reel corte promoção",          assignee:"Carol", status:"backlog",   priority:"normal",  deadline:"2026-10-31"},
  {id:4, projectId:2, title:"Roteiro vídeo inauguração",    assignee:"Ana",   status:"planejando",priority:"urgente", deadline:"2026-11-05"},
  {id:5, projectId:3, title:"Edição final reels",           assignee:"Bruno", status:"concluido", priority:"normal",  deadline:"2026-10-14"},
  {id:6, projectId:4, title:"Layout stories Novembro",      assignee:"Carol", status:"ajustes",   priority:"normal",  deadline:"2026-10-29"},
  {id:7, projectId:5, title:"Mockup visual app",            assignee:"Ana",   status:"backlog",   priority:"baixa",   deadline:"2026-11-25"},
];

const iContent = [
  {id:1, title:"Post estreia da semana",         platform:"instagram", type:"feed",    status:"agendado",  date:"2026-10-23", caption:"A estreia mais esperada chega quinta! 🎬"},
  {id:2, title:"Stories Semana do Cinema",       platform:"instagram", type:"stories", status:"rascunho",  date:"2026-11-02", caption:"Ingressos promocionais! Só esta semana 🎟️"},
  {id:3, title:"Reel Bastidores Sala Premium",   platform:"instagram", type:"reels",   status:"ideia",     date:"",           caption:""},
  {id:4, title:"Vídeo Tour Sala VIP",            platform:"youtube",   type:"video",   status:"agendado",  date:"2026-10-30", caption:"Conheça nossa sala VIP"},
  {id:5, title:"Post Resultado Outubro",         platform:"instagram", type:"feed",    status:"publicado", date:"2026-10-12", caption:"Obrigado Goiânia! 🙌"},
  {id:6, title:"Reel Top Filmes Novembro",       platform:"instagram", type:"reels",   status:"rascunho",  date:"2026-11-01", caption:"Os filmes que você não pode perder em Novembro!"},
];

const getPl = id => PLATFORMS.find(p=>p.id===id)||PLATFORMS[0];

/* ─── HELPERS ─── */
const fmtNum = n => n==null ? "—" : new Intl.NumberFormat("pt-BR",{notation:n>=10000?"compact":"standard",maximumFractionDigits:1}).format(n);
const fmtPct = n => n==null ? "—" : `${n.toLocaleString("pt-BR",{maximumFractionDigits:2})}%`;
const delta  = (cur, prev) => (cur==null||!prev) ? null : +((cur-prev)/prev*100).toFixed(1);
const fmtDay = iso => { const [,m,d] = iso.split("-"); return `${d}/${m}`; };
const timeAgo = iso => {
  const min = Math.round((Date.now()-new Date(iso).getTime())/60000);
  if (min < 60) return `há ${Math.max(min,1)} min`;
  if (min < 1440) return `há ${Math.round(min/60)} h`;
  return new Date(iso).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
};

/* localStorage pode falhar (aba anônima, bloqueio) — o app funciona sem ele */
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value)    { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignora */ } },
};

/* ─── HOOK GENÉRICO PARA AS FUNÇÕES /api ─── */
function useApi(url) {
  const [nonce, setNonce] = useState(0);
  const key = url ? `${url}#${nonce}` : null;
  // "loading" é derivado: enquanto a resposta guardada não for da chave atual, está carregando
  const [state, setState] = useState({key:null, data:null, error:null});

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(url)
      .then(async r => {
        // Em `npm run dev` o Vite não executa /api e devolve o index.html
        if (!(r.headers.get("content-type")||"").includes("json")) throw new Error("API indisponível no servidor local — use `vercel dev` ou o deploy.");
        const json = await r.json();
        if (!r.ok) throw Object.assign(new Error(json.error||`HTTP ${r.status}`), {code:json.code});
        return json;
      })
      .then(data => { if (!cancelled) setState({key, data, error:null}); })
      .catch(err => { if (!cancelled) setState({key, data:null, error:err}); });
    return () => { cancelled = true; };
  }, [key, url]);

  const loading = !!key && state.key!==key;
  // Durante um reload mantém os dados anteriores na tela
  return {data:state.data, error:loading?null:state.error, loading, reload:() => setNonce(n=>n+1)};
}

const useInstagram = () => useApi("/api/instagram?endpoint=summary");
const useNews      = () => useApi("/api/news");
const useMovies    = () => useApi("/api/movies");

/* ─── BACKGROUND BLOBS (ouro/vinho) ─── */
function BackgroundBlobs() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none"}}>
      <div style={{position:"absolute",width:700,height:700,top:"-15%",left:"-8%",background:"radial-gradient(circle,rgba(201,169,79,0.09) 0%,transparent 65%)",animation:"blob1 22s ease-in-out infinite",filter:"blur(55px)"}}/>
      <div style={{position:"absolute",width:560,height:560,bottom:"5%",right:"0%",background:"radial-gradient(circle,rgba(218,165,32,0.06) 0%,transparent 65%)",animation:"blob2 28s ease-in-out infinite",filter:"blur(65px)"}}/>
      <div style={{position:"absolute",width:480,height:480,top:"45%",left:"38%",background:"radial-gradient(circle,rgba(74,22,37,0.18) 0%,transparent 65%)",animation:"blob3 32s ease-in-out infinite",filter:"blur(75px)"}}/>
      <div style={{position:"absolute",width:300,height:300,top:"20%",right:"25%",background:"radial-gradient(circle,rgba(201,169,79,0.04) 0%,transparent 70%)",animation:"blob1 40s ease-in-out infinite reverse",filter:"blur(45px)"}}/>
    </div>
  );
}

/* ─── MOUSE GLOW ─── */
function MouseGlow() {
  const [pos, setPos] = useState({x:-300, y:-300});
  useEffect(() => {
    const fn = e => setPos({x:e.clientX, y:e.clientY});
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return (
    <div style={{position:"fixed",pointerEvents:"none",zIndex:1,left:pos.x-250,top:pos.y-250,width:500,height:500,background:"radial-gradient(circle,rgba(201,169,79,0.04) 0%,transparent 70%)",borderRadius:"50%",transition:"left 0.12s ease-out,top 0.12s ease-out",filter:"blur(8px)"}}/>
  );
}

/* ─── PIP DROPDOWN ─── */
function Pip({value, onChange, options}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const cur = options.find(o=>o.id===value)||options[0];
  useEffect(() => {
    if (!open) return;
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);
  return (
    <div ref={ref} style={{position:"relative",display:"inline-block"}}>
      <button onClick={e=>{e.stopPropagation();setOpen(o=>!o)}}
        style={{background:cur.bg,color:cur.color,border:`1px solid ${cur.color}28`,cursor:"pointer",whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:700,fontFamily:C.font,letterSpacing:"0.01em",transition:"opacity 0.1s"}}>
        {cur.icon&&<span style={{fontSize:10}}>{cur.icon}</span>}
        <span>{cur.label}</span>
        <span style={{opacity:0.35,fontSize:8,marginLeft:2}}>▾</span>
      </button>
      {open&&(
        <div style={{position:"absolute",left:0,top:"calc(100% + 6px)",background:"#100E0B",border:`1px solid ${C.borderHi}`,boxShadow:"0 20px 60px rgba(0,0,0,0.95)",zIndex:400,minWidth:180,borderRadius:14,padding:"6px 0",overflow:"hidden"}}>
          {options.map(o => {
            const active = o.id===value;
            return (
              <button key={o.id} onClick={e=>{e.stopPropagation();onChange(o.id);setOpen(false);}}
                style={{color:active?o.color:C.text2,background:active?`${o.color}10`:"transparent",width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 14px",fontSize:12,fontFamily:C.font,fontWeight:active?700:500,textAlign:"left",border:"none",cursor:"pointer",transition:"background 0.1s"}}>
                {o.icon&&<span style={{fontSize:12}}>{o.icon}</span>}
                <span>{o.label}</span>
                {active&&<span style={{color:o.color,marginLeft:"auto",fontSize:10}}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── STAT CARD ─── */
function StatCard({label, value, accent, series}) {
  return (
    <div className="glass card-animate" style={{borderRadius:18,padding:22,position:"relative",overflow:"hidden",minHeight:115,transition:"all 0.25s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 0 30px ${accent||C.accent}22,0 20px 50px rgba(0,0,0,0.5)`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="";}}>
      <div style={{color:C.text2,fontSize:10,letterSpacing:"0.12em",fontFamily:C.font,marginBottom:8,textTransform:"uppercase",fontWeight:700}}>{label}</div>
      <div style={{color:accent||C.text1,fontFamily:C.display,fontSize:32,fontWeight:700,lineHeight:1}}>{value}</div>
      {series?.length>1&&(
        <div style={{position:"absolute",bottom:0,right:0,left:0,height:52,opacity:0.3}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{top:0,right:0,bottom:0,left:0}}>
              <defs><linearGradient id={`g${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent||C.accent} stopOpacity={0.6}/>
                <stop offset="100%" stopColor={accent||C.accent} stopOpacity={0}/>
              </linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke={accent||C.accent} strokeWidth={1.5} fill={`url(#g${label})`} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={{position:"absolute",top:-24,right:-24,width:90,height:90,background:`radial-gradient(circle,${accent||C.accent}15 0%,transparent 70%)`}}/>
    </div>
  );
}

/* ─── METRIC CARD (Analytics) ─── */
function MetricCard({label, value, delta, hint, color, loading}) {
  if (loading) return (
    <div className="glass" style={{borderRadius:18,padding:24}}>
      <div className="skeleton" style={{height:10,width:"60%",marginBottom:14}}/>
      <div className="skeleton" style={{height:36,width:"80%",marginBottom:14}}/>
      <div className="skeleton" style={{height:12,width:"50%"}}/>
    </div>
  );
  const positive = delta>=0;
  return (
    <div className="glass card-animate" style={{borderRadius:18,padding:24,position:"relative",overflow:"hidden",transition:"all 0.25s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 0 30px ${color||C.accent}22,0 20px 50px rgba(0,0,0,0.5)`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="";}}>
      <div style={{color:C.text2,fontSize:10,letterSpacing:"0.12em",fontFamily:C.font,marginBottom:10,textTransform:"uppercase",fontWeight:700}}>{label}</div>
      <div style={{color:color||C.text1,fontFamily:C.display,fontSize:34,fontWeight:700,lineHeight:1,marginBottom:10}}>{value}</div>
      <div style={{display:"flex",alignItems:"center",gap:5,minHeight:16}}>
        {delta!=null ? <>
          <span style={{color:positive?C.success:C.danger,fontSize:13,fontWeight:800}}>{positive?"↑":"↓"}</span>
          <span style={{color:positive?C.success:C.danger,fontSize:12,fontFamily:C.font,fontWeight:700}}>{Math.abs(delta).toLocaleString("pt-BR")}%</span>
          <span style={{color:C.text3,fontSize:11,fontFamily:C.fontBody}}>vs 28 dias anteriores</span>
        </> : hint && <span style={{color:C.text3,fontSize:11,fontFamily:C.fontBody}}>{hint}</span>}
      </div>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,background:`radial-gradient(circle,${color||C.accent}18 0%,transparent 70%)`}}/>
    </div>
  );
}

const CustomTooltip = ({active, payload, label}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#100E0B",border:`1px solid ${C.borderHi}`,borderRadius:12,padding:"10px 14px",fontSize:12,fontFamily:C.font}}>
      <div style={{color:C.text2,marginBottom:6,fontWeight:600}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color,fontWeight:800}}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

/* ─── MODAL ─── */
function Modal({title, onClose, children}) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(4px)"}}>
      <div style={{background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:22,padding:30,width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 40px 120px rgba(0,0,0,0.8)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:26}}>
          <div style={{fontFamily:C.display,color:C.text1,fontSize:17,fontWeight:900,letterSpacing:"-0.02em"}}>{title}</div>
          <button onClick={onClose} style={{color:C.text3,background:C.card,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:13,width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputSt = {
  width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,
  padding:"11px 14px",color:C.text1,fontSize:13,outline:"none",
  boxSizing:"border-box",fontFamily:C.fontBody,transition:"border-color 0.15s",
};

function Field({label, children}) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{color:C.text2,fontSize:10,letterSpacing:"0.1em",marginBottom:7,textTransform:"uppercase",fontFamily:C.font,fontWeight:700}}>{label}</div>
      {children}
    </div>
  );
}

/* ─── PROJECT CARD ─── */
function ProjectCard({project, tasks, onProjStatus, onProjPriority, onTaskToggle, onAddTask}) {
  const projTasks = tasks.filter(t=>t.projectId===project.id);
  const done = projTasks.filter(t=>t.status==="concluido").length;
  const pct = projTasks.length ? Math.round(done/projTasks.length*100) : 0;

  return (
    <div className="glass card-animate" style={{borderRadius:18,padding:16,transition:"all 0.25s",cursor:"default"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 0 24px rgba(201,169,79,0.08),0 16px 40px rgba(0,0,0,0.6)`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="";}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:4}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:C.text1,fontFamily:C.font,fontSize:14,fontWeight:800,lineHeight:1.3,marginBottom:4}}>{project.name}</div>
          <div style={{color:C.text2,fontSize:11,fontFamily:C.fontBody}}>{project.client} · {project.deadline}</div>
        </div>
        <Pip value={project.priority} onChange={v=>onProjPriority(project.id,v)} options={PRIORITY}/>
      </div>
      <div style={{marginTop:10,marginBottom:14}}>
        <Pip value={project.status} onChange={v=>onProjStatus(project.id,v)} options={STATUSES}/>
      </div>
      {projTasks.length>0&&(
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{color:C.text3,fontSize:10,fontFamily:C.font,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Tarefas</span>
            <span style={{color:pct===100?C.success:C.text3,fontSize:10,fontFamily:C.font,fontWeight:700}}>{done}/{projTasks.length}</span>
          </div>
          <div style={{height:3,background:C.border,borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:pct===100?C.success:C.accent,borderRadius:99,transition:"width 0.3s"}}/>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {projTasks.map(task => {
          const isDone = task.status==="concluido";
          return (
            <div key={task.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 6px",borderRadius:8,transition:"background 0.1s",cursor:"default"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.card}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <button onClick={()=>onTaskToggle(task.id)}
                style={{width:16,height:16,borderRadius:5,border:`1.5px solid ${isDone?C.success:C.border}`,background:isDone?C.success:C.card,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.15s"}}>
                {isDone&&<span style={{color:"#0C0B09",fontSize:9,fontWeight:900,lineHeight:1}}>✓</span>}
              </button>
              <span style={{color:isDone?C.text3:C.text2,fontSize:12,fontFamily:C.fontBody,flex:1,textDecoration:isDone?"line-through":"none"}}>{task.title}</span>
              {task.assignee&&<span style={{color:C.text3,fontSize:10,fontFamily:C.font,fontWeight:600,flexShrink:0}}>{task.assignee}</span>}
            </div>
          );
        })}
        <button onClick={()=>onAddTask(project.id)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"4px 6px",borderRadius:8,background:"transparent",border:"none",color:C.text3,fontSize:11,fontFamily:C.font,fontWeight:700,cursor:"pointer",textAlign:"left",transition:"color 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.color=C.accent}
          onMouseLeave={e=>e.currentTarget.style.color=C.text3}>
          <span style={{fontSize:14,lineHeight:1}}>+</span> nova tarefa
        </button>
      </div>
    </div>
  );
}

/* ─── PROJECT KANBAN ─── */
function ProjectKanban({projects, tasks, onProjStatus, onProjPriority, onTaskToggle, onAddTask, onAddProject}) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColId,  setOverColId]  = useState(null);

  return (
    <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:20,minHeight:400}}>
      {STATUSES.map(col => {
        const colItems = projects.filter(p=>p.status===col.id);
        const isOver = overColId===col.id;
        return (
          <div key={col.id}
            style={{minWidth:272,maxWidth:290,flexShrink:0,borderRadius:18,border:isOver?`1px dashed ${col.color}55`:"1px solid transparent",background:isOver?`${col.color}05`:"transparent",transition:"all 0.15s",padding:4}}
            onDragOver={e=>{e.preventDefault();setOverColId(col.id);}}
            onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOverColId(null);}}
            onDrop={()=>{if(draggingId!=null)onProjStatus(draggingId,col.id);setOverColId(null);setDraggingId(null);}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"4px 4px 0"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:col.color,boxShadow:`0 0 7px ${col.color}99`}}/>
              <span style={{color:col.color,fontFamily:C.font,fontSize:10,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase"}}>{col.label}</span>
              <span style={{background:C.border,color:C.text2,fontSize:10,fontFamily:C.font,fontWeight:800,marginLeft:"auto",padding:"2px 8px",borderRadius:99}}>{colItems.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {colItems.map(p => (
                <div key={p.id}
                  draggable
                  onDragStart={()=>setDraggingId(p.id)}
                  onDragEnd={()=>{setDraggingId(null);setOverColId(null);}}
                  style={{opacity:draggingId===p.id?0.4:1,cursor:"grab",transition:"opacity 0.15s"}}>
                  <ProjectCard project={p} tasks={tasks}
                    onProjStatus={onProjStatus} onProjPriority={onProjPriority}
                    onTaskToggle={onTaskToggle} onAddTask={onAddTask}/>
                </div>
              ))}
              <button onClick={()=>onAddProject(col.id)}
                style={{border:`1px dashed ${C.border}`,borderRadius:14,padding:"10px 0",textAlign:"center",color:C.text3,fontSize:12,fontFamily:C.font,fontWeight:700,cursor:"pointer",background:"transparent",width:"100%",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=col.color;e.currentTarget.style.color=col.color;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text3;}}>
                + Projeto
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── CONTENT MANAGER ─── */
function ContentManager({content, onStatusChange, onAdd}) {
  const [filter, setFilter] = useState("all");
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const filtered = filter==="all" ? content : content.filter(c=>c.platform===filter);

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap",alignItems:"center"}}>
        {["all",...PLATFORMS.map(p=>p.id)].map(pid => {
          const pl = pid==="all" ? null : getPl(pid);
          const active = filter===pid;
          const color = pl ? pl.color : C.accent;
          return (
            <button key={pid} onClick={()=>setFilter(pid)}
              style={{padding:"6px 16px",borderRadius:10,fontSize:12,fontWeight:700,fontFamily:C.font,border:`1px solid ${active?color:C.border}`,background:active?`${color}18`:"transparent",color:active?color:C.text2,cursor:"pointer",transition:"all 0.15s"}}>
              {pid==="all"?"Todos":pl.label}
            </button>
          );
        })}
        <button onClick={()=>onAdd("ideia")}
          style={{marginLeft:"auto",padding:"7px 20px",borderRadius:10,fontSize:12,fontWeight:800,fontFamily:C.font,border:"none",background:C.accent,color:"#1B1408",cursor:"pointer"}}>
          + Novo Conteúdo
        </button>
      </div>
      <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:16}}>
        {CONTENT_STATUS.map(col => {
          const colItems = filtered.filter(c=>c.status===col.id);
          const isOver = overCol===col.id;
          return (
            <div key={col.id}
              style={{minWidth:268,maxWidth:286,flexShrink:0,borderRadius:18,border:isOver?`1px dashed ${col.color}55`:"1px solid transparent",background:isOver?`${col.color}05`:"transparent",transition:"all 0.15s",padding:4}}
              onDragOver={e=>{e.preventDefault();setOverCol(col.id);}}
              onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOverCol(null);}}
              onDrop={()=>{if(dragId!=null)onStatusChange(dragId,col.id);setOverCol(null);setDragId(null);}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:col.color,boxShadow:`0 0 7px ${col.color}99`}}/>
                <span style={{color:col.color,fontFamily:C.font,fontSize:10,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase"}}>{col.label}</span>
                <span style={{background:C.border,color:C.text2,fontSize:10,fontFamily:C.font,fontWeight:800,marginLeft:"auto",padding:"2px 8px",borderRadius:99}}>{colItems.length}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {colItems.map(item => {
                  const pl = getPl(item.platform);
                  return (
                    <div key={item.id}
                      draggable
                      onDragStart={()=>setDragId(item.id)}
                      onDragEnd={()=>{setDragId(null);setOverCol(null);}}
                      className="glass card-animate"
                      style={{opacity:dragId===item.id?0.4:1,cursor:"grab",borderRadius:16,padding:14,transition:"all 0.25s"}}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 0 20px rgba(201,169,79,0.06),0 12px 32px rgba(0,0,0,0.5)`;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="";}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{background:`${pl.color}20`,color:pl.color,fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:7,fontFamily:C.font}}>{pl.label}</span>
                        <span style={{color:C.text3,fontSize:10,fontFamily:C.fontBody}}>{item.type}</span>
                        {item.date&&<span style={{marginLeft:"auto",color:C.text3,fontSize:10,fontFamily:C.fontBody}}>{item.date}</span>}
                      </div>
                      <div style={{color:C.text1,fontFamily:C.font,fontSize:13,fontWeight:800,marginBottom:item.caption?6:10,lineHeight:1.3}}>{item.title}</div>
                      {item.caption&&<div style={{color:C.text2,fontSize:11,fontFamily:C.fontBody,marginBottom:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.caption}</div>}
                      <Pip value={item.status} onChange={v=>onStatusChange(item.id,v)} options={CONTENT_STATUS}/>
                    </div>
                  );
                })}
                <button onClick={()=>onAdd(col.id)}
                  style={{border:`1px dashed ${C.border}`,borderRadius:14,padding:"10px 0",textAlign:"center",color:C.text3,fontSize:12,fontFamily:C.font,fontWeight:700,cursor:"pointer",background:"transparent",width:"100%",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=col.color;e.currentTarget.style.color=col.color;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text3;}}>
                  + Adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CALENDAR ─── */
function CalendarView({content}) {
  const [cur, setCur] = useState(() => { const d = new Date(); return {year:d.getFullYear(), month:d.getMonth()}; });
  const today = new Date();
  const daysInMonth = new Date(cur.year, cur.month+1, 0).getDate();
  const firstDay = new Date(cur.year, cur.month, 1).getDay();
  const monthName = new Date(cur.year, cur.month, 1).toLocaleString("pt-BR", {month:"long", year:"numeric"});
  const prev = () => setCur(c => c.month===0?{year:c.year-1,month:11}:{year:c.year,month:c.month-1});
  const next = () => setCur(c => c.month===11?{year:c.year+1,month:0}:{year:c.year,month:c.month+1});
  const getDay = day => {
    const d = `${cur.year}-${String(cur.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return content.filter(c=>c.date===d);
  };
  const wd = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div style={{fontFamily:C.display,color:C.text1,fontSize:18,fontWeight:900,textTransform:"capitalize",letterSpacing:"-0.02em"}}>{monthName}</div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={prev} style={{background:C.card,border:`1px solid ${C.border}`,color:C.text2,borderRadius:10,padding:"6px 14px",cursor:"pointer",fontSize:14,fontFamily:C.font,transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHi} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>‹</button>
          <button onClick={next} style={{background:C.card,border:`1px solid ${C.border}`,color:C.text2,borderRadius:10,padding:"6px 14px",cursor:"pointer",fontSize:14,fontFamily:C.font,transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHi} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>›</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {wd.map(d => (
          <div key={d} style={{textAlign:"center",color:C.text3,fontSize:10,fontFamily:C.font,fontWeight:800,padding:"6px 0",letterSpacing:"0.08em"}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {Array.from({length:firstDay}).map((_,i) => (
          <div key={`e${i}`} style={{minHeight:84,borderRadius:12,background:C.surface,opacity:0.15}}/>
        ))}
        {Array.from({length:daysInMonth}).map((_,i) => {
          const day = i+1;
          const items = getDay(day);
          const isToday = cur.year===today.getFullYear()&&cur.month===today.getMonth()&&day===today.getDate();
          return (
            <div key={day} style={{minHeight:84,borderRadius:12,background:C.card,border:`1px solid ${isToday?C.accent:C.border}`,padding:8,transition:"border-color 0.15s"}}
              onMouseEnter={e=>{if(!isToday)e.currentTarget.style.borderColor=C.borderHi;}}
              onMouseLeave={e=>{if(!isToday)e.currentTarget.style.borderColor=C.border;}}>
              <div style={{fontFamily:C.font,fontSize:12,fontWeight:800,color:isToday?C.accent:C.text3,marginBottom:4}}>{day}</div>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {items.slice(0,2).map(item => {
                  const pl = getPl(item.platform);
                  return (
                    <div key={item.id} style={{background:`${pl.color}20`,borderLeft:`2px solid ${pl.color}`,borderRadius:"0 5px 5px 0",padding:"2px 6px",fontSize:10,color:pl.color,fontWeight:700,fontFamily:C.font,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {item.title}
                    </div>
                  );
                })}
                {items.length>2&&<div style={{color:C.text3,fontSize:10,fontFamily:C.font,fontWeight:700}}>+{items.length-2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── FAIXA DE STATUS DAS INTEGRAÇÕES ─── */
function ApiBanner({state, label, onRetry}) {
  const {loading, error, data} = state;
  let color = C.success, icon = "●", text;
  if (loading) { color = C.accent; icon = "◌"; text = `Conectando ${label}...`; }
  else if (error) {
    color = C.warn; icon = "⚠";
    text = error.code==="not_configured" ? `${label}: falta configurar INSTAGRAM_ACCESS_TOKEN no Vercel (veja o README).`
         : error.code===190                ? `${label}: token expirado ou inválido — gere um novo token e atualize no Vercel.`
         : `${label}: ${error.message}`;
  } else if (data) {
    text = `${label} conectado${data.updatedAt?` · atualizado ${timeAgo(data.updatedAt)}`:""}`;
  } else return null;
  return (
    <div style={{background:`${color}10`,border:`1px solid ${color}30`,borderRadius:12,padding:"10px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
      <span style={{color,fontSize:12}}>{icon}</span>
      <span style={{color:C.text2,fontSize:12,fontFamily:C.fontBody,flex:1}}>{text}</span>
      {onRetry&&!loading&&(
        <button onClick={onRetry} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"3px 10px",color:C.text2,fontSize:11,fontFamily:C.font,fontWeight:700,cursor:"pointer"}}>↻ Atualizar</button>
      )}
    </div>
  );
}

function EmptyState({children, height=160}) {
  return (
    <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",color:C.text3,fontSize:12,fontFamily:C.fontBody,border:`1px dashed ${C.border}`,borderRadius:12,padding:16}}>
      {children}
    </div>
  );
}

const sectionLabel = {color:C.text2,fontSize:10,letterSpacing:"0.12em",fontFamily:C.font,fontWeight:700,textTransform:"uppercase"};

/* ─── ANALYTICS VIEW (Instagram Graph API) ─── */
function AnalyticsView({ig}) {
  const d = ig.data;
  const p = d?.profile;
  const t = d?.totals || {};
  const prev = d?.previous || {};
  const reachSeries = (d?.series?.reach||[]).map(x=>({d:fmtDay(x.date), v:x.value}));
  const followSeries = (d?.series?.follower_count||[]).map(x=>({d:fmtDay(x.date), v:x.value}));
  const newFollowers = followSeries.length ? followSeries.reduce((s,x)=>s+x.v,0) : null;
  const posts = d?.posts || [];
  const postBars = posts.slice(0,12).reverse().map(x=>({d:new Date(x.timestamp).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}), likes:x.like_count||0, comments:x.comments_count||0}));

  return (
    <div>
      <ApiBanner state={ig} label="Instagram @aurum.cinema" onRetry={ig.reload}/>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:28}}>
        <MetricCard loading={ig.loading} label="Seguidores"         value={fmtNum(p?.followers_count)} hint={newFollowers!=null?`+${fmtNum(newFollowers)} novos em 28 dias`:null} color={C.accent}/>
        <MetricCard loading={ig.loading} label="Alcance · 28d"       value={fmtNum(t.reach)}            delta={delta(t.reach, prev.reach)}                     color={C.accentHi}/>
        <MetricCard loading={ig.loading} label="Visualizações · 28d" value={fmtNum(t.views)}            delta={delta(t.views, prev.views)}                     color={C.champagne}/>
        <MetricCard loading={ig.loading} label="Engajamento / post"  value={fmtPct(d?.engagementRate)}  hint={d?`${d.postsPerWeek} posts/semana`:null}        color={C.forest}/>
      </div>

      {p && (
        <div className="glass" style={{borderRadius:18,padding:18,marginBottom:20,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          {p.profile_picture_url && (
            <img src={p.profile_picture_url} alt={`@${p.username}`}
              style={{width:52,height:52,borderRadius:"50%",border:`2px solid ${C.accent}`,objectFit:"cover"}}/>
          )}
          <div style={{flex:"1 1 220px",minWidth:0}}>
            <a href={`https://instagram.com/${p.username}`} target="_blank" rel="noreferrer" style={{color:C.text1,fontFamily:C.display,fontSize:16,fontWeight:700,marginBottom:4,textDecoration:"none",display:"block"}}>@{p.username}</a>
            <div style={{color:C.text2,fontSize:12,fontFamily:C.fontBody,whiteSpace:"pre-line"}}>{p.biography || "Aurum Cinema — Goiânia"}</div>
          </div>
          <div style={{display:"flex",gap:24}}>
            {[
              {label:"Posts",           value:p.media_count},
              {label:"Seguidores",      value:p.followers_count},
              {label:"Visitas ao perfil",value:t.profile_views},
              {label:"Contas engajadas",value:t.accounts_engaged},
            ].map(s => (
              <div key={s.label} style={{textAlign:"center"}}>
                <div style={{color:C.text1,fontFamily:C.display,fontSize:18,fontWeight:700}}>{fmtNum(s.value)}</div>
                <div style={{color:C.text3,fontSize:10,fontFamily:C.fontBody}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:16}}>
        <div className="glass" style={{borderRadius:18,padding:22}}>
          <div style={{...sectionLabel,marginBottom:6}}>Alcance diário</div>
          <div style={{color:C.text1,fontFamily:C.display,fontSize:20,fontWeight:700,marginBottom:16}}>{fmtNum(t.reach)} <span style={{color:C.text3,fontSize:12,fontFamily:C.fontBody}}>contas em 28 dias</span></div>
          {reachSeries.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={reachSeries}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.35}/>
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24}/>
                <YAxis tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false} tickFormatter={fmtNum} width={44}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="v" name="Alcance" stroke={C.accent} strokeWidth={2} fill="url(#reachGrad)" dot={false} activeDot={{r:4,fill:C.accent}}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState>{ig.loading?"Carregando...":"Sem série de alcance disponível."}</EmptyState>}
        </div>

        <div className="glass" style={{borderRadius:18,padding:22}}>
          <div style={{...sectionLabel,marginBottom:6}}>Novos seguidores por dia</div>
          <div style={{color:C.champagne,fontFamily:C.display,fontSize:20,fontWeight:700,marginBottom:16}}>{newFollowers!=null?`+${fmtNum(newFollowers)}`:"—"}</div>
          {followSeries.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={followSeries}>
                <XAxis dataKey="d" tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24}/>
                <YAxis tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false} width={36}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="v" name="Novos seguidores" fill={C.champagne} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState>{ig.loading?"Carregando...":"A Meta só fornece esta série para contas com 100+ seguidores."}</EmptyState>}
        </div>

        <div className="glass" style={{borderRadius:18,padding:22,gridColumn:"1/-1"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <div style={sectionLabel}>Interações nos últimos 12 posts</div>
            <div style={{display:"flex",gap:16}}>
              {[{label:"Curtidas",color:C.accentHi},{label:"Comentários",color:C.wine}].map(l => (
                <div key={l.label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:2,background:l.color}}/>
                  <span style={{color:C.text2,fontSize:11,fontFamily:C.font}}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          {postBars.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={postBars} barGap={3}>
                <XAxis dataKey="d" tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false} tickFormatter={fmtNum} width={40}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="likes"    name="Curtidas"    stackId="a" fill={C.accentHi}/>
                <Bar dataKey="comments" name="Comentários" stackId="a" fill={C.wine} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState height={180}>{ig.loading?"Carregando...":"Conecte o Instagram para ver o desempenho dos posts."}</EmptyState>}
        </div>
      </div>

      <div className="glass" style={{borderRadius:18,padding:22}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div style={sectionLabel}>Posts recentes — @aurum.cinema</div>
          {posts.length>0&&<span style={{background:`${C.success}20`,color:C.success,fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:7,fontFamily:C.font}}>● AO VIVO</span>}
        </div>
        {posts.length===0 && <EmptyState height={100}>{ig.loading?"Carregando...":"Nenhum post carregado."}</EmptyState>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {posts.slice(0,8).map(post => (
            <div key={post.id} className="card-animate"
              style={{display:"flex",alignItems:"center",gap:16,background:C.card,borderRadius:14,padding:"12px 16px",border:`1px solid ${C.border}`,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"44";e.currentTarget.style.background=C.cardHi;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
              {(post.thumbnail_url || (post.media_type!=="VIDEO" && post.media_url)) ? (
                <img src={post.thumbnail_url||post.media_url} alt="" loading="lazy"
                  style={{width:44,height:44,borderRadius:10,objectFit:"cover",flexShrink:0,border:`1px solid ${C.border}`}}/>
              ) : <div style={{width:44,height:44,borderRadius:10,background:C.cardHi,flexShrink:0}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:C.text1,fontFamily:C.font,fontSize:13,fontWeight:700,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {post.caption ? post.caption.split("\n")[0] : "—"}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{background:`${C.accent}20`,color:C.accent,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:6,fontFamily:C.font}}>{(post.media_product_type==="REELS"?"reels":post.media_type||"").toLowerCase()}</span>
                  <span style={{color:C.text3,fontSize:11,fontFamily:C.fontBody}}>{new Date(post.timestamp).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:16,flexShrink:0}}>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.text1,fontFamily:C.font,fontSize:13,fontWeight:800}}>{fmtNum(post.like_count||0)}</div>
                  <div style={{color:C.text3,fontSize:10,fontFamily:C.fontBody}}>curtidas</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.accent,fontFamily:C.font,fontSize:13,fontWeight:800}}>{fmtNum(post.comments_count||0)}</div>
                  <div style={{color:C.text3,fontSize:10,fontFamily:C.fontBody}}>comentários</div>
                </div>
                {post.permalink && (
                  <a href={post.permalink} target="_blank" rel="noreferrer"
                    style={{alignSelf:"center",color:C.text3,fontSize:12,textDecoration:"none",background:C.border,padding:"4px 10px",borderRadius:8,transition:"color 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.color=C.accent}
                    onMouseLeave={e=>e.currentTarget.style.color=C.text3}>↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
        {d?.errors?.length>0 && (
          <div style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginTop:14}}>Algumas métricas não vieram da Meta: {d.errors.join(" · ")}</div>
        )}
      </div>
    </div>
  );
}

/* ─── COMPETITORS VIEW (business_discovery ao vivo) ─── */
const handleOf = c => (c.handle||"").replace(/^@/,"").toLowerCase();

function CompetitorsView({competitors, ig, onAdd, onRemove}) {
  const usernames = competitors.filter(c=>c.platform==="instagram"&&handleOf(c)).map(handleOf).sort().join(",");
  const live = useApi(usernames ? `/api/instagram?endpoint=competitors&usernames=${encodeURIComponent(usernames)}` : null);
  const byUser = Object.fromEntries((live.data?.items||[]).map(i=>[i.username,i]));
  const getPlatformColor = p => ({instagram:"#E1306C",youtube:"#FF0000",tiktok:"#69C9D0",facebook:"#1877F2"}[p]||C.accent);
  const getPlatformLabel = p => ({instagram:"Instagram",youtube:"YouTube",tiktok:"TikTok",facebook:"Facebook"}[p]||p);

  const own = ig.data?.profile ? {
    followers: ig.data.profile.followers_count, engagementRate: ig.data.engagementRate, postsPerWeek: ig.data.postsPerWeek,
  } : null;

  const bannerState = live.error?.code==="needs_facebook"
    ? {...live, error:{message:"Métricas de concorrentes exigem token do fluxo Facebook Login (EAA...). Veja o README."}}
    : live;

  return (
    <div>
      <ApiBanner state={bannerState} label="Concorrentes (Instagram)" onRetry={live.reload}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {own && (
          <div className="glass card-animate" style={{borderRadius:18,padding:20,border:`1px solid ${C.accent}55`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,background:`radial-gradient(circle,${C.accent}25 0%,transparent 70%)`}}/>
            <div style={{color:C.accent,fontFamily:C.display,fontSize:15,fontWeight:700,marginBottom:4}}>Aurum Cinema</div>
            <div style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginBottom:12}}>@aurum.cinema · referência</div>
            <CompetitorStats followers={own.followers} engagementRate={own.engagementRate} postsPerWeek={own.postsPerWeek}/>
          </div>
        )}
        {competitors.map(comp => {
          const plColor = getPlatformColor(comp.platform);
          const m = byUser[handleOf(comp)];
          return (
            <div key={comp.id} className="glass card-animate"
              style={{borderRadius:18,padding:20,transition:"all 0.25s",position:"relative",overflow:"hidden"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 0 28px ${plColor}18,0 16px 40px rgba(0,0,0,0.5)`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="";}}>
              <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,background:`radial-gradient(circle,${plColor}15 0%,transparent 70%)`}}/>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,gap:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center",minWidth:0}}>
                  {m?.picture && <img src={m.picture} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:`1px solid ${C.border}`}}/>}
                  <div style={{minWidth:0}}>
                    <div style={{color:C.text1,fontFamily:C.display,fontSize:15,fontWeight:700,marginBottom:4}}>{comp.name}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{background:`${plColor}20`,color:plColor,fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:7,fontFamily:C.font}}>{getPlatformLabel(comp.platform)}</span>
                      {comp.handle&&(
                        <a href={comp.platform==="instagram"?`https://instagram.com/${handleOf(comp)}`:undefined} target="_blank" rel="noreferrer"
                          style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,textDecoration:"none"}}>{comp.handle}</a>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={()=>onRemove(comp.id)} title="Remover concorrente"
                  style={{background:"transparent",border:"none",color:C.text3,cursor:"pointer",fontSize:12,padding:4}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.danger}
                  onMouseLeave={e=>e.currentTarget.style.color=C.text3}>✕</button>
              </div>
              {comp.location&&(
                <div style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginBottom:12,borderLeft:`2px solid ${C.border}`,paddingLeft:8}}>📍 {comp.location}</div>
              )}
              {m && !m.ok && (
                <div style={{color:C.warn,fontSize:11,fontFamily:C.fontBody,marginBottom:10}}>⚠ Perfil não encontrado ou não é conta profissional — confira o @.</div>
              )}
              {live.loading && !m
                ? <div className="skeleton" style={{height:110}}/>
                : <CompetitorStats followers={m?.followers} engagementRate={m?.engagementRate} postsPerWeek={m?.postsPerWeek} lastPost={m?.lastPost}
                    compareTo={own}/>}
            </div>
          );
        })}
        <button onClick={onAdd}
          style={{borderRadius:18,border:`1px dashed ${C.border}`,background:"transparent",padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",minHeight:200,transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=`${C.accent}08`;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
          <div style={{width:40,height:40,borderRadius:12,border:`1px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.text3,fontSize:20}}>+</div>
          <span style={{color:C.text3,fontFamily:C.font,fontSize:12,fontWeight:700}}>Adicionar Concorrente</span>
        </button>
      </div>
    </div>
  );
}

function CompetitorStats({followers, engagementRate, postsPerWeek, lastPost, compareTo}) {
  const vs = (val, ref) => (compareTo && val!=null && ref!=null)
    ? <span style={{color:val>ref?C.danger:C.success,fontSize:10,marginLeft:6}}>{val>ref?"▲":"▼"} vs Aurum</span> : null;
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{background:C.card,borderRadius:12,padding:"10px 14px"}}>
        <div style={{color:C.text1,fontFamily:C.display,fontSize:16,fontWeight:700}}>{fmtNum(followers)}</div>
        <div style={{color:C.text3,fontSize:10,fontFamily:C.fontBody,marginTop:2}}>seguidores{vs(followers, compareTo?.followers)}</div>
      </div>
      <div style={{background:C.card,borderRadius:12,padding:"10px 14px"}}>
        <div style={{color:C.accent,fontFamily:C.display,fontSize:16,fontWeight:700}}>{fmtPct(engagementRate)}</div>
        <div style={{color:C.text3,fontSize:10,fontFamily:C.fontBody,marginTop:2}}>engajamento{vs(engagementRate, compareTo?.engagementRate)}</div>
      </div>
      <div style={{background:C.card,borderRadius:12,padding:"10px 14px",gridColumn:"1/-1",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{color:C.text2,fontSize:11,fontFamily:C.fontBody}}>Posts por semana{lastPost?<span style={{color:C.text3}}> · último {timeAgo(lastPost)}</span>:null}</div>
        <div style={{color:C.text1,fontFamily:C.font,fontSize:14,fontWeight:800}}>{postsPerWeek ?? "—"}</div>
      </div>
    </div>
  );
}

/* ─── MOVIES VIEW (TMDB via /api/movies) ─── */
const MOVIE_TABS = [
  {id:"trending",   label:"Em alta na semana", hint:"Mais buscados no mundo (TMDB)"},
  {id:"nowPlaying", label:"Em cartaz no Brasil", hint:"Lançados recentemente nos cinemas BR"},
  {id:"upcoming",   label:"Próximas estreias",  hint:"Data de estreia no Brasil"},
];

function MoviesView({movies}) {
  const [tab, setTab] = useState("trending");
  const list = movies.data?.[tab] || [];
  const state = movies.error?.code==="not_configured"
    ? {...movies, error:{message:"falta configurar TMDB_API_KEY no Vercel (veja o README)."}}
    : movies;
  return (
    <div>
      <ApiBanner state={state} label="Filmes (TMDB)" onRetry={movies.reload}/>
      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
        {MOVIE_TABS.map(t => {
          const active = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:"6px 16px",borderRadius:10,fontSize:12,fontWeight:700,fontFamily:C.font,border:`1px solid ${active?C.accent:C.border}`,background:active?`${C.accent}18`:"transparent",color:active?C.accent:C.text2,cursor:"pointer"}}>
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginBottom:20}}>{MOVIE_TABS.find(t=>t.id===tab).hint}</div>
      {movies.loading && !list.length && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:16}}>
          {Array.from({length:10}).map((_,i)=><div key={i} className="skeleton" style={{aspectRatio:"2/3",borderRadius:14}}/>)}
        </div>
      )}
      {!movies.loading && !list.length && <EmptyState height={140}>Nenhum filme carregado.</EmptyState>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:16}}>
        {list.map((m,i) => (
          <a key={m.id} href={m.url} target="_blank" rel="noreferrer" title={m.overview} className="card-animate"
            style={{textDecoration:"none",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{position:"relative",aspectRatio:"2/3",borderRadius:14,overflow:"hidden",background:C.card,border:`1px solid ${C.border}`}}>
              {m.poster
                ? <img src={m.poster} alt={m.title} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:C.text3,fontSize:11,padding:10,textAlign:"center"}}>{m.title}</div>}
              {tab==="trending"&&<span style={{position:"absolute",top:8,left:8,background:"rgba(12,11,9,0.85)",color:C.accent,fontFamily:C.display,fontWeight:700,fontSize:13,padding:"2px 8px",borderRadius:8}}>#{i+1}</span>}
              {m.rating!=null&&<span style={{position:"absolute",top:8,right:8,background:"rgba(12,11,9,0.85)",color:m.rating>=7?C.success:m.rating>=5.5?C.accentHi:C.danger,fontFamily:C.font,fontWeight:800,fontSize:11,padding:"2px 8px",borderRadius:8}}>★ {m.rating.toLocaleString("pt-BR")}</span>}
            </div>
            <div>
              <div style={{color:C.text1,fontFamily:C.font,fontSize:12,fontWeight:700,lineHeight:1.3}}>{m.title}</div>
              <div style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginTop:2}}>
                {m.releaseDate ? new Date(m.releaseDate+"T12:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}) : "sem data"}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── NEWS VIEW (Google News RSS via /api/news) ─── */
function NewsView({newsApi, readIds, onToggleRead}) {
  const [catFilter, setCatFilter] = useState("all");
  const [q, setQ] = useState("");
  const items = newsApi.data?.items || [];
  const isRead = n => readIds.includes(n.id);
  const filtered = items
    .filter(n => catFilter==="all" || n.category===catFilter)
    .filter(n => !q || `${n.title} ${n.source}`.toLowerCase().includes(q.toLowerCase()));
  const unreadCount = filtered.filter(n=>!isRead(n)).length;

  return (
    <div>
      <ApiBanner state={newsApi} label="Notícias (Google News)" onRetry={newsApi.reload}/>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}>
        {NEWS_CATS.map(cat => {
          const active = catFilter===cat.id;
          return (
            <button key={cat.id} onClick={()=>setCatFilter(cat.id)}
              style={{padding:"6px 16px",borderRadius:10,fontSize:12,fontWeight:700,fontFamily:C.font,border:`1px solid ${active?cat.color:C.border}`,background:active?`${cat.color}18`:"transparent",color:active?cat.color:C.text2,cursor:"pointer",transition:"all 0.15s"}}>
              {cat.label}
            </button>
          );
        })}
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." style={{...inputSt,width:180,padding:"6px 12px",fontSize:12,borderRadius:10}}/>
        {unreadCount>0&&(
          <div style={{marginLeft:"auto",background:`${C.accent}18`,border:`1px solid ${C.accent}30`,borderRadius:10,padding:"6px 14px",display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.accent}}/>
            <span style={{color:C.accent,fontFamily:C.font,fontSize:12,fontWeight:700}}>{unreadCount} não lidas</span>
          </div>
        )}
      </div>
      {newsApi.loading && !items.length && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
          {Array.from({length:6}).map((_,i)=><div key={i} className="skeleton" style={{height:120,borderRadius:16}}/>)}
        </div>
      )}
      {!newsApi.loading && !filtered.length && <EmptyState height={140}>{items.length?"Nenhuma notícia com esse filtro.":"Nenhuma notícia carregada."}</EmptyState>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
        {filtered.map(item => {
          const cat = NEWS_CATS.find(c=>c.id===item.category)||NEWS_CATS[1];
          const read = isRead(item);
          return (
            <div key={item.id} className="glass card-animate"
              style={{borderRadius:16,padding:18,transition:"all 0.25s",position:"relative",opacity:read?0.65:1,borderLeft:!read?`3px solid ${C.accent}`:"3px solid transparent",display:"flex",flexDirection:"column"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.opacity="1";e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity=read?"0.65":"1";e.currentTarget.style.boxShadow="";}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{background:`${cat.color}20`,color:cat.color,fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:7,fontFamily:C.font}}>{cat.label}</span>
                <span style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginLeft:"auto"}}>{timeAgo(item.publishedAt)}</span>
              </div>
              <a href={item.link} target="_blank" rel="noreferrer" onClick={()=>!read&&onToggleRead(item.id)}
                style={{color:C.text1,fontFamily:C.font,fontSize:13,fontWeight:700,lineHeight:1.45,marginBottom:12,textDecoration:"none",flex:1}}
                onMouseEnter={e=>e.currentTarget.style.color=C.accent}
                onMouseLeave={e=>e.currentTarget.style.color=C.text1}>{item.title} ↗</a>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.source}</span>
                <button onClick={()=>onToggleRead(item.id)}
                  style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 12px",color:read?C.text3:C.accent,fontSize:11,fontFamily:C.font,fontWeight:700,cursor:"pointer",transition:"all 0.15s",flexShrink:0}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHi}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  {read?"Lida":"Marcar lida"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ─── APP ─── */
export default function App() {
  const [view,        setView]        = useState("overview");
  const [projects,    setProjects]    = useState(iProjects);
  const [tasks,       setTasks]       = useState(iTasks);
  const [content,     setContent]     = useState(iContent);
  const [competitors, setCompetitors] = useState(() => store.get("aurum.competitors", iCompetitors));
  const [readIds,     setReadIds]     = useState(() => store.get("aurum.newsRead", []));
  const [col,         setCol]         = useState(false);
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState({});

  const setPSt = (id,s) => setProjects(ps=>ps.map(p=>p.id===id?{...p,status:s}:p));
  const setPPr = (id,p) => setProjects(ps=>ps.map(pr=>pr.id===id?{...pr,priority:p}:pr));
  const setCSt = (id,s) => setContent(cs=>cs.map(c=>c.id===id?{...c,status:s}:c));
  const toggleTask = id => setTasks(ts=>ts.map(t=>t.id===id?{...t,status:t.status==="concluido"?"andamento":"concluido"}:t));
  const toggleRead = id => setReadIds(ids => ids.includes(id) ? ids.filter(x=>x!==id) : [id, ...ids].slice(0,500));
  const removeCompetitor = id => setCompetitors(cs=>cs.filter(c=>c.id!==id));

  const ig      = useInstagram();
  const newsApi = useNews();
  const movies  = useMovies();

  useEffect(() => { store.set("aurum.competitors", competitors); }, [competitors]);
  useEffect(() => { store.set("aurum.newsRead", readIds); }, [readIds]);

  const openModal = (type, defaultStatus) => {
    setModal(type);
    if (type==="project")    setForm({name:"",client:"Aurum Cinema",status:defaultStatus||"backlog",priority:"normal",deadline:"",desc:""});
    else if (type==="task")  setForm({title:"",projectId:defaultStatus||projects[0]?.id||1,assignee:"",status:"backlog",priority:"normal",deadline:""});
    else if (type==="content") setForm({title:"",platform:"instagram",type:"feed",status:defaultStatus||"ideia",date:"",caption:""});
    else if (type==="competitor") setForm({name:"",platform:"instagram",handle:"",location:""});
  };

  const submitModal = () => {
    if (modal==="project")       setProjects(ps=>[...ps,{...form,id:nPid++,name:form.name||"Novo Projeto"}]);
    else if (modal==="task")     setTasks(ts=>[...ts,{...form,id:nTid++,title:form.title||"Nova Tarefa",projectId:Number(form.projectId)}]);
    else if (modal==="content")  setContent(cs=>[...cs,{...form,id:nCid++,title:form.title||"Novo Conteúdo"}]);
    else if (modal==="competitor") setCompetitors(cs=>[...cs,{
      id:Date.now(),
      name:form.name||"Novo Concorrente",
      handle:form.handle?`@${form.handle.replace(/^@/,"")}`:undefined,
      platform:form.platform||"instagram",
      location:form.location||"",
    }]);
    setModal(null);
  };

  const stats = useMemo(() => ({
    active:    projects.filter(p=>["andamento","producao","revisao","aprovacao"].includes(p.status)).length,
    done:      projects.filter(p=>p.status==="concluido").length,
    urgent:    [...projects,...tasks].filter(x=>x.priority==="urgente").length,
    total:     projects.length,
    tdone:     tasks.filter(t=>t.status==="concluido").length,
    topen:     tasks.filter(t=>!["concluido","cancelado"].includes(t.status)).length,
    scheduled: content.filter(c=>c.status==="agendado").length,
    ctotal:    content.length,
  }), [projects, tasks, content]);

  const nav = [
    {id:"overview",    icon:"◈", label:"Visão Geral"},
    {id:"projects",    icon:"⬡", label:"Projetos"},
    {id:"content",     icon:"✦", label:"Conteúdo"},
    {id:"calendar",    icon:"▦", label:"Calendário"},
    {id:"analytics",   icon:"▲", label:"Analytics"},
    {id:"competitors", icon:"◉", label:"Concorrentes"},
    {id:"movies",      icon:"★", label:"Filmes"},
    {id:"news",        icon:"◫", label:"Notícias"},
  ];

  // Badge conta só notícias não lidas das últimas 24h
  const unreadNews = (newsApi.data?.items||[]).filter(n=>!readIds.includes(n.id)&&Date.now()-new Date(n.publishedAt)<86400000).length;
  const igProfile = ig.data?.profile;
  const overviewReach = (ig.data?.series?.reach||[]).map(x=>({d:fmtDay(x.date), v:x.value}));

  return (
    <div style={{background:C.bg,color:C.text1,fontFamily:C.fontBody,display:"flex",height:"100vh",overflow:"hidden",position:"relative"}}>
      <BackgroundBlobs/>
      <MouseGlow/>

      {/* ── SIDEBAR ── */}
      <aside className="glass" style={{borderRight:`1px solid rgba(201,169,79,0.08)`,width:col?60:228,flexShrink:0,display:"flex",flexDirection:"column",transition:"width 0.25s cubic-bezier(.4,0,.2,1)",overflow:"hidden",position:"relative",zIndex:10}}>
        {/* Logo */}
        <div style={{borderBottom:`1px solid ${C.border}`,padding:col?"14px 10px":"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:64}}>
          {col
            ? <img src="/au-symbol.svg" alt="Aurum Cinema" style={{height:26,margin:"0 auto"}}/>
            : <img src="/logo-aurum-branca.svg" alt="Aurum Cinema" style={{height:44,objectFit:"contain"}}/>
          }
          {!col&&<button onClick={()=>setCol(s=>!s)} style={{color:C.text3,fontSize:10,background:C.card,border:`1px solid ${C.border}`,cursor:"pointer",borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>◀</button>}
        </div>
        {col&&<button onClick={()=>setCol(false)} style={{color:C.text3,fontSize:10,background:C.card,border:`1px solid ${C.border}`,cursor:"pointer",margin:"8px auto",borderRadius:6,width:32,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>▶</button>}

        {/* Nav */}
        <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:2}}>
          {nav.map(item => {
            const active = view===item.id;
            const showBadge = item.id==="news"&&unreadNews>0;
            return (
              <button key={item.id} onClick={()=>setView(item.id)}
                style={{background:active?C.accentDim:"transparent",color:active?C.accent:C.text2,fontFamily:C.font,width:"100%",display:"flex",alignItems:"center",gap:10,padding:col?"10px 0":"9px 14px",justifyContent:col?"center":"flex-start",borderRadius:12,fontSize:13,fontWeight:active?800:600,cursor:"pointer",border:"none",borderLeft:active&&!col?`2px solid ${C.accent}`:"2px solid transparent",transition:"all 0.15s",position:"relative"}}>
                <span style={{fontSize:14}}>{item.icon}</span>
                {!col&&<span>{item.label}</span>}
                {showBadge&&(
                  <span style={{marginLeft:"auto",background:C.accent,color:"#1B1408",fontFamily:C.font,fontSize:9,fontWeight:900,padding:"2px 6px",borderRadius:99,minWidth:18,textAlign:"center"}}>
                    {unreadNews}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!col&&<div style={{borderTop:`1px solid ${C.border}`,padding:"12px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:ig.data?C.success:ig.loading?C.accent:C.warn}}/>
            <span style={{color:C.text3,fontSize:10,fontFamily:C.font,fontWeight:600}}>Instagram {ig.data?"conectado":ig.loading?"conectando":"offline"}</span>
          </div>
          <a href="https://www.aurumcinema.com.br" target="_blank" rel="noreferrer" style={{color:C.text3,fontSize:10,fontFamily:C.font,fontWeight:600,textDecoration:"none"}}>aurumcinema.com.br ↗</a>
        </div>}
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,overflowY:"auto",position:"relative",zIndex:5}}>
        {/* Topbar */}
        <div className="glass" style={{borderBottom:`1px solid rgba(201,169,79,0.06)`,position:"sticky",top:0,zIndex:10,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <h1 style={{fontFamily:C.display,color:C.text1,fontSize:18,fontWeight:700,margin:0,letterSpacing:"0.02em"}}>
              {nav.find(n=>n.id===view)?.label}
            </h1>
            <p style={{color:C.text3,fontSize:11,margin:0,marginTop:2,fontFamily:C.fontBody}}>Aurum Cinema · @aurum.cinema</p>
          </div>
          {view==="projects"&&(
            <button className="glow-btn" onClick={()=>openModal("project")}
              style={{fontFamily:C.font,fontWeight:900,fontSize:12,padding:"9px 20px",borderRadius:12,border:"none",cursor:"pointer",letterSpacing:"0.02em"}}>
              + Novo Projeto
            </button>
          )}
          {view==="competitors"&&(
            <button className="glow-btn" onClick={()=>openModal("competitor")}
              style={{fontFamily:C.font,fontWeight:900,fontSize:12,padding:"9px 20px",borderRadius:12,border:"none",cursor:"pointer",letterSpacing:"0.02em"}}>
              + Adicionar Concorrente
            </button>
          )}
        </div>

        <div style={{padding:28}}>

          {/* ── OVERVIEW ── */}
          {view==="overview"&&<>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:28}}>
              <StatCard label="Em execução"    value={stats.active}    accent={C.accent}/>
              <StatCard label="Concluídos"     value={stats.done}      accent={C.success}/>
              <StatCard label="Urgentes"       value={stats.urgent}    accent={C.danger}/>
              <StatCard label="Total Projetos" value={stats.total}     accent={C.info}/>
              <StatCard label="Tasks abertas"  value={stats.topen}     accent={C.champagne}/>
              <StatCard label="Tasks feitas"   value={stats.tdone}     accent={C.success}/>
              <StatCard label="Conteúdos"      value={stats.ctotal}    accent={C.wine}/>
              <StatCard label="Agendados"      value={stats.scheduled} accent={C.accentHi}/>
            </div>

            {/* Instagram + Mix */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:16}}>
              <div className="glass" style={{borderRadius:18,padding:22,display:"flex",alignItems:"center",gap:20,cursor:"pointer"}} onClick={()=>setView("analytics")}>
                <div style={{flex:1}}>
                  <div style={{...sectionLabel,marginBottom:6}}>Seguidores Instagram</div>
                  <div style={{color:C.accent,fontFamily:C.display,fontSize:36,fontWeight:700,lineHeight:1}}>{ig.loading?"…":fmtNum(igProfile?.followers_count)}</div>
                  <div style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginTop:8}}>{igProfile?`@${igProfile.username}`:ig.loading?"conectando...":"Instagram não conectado"}</div>
                </div>
                <div style={{width:1,height:60,background:C.border}}/>
                <div style={{flex:1}}>
                  <div style={{...sectionLabel,marginBottom:6}}>Alcance · 28d</div>
                  <div style={{color:C.champagne,fontFamily:C.display,fontSize:36,fontWeight:700,lineHeight:1}}>{ig.loading?"…":fmtNum(ig.data?.totals?.reach)}</div>
                  <div style={{color:C.text3,fontSize:11,fontFamily:C.fontBody,marginTop:8}}>engajamento {fmtPct(ig.data?.engagementRate)}</div>
                </div>
              </div>

              <div className="glass" style={{borderRadius:18,padding:22}}>
                <div style={{...sectionLabel,marginBottom:16}}>Mix de Conteúdo (planejado)</div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <div style={{width:130,height:130,flexShrink:0}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={4} dataKey="value">
                          {pieData.map((e,i) => <Cell key={i} fill={e.color} stroke="transparent"/>)}
                        </Pie>
                        <Tooltip content={<CustomTooltip/>}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,flex:1}}>
                    {pieData.map(d => (
                      <div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:d.color}}/>
                          <span style={{color:C.text2,fontSize:11,fontFamily:C.fontBody}}>{d.name}</span>
                        </div>
                        <span style={{color:d.color,fontSize:11,fontFamily:C.font,fontWeight:800}}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16}}>
              {/* Alcance diário */}
              <div className="glass" style={{borderRadius:18,padding:22}}>
                <div style={{...sectionLabel,marginBottom:16}}>Alcance diário — Instagram</div>
                {overviewReach.length ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={overviewReach}>
                      <defs><linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.accent} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={C.accent} stopOpacity={0}/>
                      </linearGradient></defs>
                      <XAxis dataKey="d" tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24}/>
                      <YAxis tick={{fill:C.text3,fontSize:11,fontFamily:C.font}} axisLine={false} tickLine={false} tickFormatter={fmtNum} width={44}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Area type="monotone" dataKey="v" name="Alcance" stroke={C.accent} strokeWidth={2} fill="url(#aG)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyState height={180}>{ig.loading?"Carregando...":"Conecte o Instagram para ver o alcance diário."}</EmptyState>}
              </div>

              {/* Últimas notícias */}
              <div className="glass" style={{borderRadius:18,padding:22}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={sectionLabel}>Últimas do setor</div>
                  <button onClick={()=>setView("news")} style={{background:"transparent",border:"none",color:C.accent,fontSize:11,fontFamily:C.font,fontWeight:700,cursor:"pointer"}}>ver todas →</button>
                </div>
                {(newsApi.data?.items||[]).slice(0,5).map(n => (
                  <a key={n.id} href={n.link} target="_blank" rel="noreferrer" onClick={()=>!readIds.includes(n.id)&&toggleRead(n.id)}
                    style={{display:"block",padding:"8px 0",borderBottom:`1px solid ${C.border}`,textDecoration:"none"}}>
                    <div style={{color:readIds.includes(n.id)?C.text3:C.text1,fontSize:12,fontFamily:C.font,fontWeight:600,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                    <div style={{color:C.text3,fontSize:10,fontFamily:C.fontBody,marginTop:2}}>{n.source} · {timeAgo(n.publishedAt)}</div>
                  </a>
                ))}
                {!newsApi.data && <EmptyState height={150}>{newsApi.loading?"Carregando notícias...":"Notícias indisponíveis."}</EmptyState>}
              </div>
            </div>
          </>}

          {/* ── PROJECTS ── */}
          {view==="projects"&&(
            <ProjectKanban
              projects={projects} tasks={tasks}
              onProjStatus={setPSt} onProjPriority={setPPr}
              onTaskToggle={toggleTask}
              onAddTask={pid=>openModal("task",pid)}
              onAddProject={s=>openModal("project",s)}/>
          )}

          {/* ── CONTENT ── */}
          {view==="content"&&<ContentManager content={content} onStatusChange={setCSt} onAdd={s=>openModal("content",s)}/>}

          {/* ── CALENDAR ── */}
          {view==="calendar"&&<CalendarView content={content}/>}

          {/* ── ANALYTICS (Instagram real) ── */}
          {view==="analytics"&&<AnalyticsView ig={ig}/>}

          {/* ── COMPETITORS ── */}
          {view==="competitors"&&<CompetitorsView competitors={competitors} ig={ig} onAdd={()=>openModal("competitor")} onRemove={removeCompetitor}/>}

          {/* ── MOVIES (TMDB) ── */}
          {view==="movies"&&<MoviesView movies={movies}/>}

          {/* ── NEWS ── */}
          {view==="news"&&<NewsView newsApi={newsApi} readIds={readIds} onToggleRead={toggleRead}/>}

        </div>
      </main>

      {/* ── MODAL ── */}
      {modal&&(
        <Modal
          title={
            modal==="project"    ?"Novo Projeto"        :
            modal==="task"       ?"Nova Tarefa"         :
            modal==="content"    ?"Novo Conteúdo"       :
            modal==="competitor" ?"Adicionar Concorrente":""}
          onClose={()=>setModal(null)}>

          {modal==="project"&&<>
            <Field label="Nome do projeto"><input style={inputSt} value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Campanha Semana do Cinema" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
            <Field label="Descrição"><input style={inputSt} value={form.desc||""} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Breve descrição" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Status"><select style={{...inputSt,cursor:"pointer"}} value={form.status||"backlog"} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
              <Field label="Prioridade"><select style={{...inputSt,cursor:"pointer"}} value={form.priority||"normal"} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>{PRIORITY.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
            </div>
            <Field label="Prazo"><input style={inputSt} type="date" value={form.deadline||""} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/></Field>
          </>}

          {modal==="task"&&<>
            <Field label="Título da tarefa"><input style={inputSt} value={form.title||""} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Ex: Criar reels para estreia" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
            <Field label="Projeto"><select style={{...inputSt,cursor:"pointer"}} value={form.projectId||""} onChange={e=>setForm(f=>({...f,projectId:e.target.value}))}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Responsável"><input style={inputSt} value={form.assignee||""} onChange={e=>setForm(f=>({...f,assignee:e.target.value}))} placeholder="Nome do responsável" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Prioridade"><select style={{...inputSt,cursor:"pointer"}} value={form.priority||"normal"} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>{PRIORITY.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
              <Field label="Prazo"><input style={inputSt} type="date" value={form.deadline||""} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/></Field>
            </div>
          </>}

          {modal==="content"&&<>
            <Field label="Título"><input style={inputSt} value={form.title||""} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Ex: Reel pré-estreia" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Plataforma"><select style={{...inputSt,cursor:"pointer"}} value={form.platform||"instagram"} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
              <Field label="Tipo"><select style={{...inputSt,cursor:"pointer"}} value={form.type||"feed"} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="feed">Feed</option><option value="stories">Stories</option><option value="reels">Reels</option>
                <option value="video">Vídeo</option><option value="post">Post</option><option value="shorts">Shorts</option>
              </select></Field>
            </div>
            <Field label="Status"><select style={{...inputSt,cursor:"pointer"}} value={form.status||"ideia"} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{CONTENT_STATUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
            <Field label="Data de publicação"><input style={inputSt} type="date" value={form.date||""} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></Field>
            <Field label="Legenda"><textarea style={{...inputSt,resize:"vertical",minHeight:80}} value={form.caption||""} onChange={e=>setForm(f=>({...f,caption:e.target.value}))} placeholder="Escreva a legenda aqui..." onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
          </>}

          {modal==="competitor"&&<>
            <Field label="Nome / Marca"><input style={inputSt} value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Cinemark Flamboyant" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
            <Field label="Plataforma"><select style={{...inputSt,cursor:"pointer"}} value={form.platform||"instagram"} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
            <Field label="Handle / @username"><input style={inputSt} value={form.handle||""} onChange={e=>setForm(f=>({...f,handle:e.target.value}))} placeholder="Ex: cinemarkoficial (sem @)" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
            <Field label="Localização"><input style={inputSt} value={form.location||""} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Ex: Shopping Flamboyant" onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}/></Field>
          </>}

          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
            <button onClick={()=>setModal(null)} style={{padding:"10px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",color:C.text2,fontSize:13,fontFamily:C.font,fontWeight:700,cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHi} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>Cancelar</button>
            <button className="glow-btn" onClick={submitModal} style={{padding:"10px 22px",borderRadius:12,border:"none",fontSize:13,fontFamily:C.font,fontWeight:900,cursor:"pointer",letterSpacing:"0.01em"}}>
              {modal==="competitor"?"Adicionar":"Criar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
