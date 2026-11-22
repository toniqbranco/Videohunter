import {NextResponse} from "next/server";
export const runtime="nodejs";
export async function GET(request){
 const key=process.env.YOUTUBE_API_KEY;
 if(!key)return NextResponse.json({configured:false,items:[],message:"YouTube API key is not configured. Add YOUTUBE_API_KEY to Vercel environment variables."});
 const url=new URL(request.url);
 const mode=url.searchParams.get("mode")==="hidden"?"hidden":"trending";
 const query=url.searchParams.get("q")?.trim().slice(0,100)||"GTA 6 gameplay";
 const params=new URLSearchParams({part:"snippet",q:query,type:"video",maxResults:"20",order:mode==="hidden"?"date":"viewCount",key});
 try{const response=await fetch("https://www.googleapis.com/youtube/v3/search?"+params,{next:{revalidate:300}});const data=await response.json();if(!response.ok)return NextResponse.json({error:"YouTube API request failed",detail:data.error?.message||"Unknown error"},{status:502});return NextResponse.json({configured:true,mode,items:(data.items||[]).map(v=>({id:v.id.videoId,title:v.snippet.title,channel:v.snippet.channelTitle,publishedAt:v.snippet.publishedAt,thumbnail:v.snippet.thumbnails?.medium?.url,url:"https://www.youtube.com/watch?v="+v.id.videoId}))});}catch{return NextResponse.json({error:"YouTube discovery temporarily unavailable"},{status:503})}
}