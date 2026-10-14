// A shared entry rule: first show the whole region; approaching a place is explicit.
export function worldMapEntry(topic){
 return {mode:'geography',lens:topic==='climate'?'water':topic==='exchange'?'corridors':'relief',guide:false};
}
