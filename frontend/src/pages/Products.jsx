import {useState} from 'react';
import {Search} from 'lucide-react';
import {api} from '../services/api';import useApi from '../hooks/useApi';
import {Header,Block,DataTable,Card} from '../components/ui';import {money,num} from '../utils/format';
const cols=[{k:'product',label:'Product'},{k:'revenue',label:'Revenue',fmt:money},{k:'quantity',label:'Units Sold',fmt:num},{k:'transactions',label:'Transactions',fmt:num},{k:'avg_price',label:'Average Price',fmt:v=>`£${Number(v).toFixed(2)}`}];
export default function Products(){
 const s=useApi(()=>api.topProducts({limit:200}));const [q,setQ]=useState('');
 return <><Header title="Product Intelligence" sub="Compare what earns the most with what sells the most."/>
  <Block state={s}>{d=>{
   const rev=[...d].sort((a,b)=>b.revenue-a.revenue)[0],vol=[...d].sort((a,b)=>b.quantity-a.quantity)[0],val=[...d].sort((a,b)=>b.avg_price-a.avg_price)[0];
   const rows=d.filter(r=>r.product.toLowerCase().includes(q.toLowerCase()));
   return <><div className="mb-6 grid gap-4 sm:grid-cols-3">{[['Highest revenue',rev.product],['Highest volume',vol.product],['Strong revenue, lower volume (highest avg. price)',val.product]].map(([l,v])=><Card key={l}><div className="text-xs text-zinc-500">{l}</div><div className="mt-1 text-sm font-medium">{v}</div></Card>)}</div>
   <div className="relative mb-4 max-w-sm"><Search size={14} className="absolute left-3 top-3 text-zinc-500" aria-hidden/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products" aria-label="Search products" className="w-full rounded-md border border-white/10 bg-surface py-2 pl-9 pr-3 text-sm"/></div>
   <DataTable cols={cols} rows={rows}/></>}}</Block></>;
}
