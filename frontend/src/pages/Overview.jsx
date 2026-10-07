import {motion} from 'framer-motion';
import {PoundSterling,Boxes,Users,Globe} from 'lucide-react';
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts';
import {api} from '../services/api';import useApi from '../hooks/useApi';
import {Card,Header,Count,Block,chartTip} from '../components/ui';import {money} from '../utils/format';
export default function Overview(){
 const k=useApi(api.kpis),m=useApi(()=>api.monthlyRevenue()),c=useApi(()=>api.countryRevenue({limit:5})),p=useApi(()=>api.topProducts({limit:5})),u=useApi(()=>api.topCustomers({limit:5}));
 return <>
  <Header title="Retail Intelligence" sub="Understand what happened, why it happened, and where to act next."/>
  <Block state={k} height="h-28">{d=>{
   const items=[['Total Revenue',d.total_revenue,PoundSterling,'Across all transactions',{fmt:money}],['Units Sold',d.units_sold,Boxes,'Items shipped',{fmt:x=>(x/1e6).toFixed(2)+'M'}],['Identified Customers',d.customers,Users,'With a customer ID',{}],['Countries',d.countries,Globe,'Markets served',{}]];
   return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(([l,v,I,s,o],i)=><motion.div key={l} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.08}}><Card><I size={16} className="text-accent" aria-label={l}/><div className="mt-3 text-3xl font-semibold tabular-nums"><Count to={v} {...o}/></div><div className="mt-1 text-sm">{l}</div><div className="text-xs text-zinc-500">{s}</div></Card></motion.div>)}</div>}}</Block>
  <h2 className="mb-3 mt-10 font-medium">Monthly revenue</h2>
  <Block state={m} height="h-80">{d=><Card className="h-80"><ResponsiveContainer><LineChart data={d}><CartesianGrid stroke="#27272a" vertical={false}/><XAxis dataKey="month" stroke="#71717a" fontSize={12}/><YAxis stroke="#71717a" fontSize={12} tickFormatter={money}/><Tooltip {...chartTip} formatter={v=>money(v)}/><Line type="monotone" dataKey="revenue" stroke="#7dd3fc" strokeWidth={2} dot={false} animationDuration={1200}/></LineChart></ResponsiveContainer></Card>}</Block>
  <div className="mt-10 grid gap-4 lg:grid-cols-3">
   {[['Top markets',c,'country','revenue'],['Top products',p,'product','revenue'],['Top customers',u,'customer_id','monetary']].map(([t,s,n,v])=><div key={t}><h2 className="mb-3 font-medium">{t}</h2><Block state={s} height="h-56">{d=><Card><ol className="space-y-3">{d.map((r,i)=><li key={i} className="flex justify-between gap-3 text-sm"><span className="truncate text-zinc-300">{i+1}. {r[n]}</span><span className="tabular-nums text-zinc-400">{money(r[v])}</span></li>)}</ol></Card>}</Block></div>)}
  </div></>;
}
