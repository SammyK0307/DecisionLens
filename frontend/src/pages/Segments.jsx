import {ScatterChart,Scatter,XAxis,YAxis,Tooltip,ResponsiveContainer,Legend} from 'recharts';
import {api} from '../services/api';import useApi from '../hooks/useApi';
import {Header,Block,Card,chartTip} from '../components/ui';import {money,num} from '../utils/format';
const COL={'High-Value Customers':'#7dd3fc','Recent / Developing':'#86efac','At Risk':'#fcd34d','Inactive':'#71717a'};
const NOTE={'High-Value Customers':'Customers with strong purchasing value and engagement.','At Risk':'Previously engaged customers showing weaker recent activity.','Recent / Developing':'Recently active customers with potential for deeper engagement.','Inactive':'Customers showing low activity and long purchase gaps.'};
export default function Segments(){
 const pts=useApi(api.segments),prof=useApi(api.segmentProfile);
 return <><Header title="Customer Segmentation" sub="Discover behavioral groups from purchasing patterns."/>
  <Block state={pts} height="h-96">{d=><Card className="h-96"><ResponsiveContainer><ScatterChart><XAxis type="number" dataKey="x" name="PC1" stroke="#71717a" fontSize={12}/><YAxis type="number" dataKey="y" name="PC2" stroke="#71717a" fontSize={12}/><Tooltip {...chartTip}/><Legend/>{Object.keys(COL).map(s=><Scatter key={s} name={s} data={d.filter(p=>p.segment===s)} fill={COL[s]} animationDuration={900}/>)}</ScatterChart></ResponsiveContainer></Card>}</Block>
  <div className="mt-6"><Block state={prof} height="h-48">{d=><div className="grid gap-4 sm:grid-cols-2">{d.map(s=><Card key={s.segment}><div className="flex items-center gap-2 font-medium"><span className="h-2 w-2 rounded-full" style={{background:COL[s.segment]}}/>{s.segment}</div><p className="mt-1 text-sm text-zinc-400">{NOTE[s.segment]}</p>
   <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">{[['Customers',num(s.count)],['Share',`${s.pct}%`],['Avg. recency',`${Math.round(s.avg_recency)} days`],['Avg. frequency',Number(s.avg_frequency).toFixed(1)],['Avg. monetary',money(s.avg_monetary)]].map(([l,v])=><div key={l}><dt className="text-xs text-zinc-500">{l}</dt><dd>{v}</dd></div>)}</dl></Card>)}</div>}</Block></div></>;
}
