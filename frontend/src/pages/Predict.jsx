import {useState} from 'react';
import {motion} from 'framer-motion';
import {api} from '../services/api';import useApi from '../hooks/useApi';
import {Header,Card,Count} from '../components/ui';import {money} from '../utils/format';
export default function Predict(){
 const list=useApi(()=>api.topCustomers({limit:500}));
 const [id,setId]=useState('');const [cust,setCust]=useState(null);const [res,setRes]=useState(null);const [busy,setBusy]=useState(false);const [err,setErr]=useState(null);
 const pick=async v=>{setId(v);setRes(null);setErr(null);setCust(null);if(!v)return;try{setCust(await api.customer(v))}catch{setErr('Customer not found. Choose an ID from the list.')}};
 const run=async()=>{setBusy(true);setErr(null);try{setRes(await api.predictCustomer(id))}catch{setErr('Unable to get a prediction. Check that the API is running.')}setBusy(false)};
 const p=res?res.probability*100:0,likely=p>=50;
 const fields=cust&&[['Recency',`${cust.recency} days`],['Frequency',`${cust.frequency} invoices`],['Monetary',money(cust.monetary)],['Total quantity',cust.total_quantity],['Unique products',cust.unique_products],['Active days',cust.active_days]];
 return <><Header title="Predictive Intelligence" sub="Estimate the probability of a customer purchasing within the next 30 days."/>
  <div className="grid gap-6 lg:grid-cols-2">
   <Card><h2 className="mb-3 font-medium">1. Customer input</h2>
    <input list="ids" value={id} onChange={e=>pick(e.target.value)} placeholder="Search or select a customer ID" aria-label="Customer ID" className="w-full rounded-md border border-white/10 bg-bg px-3 py-2 text-sm"/>
    <datalist id="ids">{(list.data||[]).map(c=><option key={c.customer_id} value={c.customer_id}/>)}</datalist>
    {fields&&<dl className="mt-5 grid grid-cols-2 gap-4 text-sm">{fields.map(([l,v])=><div key={l}><dt className="text-xs text-zinc-500">{l}</dt><dd className="text-lg font-medium tabular-nums">{v}</dd></div>)}</dl>}
    <button disabled={!cust||busy} onClick={run} className="mt-6 w-full rounded-md bg-accent py-2.5 font-medium text-black transition hover:brightness-110 disabled:opacity-30">{busy?'Predicting…':'Predict purchase probability'}</button>
    {err&&<p role="alert" className="mt-3 text-sm text-amber-400">{err}</p>}</Card>
   <Card><h2 className="mb-3 font-medium">2. Model prediction</h2>
    {!res?<p className="py-16 text-center text-zinc-500">Select a customer and run the model to see the predicted likelihood.</p>:
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
     <div className="text-sm text-zinc-400">Predicted purchase probability</div>
     <div className="text-6xl font-semibold tabular-nums"><Count to={p} dec={1} suffix="%"/></div>
     <div className="mt-4 h-2 overflow-hidden rounded bg-white/10"><motion.div className={`h-full ${likely?'bg-emerald-400':'bg-amber-400'}`} initial={{width:0}} animate={{width:`${p}%`}} transition={{duration:1}}/></div>
     <div className={`mt-4 inline-block rounded px-3 py-1 text-sm font-medium ${likely?'bg-emerald-400/15 text-emerald-300':'bg-amber-400/15 text-amber-300'}`}>{likely?'Likely to purchase':'Unlikely to purchase'}</div>
     <h3 className="mt-6 text-sm font-medium">3. Business interpretation</h3>
     <p className="mt-1 text-sm text-zinc-400">{likely?'The model estimates a higher likelihood of a repeat purchase. Consider retention or loyalty outreach.':'The model estimates a lower likelihood of a purchase in the next 30 days. Consider a re-engagement offer.'} This is a statistical estimate, not a certainty.</p>
    </motion.div>}</Card></div>
  {res?.features?.length>0&&<Card className="mt-6"><h2 className="font-medium">Why this prediction?</h2><p className="mb-4 text-xs text-zinc-500">Model-based explanation: feature importance from the trained model.</p>
   {res.features.map(f=><div key={f.name} className="mb-3"><div className="flex justify-between text-sm"><span>{f.name}</span><span className="text-zinc-500">{(f.importance*100).toFixed(0)}%</span></div><div className="mt-1 h-1.5 rounded bg-white/10"><motion.div className="h-full rounded bg-accent" initial={{width:0}} animate={{width:`${f.importance*100}%`}} transition={{duration:.8}}/></div></div>)}</Card>}</>;
}
