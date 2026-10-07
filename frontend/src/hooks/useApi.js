import {useState,useEffect,useCallback} from 'react';
export default function useApi(fn,deps=[]){
 const [s,set]=useState({data:null,loading:true,error:null});
 const load=useCallback(()=>{set(x=>({...x,loading:true,error:null}));fn().then(data=>set({data,loading:false,error:null})).catch(e=>set({data:null,loading:false,error:e}));},deps);// eslint-disable-line
 useEffect(load,[load]);
 return {...s,reload:load};
}
