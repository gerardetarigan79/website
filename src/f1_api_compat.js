const originalFetch=window.fetch.bind(window);
const F1_API_COMPAT={
  "https://api.jolpi.ca/f1/2026.json":"https://api.jolpi.ca/ergast/f1/2026.json",
  "https://api.jolpi.ca/ergast/f1/current/driverstandings/max_verstappen.json":"https://api.jolpi.ca/ergast/f1/current/drivers/max_verstappen/driverstandings/",
  "https://api.jolpi.ca/ergast/f1/current/constructorstandings/ferrari.json":"https://api.jolpi.ca/ergast/f1/current/constructors/ferrari/constructorstandings/"
};
window.fetch=(input,init)=>{
  const raw=typeof input==="string"?input:input?.url;
  const fixed=raw&&F1_API_COMPAT[raw];
  if(!fixed)return originalFetch(input,init);
  if(typeof input==="string")return originalFetch(fixed,init);
  return originalFetch(new Request(fixed,input),init);
};
