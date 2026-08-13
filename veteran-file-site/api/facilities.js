export default async function handler(req,res){
  if(req.method!=="GET"){
    return res.status(405).json({error:"Method not allowed"});
  }

  const key=process.env.VA_API_KEY;

  if(!key){
    return res.status(500).json({
      error:"VA API key is not configured."
    });
  }

  const zip=String(req.query.zip||"").trim();
  const type=String(req.query.type||"").trim();
  const per=Math.min(
    Math.max(Number(req.query.per_page||12),1),
    25
  );

  if(!/^\d{5}$/.test(zip)){
    return res.status(400).json({
      error:"Enter a valid 5-digit ZIP code."
    });
  }

  if(!["","health","benefits","vet_center","cemetery"].includes(type)){
    return res.status(400).json({
      error:"Invalid facility type."
    });
  }

  const url=new URL(
    "https://sandbox-api.va.gov/services/va_facilities/v1/facilities"
  );

  url.searchParams.set("zip",zip);
  url.searchParams.set("per_page",String(per));

  if(type){
    url.searchParams.set("type",type);
  }

  try{
    const response=await fetch(url,{
      headers:{
        apikey:key,
        Accept:"application/json"
      }
    });

    const text=await response.text();

    let body;

    try{
      body=JSON.parse(text);
    }catch{
      body={error:"Unexpected VA response."};
    }

    if(!response.ok){
      return res.status(response.status).json({
        error:
          body?.errors?.[0]?.detail ||
          body?.message ||
          body?.error ||
          `VA API error ${response.status}`
      });
    }

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json(body);

  }catch(error){
    console.error(error);

    return res.status(502).json({
      error:"Unable to reach the VA Facilities API."
    });
  }
}
