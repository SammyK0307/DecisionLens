import axios from 'axios';
const BASE=import.meta.env.VITE_API_BASE_URL||'http://localhost:8000';
export const USE_MOCK=import.meta.env.VITE_USE_MOCK==='true';
const http=axios.create({baseURL:BASE,timeout:15000});
const cache=new Map();
// ---- mock data (dev only; set VITE_USE_MOCK=true) ----
const months=['2010-12','2011-03','2011-06','2011-09','2011-12'];
const segs=['High-Value Customers','Recent / Developing','At Risk','Inactive'];
const MOCK={
 '/api/kpis':{total_revenue:20480000,units_sold:11210000,customers:5878,countries:43},
 '/api/revenue/monthly':months.map((month,i)=>({month,revenue:600000+i*250000})),
 '/api/revenue/countries':[['United Kingdom',18000000],['Netherlands',550000],['EIRE',500000],['Germany',420000]].map(([country,revenue])=>({country,revenue})),
 '/api/products/top':[['REGENCY CAKESTAND',280000,14000,2100,19.9],['WHITE HANGING HEART',250000,90000,5500,2.9]].map(([product,revenue,quantity,transactions,avg_price])=>({product,revenue,quantity,transactions,avg_price})),
 '/api/customers/top':[18102,14646,14156,14911].map((customer_id,i)=>({customer_id,recency:12+i*9,frequency:145-i*30,monetary:580000-i*90000,segment:segs[i]})),
 '/api/segments':Array.from({length:60},(_,i)=>({x:Math.sin(i)*3+(i%4)*2,y:Math.cos(i*1.7)*2+(i%4),segment:segs[i%4]})),
 '/api/segments/profile':segs.map((segment,i)=>({segment,count:900+i*400,pct:[15,25,30,30][i],avg_recency:20+i*80,avg_frequency:[12,4,3,1][i],avg_monetary:[9000,1800,900,250][i]})),
};
const mockPredict=id=>({customer_id:id,probability:0.724,features:[{name:'Recency',importance:.42},{name:'Frequency',importance:.31},{name:'Monetary',importance:.14},{name:'ActiveDays',importance:.08}]});
const mockCustomer=id=>({customer_id:id,recency:12,frequency:145,monetary:580987,total_quantity:12000,unique_products:300,active_days:90,segment:segs[0]});
// ---- request layer ----
async function get(path,{ttl=60000,params}={}){
 const key=path+JSON.stringify(params||{});const hit=cache.get(key);
 if(hit&&Date.now()-hit.t<ttl)return hit.d;
 let d;
 if(USE_MOCK){await new Promise(r=>setTimeout(r,300));d=path.startsWith('/api/customers/')&&path!=='/api/customers/top'?mockCustomer(path.split('/').pop()):MOCK[path];}
 else d=(await http.get(path,{params})).data;
 cache.set(key,{d,t:Date.now()});return d;
}
export const clearCache=()=>cache.clear();
export const api={
 kpis:()=>get('/api/kpis'),
 monthlyRevenue:p=>get('/api/revenue/monthly',{params:p}),
 countryRevenue:p=>get('/api/revenue/countries',{params:p}),
 topProducts:p=>get('/api/products/top',{params:p}),
 topCustomers:p=>get('/api/customers/top',{params:p}),
 customer:id=>get(`/api/customers/${id}`),
 segments:()=>get('/api/segments'),
 segmentProfile:()=>get('/api/segments/profile'),
 predict:async body=>USE_MOCK?mockPredict(body.customer_id):(await http.post('/api/predict',body)).data,
 predictCustomer:async id=>USE_MOCK?mockPredict(id):(await http.post(`/api/predict/${id}`)).data,
};
