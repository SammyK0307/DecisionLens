export const money=n=>n>=1e6?`£${(n/1e6).toFixed(2)}M`:n>=1e3?`£${(n/1e3).toFixed(1)}K`:`£${Number(n).toFixed(0)}`;
export const num=n=>Number(n).toLocaleString();
