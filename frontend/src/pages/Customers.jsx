import {useState} from 'react';
import {X} from 'lucide-react';
import {api} from '../services/api';import useApi from '../hooks/useApi';
import {Header,Block,DataTable,Card} from '../components/ui';import {money} from '../utils/format';
const cols=[{k:'customer_id',label:'Customer ID'},{k:'recency',label:'Recency (days)'},{k:'frequency',label:'Frequency'},{k:'monetary',label:'Monetary',fmt:money},{k:'segment',label:'Segment'}];
function Detail({id,onClose,go}){
 const c=useApi(()=>api.customer(id),[id]);
 return <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-bg p-6" aria-label="Customer detail">
  <div className="mb-6 flex justify-between"><h2 className="text-lg font-semibold">Customer {id}</h2><button onClick={onClose} aria-label="Close panel"><X/></button></div>
  <Block state={c} height="h-48">{d=><div className="space-y-3 text-sm">{[['Recency',`${d.recency} days`],['Frequency',`${d.frequency} invoices`],['Monetary',money(d.monetary)],['Segment',d.segment]].map(([l,v])=><div key={l} className="flex justify-between border-b border-white/5 pb-2"><span className="text-zinc-400">{l}</span><span>{v}</span></div>)}
   <button onClick={()=>go('predict')} className="mt-4 w-full rounded-md bg-accent py-2 font-medium text-black">Open purchase prediction</button></div>}</Block></aside>;
}
export default function Customers({go}){
 const s=useApi(()=>api.topCustomers({limit:500}));const [q,setQ]=useState('');const [seg,setSeg]=useState('All');const [sel,setSel]=useState(null);
 return <><Header title="Customer Intelligence" sub="Find your most valuable, most frequent and highest-volume customers."/>
  <Block state={s}>{d=>{
   const best=(k)=>[...d].sort((a,b)=>b[k]-a[k])[0];
   const rows=d.filter(r=>String(r.customer_id).includes(q)&&(seg==='All'||r.segment===seg));
   return <><div className="mb-6 grid gap-4 sm:grid-cols-3">{[['Highest value customer','monetary'],['Most frequent customer','frequency']].map(([l,k])=><Card key={l}><div className="text-xs text-zinc-500">{l}</div><div className="mt-1 text-xl font-semibold">{best(k).customer_id}</div></Card>)}</div>
   <div className="mb-4 flex flex-wrap gap-3"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search customer ID" aria-label="Search customer ID" className="rounded-md border border-white/10 bg-surface px-3 py-2 text-sm"/><select value={seg} onChange={e=>setSeg(e.target.value)} aria-label="Filter by segment" className="rounded-md border border-white/10 bg-surface px-3 py-2 text-sm">{['All',...new Set(d.map(r=>r.segment))].map(x=><option key={x}>{x}</option>)}</select></div>
   <DataTable cols={cols} rows={rows} onRow={r=>setSel(r.customer_id)}/></>}}</Block>
  {sel&&<Detail id={sel} onClose={()=>setSel(null)} go={go}/>}</>;
}
