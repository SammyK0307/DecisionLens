import {useState} from 'react';
import AppShell from './layouts/AppShell';
import Overview from './pages/Overview';import Revenue from './pages/Revenue';import Products from './pages/Products';
import Customers from './pages/Customers';import Segments from './pages/Segments';import Predict from './pages/Predict';
const PAGES={overview:Overview,revenue:Revenue,products:Products,customers:Customers,segments:Segments,predict:Predict};
export default function App(){
 const [page,setPage]=useState('overview');const [v,setV]=useState(0);const P=PAGES[page];
 return <AppShell page={page} setPage={setPage} onRefresh={()=>setV(x=>x+1)}><P key={v} go={setPage}/></AppShell>;
}
