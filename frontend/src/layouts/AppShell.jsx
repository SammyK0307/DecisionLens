import {useState,useEffect} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {LayoutDashboard,TrendingUp,Package,Users,Network,Sparkles,Menu,X,RefreshCw} from 'lucide-react';
import {api,USE_MOCK,clearCache} from '../services/api';
export const NAV=[['overview','Overview',LayoutDashboard],['revenue','Revenue Intelligence',TrendingUp],['products','Product Intelligence',Package],['customers','Customer Intelligence',Users],['segments','Segmentation',Network],['predict','Predictive Intelligence',Sparkles]];
export default function AppShell({page,setPage,children,onRefresh}){
 const [open,setOpen]=useState(false);const [ok,setOk]=useState(null);
 useEffect(()=>{api.kpis().then(()=>setOk(true)).catch(()=>setOk(false));},[]);
 return <div className="min-h-screen lg:flex">
  <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-white/10 bg-bg p-5 transition-transform lg:static lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
   <div className="mb-10 flex items-center justify-between"><div><div className="text-lg font-semibold">DecisionLens</div><div className="text-xs text-zinc-500">Turn Retail Data Into Decisions.</div></div><button className="lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
   <nav className="space-y-1">{NAV.map(([k,l,I])=><button key={k} onClick={()=>{setPage(k);setOpen(false)}} aria-current={page===k} className={`relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm ${page===k?'text-white':'text-zinc-400 hover:text-white'}`}>{page===k&&<motion.span layoutId="nav" className="absolute inset-0 rounded-md bg-white/10"/>}<I size={16} className="relative" aria-label={l}/><span className="relative">{l}</span></button>)}</nav>
   <p className="absolute bottom-5 text-xs text-zinc-600">Analytics. Segmentation. Prediction.</p>
  </aside>
  <div className="min-w-0 flex-1">
   <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
    <button className="lg:hidden" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button>
    <div className="text-sm text-zinc-500">DecisionLens / {NAV.find(n=>n[0]===page)[1]}</div>
    <div className="flex items-center gap-4"><button onClick={()=>{clearCache();onRefresh()}} aria-label="Refresh data" className="text-zinc-400 hover:text-white"><RefreshCw size={16}/></button>
     <span className="flex items-center gap-2 text-xs"><span className={`h-2 w-2 rounded-full ${ok===null?'bg-zinc-500':ok?'bg-emerald-400':'bg-red-400'}`}/>{ok===null?'Checking':ok?(USE_MOCK?'Mock Data':'Data Connected'):'API Offline'}</span></div>
   </header>
   <main className="mx-auto max-w-6xl p-6 lg:p-10"><AnimatePresence mode="wait"><motion.div key={page} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.2}}>{children}</motion.div></AnimatePresence></main>
  </div></div>;
}
