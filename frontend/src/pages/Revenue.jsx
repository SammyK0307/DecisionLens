import {useState} from 'react';
import {LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts';
import {Lightbulb} from 'lucide-react';
import {api} from '../services/api';import useApi from '../hooks/useApi';
import {Card,Header,Block,chartTip} from '../components/ui';import {money} from '../utils/format';
const Bars=({data,k})=><ResponsiveContainer><BarChart data={data} layout="vertical" margin={{left:30}}><XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={money}/><YAxis type="category" dataKey={k} stroke="#a1a1aa" fontSize={11} width={130}/><Tooltip {...chartTip} formatter={v=>money(v)}/><Bar dataKey="revenue" fill="#7dd3fc" radius={[0,4,4,0]} animationDuration={900}/></BarChart></ResponsiveContainer>;
export default function Revenue(){
 const [n,setN]=useState(10);
 const m=useApi(()=>api.monthlyRevenue()),c=useApi(()=>api.countryRevenue({limit:n}),[n]),p=useApi(()=>api.topProducts({limit:n,sort:'revenue'}),[n]);
 const insight=d=>{const t=d.reduce((a,r)=>a+r.revenue,0),s=d[0].revenue/t*100;return `${d[0].country} contributes ${s.toFixed(1)}% of revenue among the top ${d.length} markets${s>60?', indicating strong market concentration':', suggesting a more diversified revenue base'}.`};
 return <>
  <Header title="Revenue Intelligence" sub="Explore where revenue comes from and how it changes over time."/>
  <label className="mb-6 flex items-center gap-2 text-sm text-zinc-400">Show top<select value={n} onChange={e=>setN(+e.target.value)} className="rounded border border-white/20 bg-surface px-2 py-1 text-white">{[5,10,15,20].map(x=><option key={x}>{x}</option>)}</select></label>
  <Block state={c} height="h-20">{d=><Card className="mb-6 flex gap-3 border-accent/30"><Lightbulb size={18} className="shrink-0 text-accent" aria-label="Insight"/><div><div className="text-sm font-medium">Decision Insight</div><p className="text-sm text-zinc-400">{insight(d)}</p></div></Card>}</Block>
  <Block state={m} height="h-72">{d=><Card className="h-72"><ResponsiveContainer><LineChart data={d}><CartesianGrid stroke="#27272a" vertical={false}/><XAxis dataKey="month" stroke="#71717a" fontSize={12}/><YAxis stroke="#71717a" fontSize={12} tickFormatter={money}/><Tooltip {...chartTip} formatter={v=>money(v)}/><Line type="monotone" dataKey="revenue" stroke="#7dd3fc" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></Card>}</Block>
  <div className="mt-6 grid gap-4 lg:grid-cols-2">
   <Block state={c} height="h-96">{d=><Card className="h-96"><div className="mb-2 text-sm font-medium">By country</div><Bars data={d} k="country"/></Card>}</Block>
   <Block state={p} height="h-96">{d=><Card className="h-96"><div className="mb-2 text-sm font-medium">By product</div><Bars data={d} k="product"/></Card>}</Block>
  </div></>;
}
