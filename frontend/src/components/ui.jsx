import {useEffect,useState,useMemo} from 'react';
import {motion,animate,useMotionValue,useTransform} from 'framer-motion';
import {AlertTriangle,ArrowUpDown} from 'lucide-react';
export const Card=({children,className='',...p})=><div {...p} className={`rounded-lg border border-white/10 bg-surface p-5 transition-colors hover:border-white/20 ${className}`}>{children}</div>;
export const Header=({title,sub})=><div className="mb-8"><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-xl text-zinc-400">{sub}</p></div>;
export function Count({to,prefix='',suffix='',dec=0,fmt}){
 const v=useMotionValue(0);
 const t=useTransform(v,x=>fmt?fmt(x):prefix+x.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})+suffix);
 useEffect(()=>{const c=animate(v,to,{duration:1.1,ease:'easeOut'});return c.stop},[to]);
 return <motion.span>{t}</motion.span>;
}
export function Block({state,height='h-64',children}){
 const {data,loading,error,reload}=state;
 if(loading)return <div className={`${height} animate-pulse rounded-lg bg-white/5`} role="status" aria-label="Loading"/>;
 if(error)return <Card className={`flex ${height} flex-col items-center justify-center gap-3 text-center`}><AlertTriangle className="text-amber-400" aria-label="Error"/><p className="text-zinc-300">Unable to load this data. Check that the API is running.</p><button onClick={reload} className="rounded-md border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10">Retry</button></Card>;
 if(!data||(Array.isArray(data)&&!data.length))return <Card className={`flex ${height} items-center justify-center text-zinc-500`}>No data available yet.</Card>;
 return children(data);
}
export function DataTable({cols,rows,onRow,pageSize=8}){
 const [sort,setSort]=useState(null);const [page,setPage]=useState(0);
 const sorted=useMemo(()=>sort?[...rows].sort((a,b)=>(a[sort.k]>b[sort.k]?1:-1)*sort.d):rows,[rows,sort]);
 const pages=Math.max(1,Math.ceil(sorted.length/pageSize));
 useEffect(()=>setPage(0),[rows]);
 return <div className="overflow-x-auto rounded-lg border border-white/10"><table className="w-full text-left text-sm">
  <thead className="bg-white/5 text-zinc-400"><tr>{cols.map(c=><th key={c.k} className="p-3 font-medium"><button className="inline-flex items-center gap-1" onClick={()=>setSort(s=>({k:c.k,d:s?.k===c.k?-s.d:-1}))} aria-label={`Sort by ${c.label}`}>{c.label}<ArrowUpDown size={12}/></button></th>)}</tr></thead>
  <tbody>{sorted.slice(page*pageSize,(page+1)*pageSize).map((r,i)=><tr key={i} tabIndex={onRow?0:undefined} onClick={()=>onRow?.(r)} onKeyDown={e=>e.key==='Enter'&&onRow?.(r)} className={`border-t border-white/5 ${onRow?'cursor-pointer hover:bg-white/5':''}`}>{cols.map(c=><td key={c.k} className="p-3">{c.fmt?c.fmt(r[c.k]):r[c.k]}</td>)}</tr>)}</tbody></table>
  <div className="flex items-center justify-between border-t border-white/10 p-3 text-xs text-zinc-400"><span>Page {page+1} of {pages}</span><div className="flex gap-2"><button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="rounded border border-white/20 px-3 py-1 disabled:opacity-30">Previous</button><button disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)} className="rounded border border-white/20 px-3 py-1 disabled:opacity-30">Next</button></div></div></div>;
}
export const chartTip={contentStyle:{background:'#18181b',border:'1px solid #3f3f46',borderRadius:8,color:'#fff'}};
