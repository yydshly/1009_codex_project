// Camera ownership is independent of the narration and scene clocks.
// A gesture changes this shot's framing; the next shot follows its own camera.
export function createDirectorView({interrupt,restore,changed=()=>{}}){
 let manual=false;
 const emit=()=>changed(manual);
 return {
  get manual(){return manual;},
  inspect(){manual=true;interrupt();emit();},
  reset(){manual=false;emit();},
  follow(shot){manual=false;restore(shot);emit();}
 };
}
