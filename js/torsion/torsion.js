function computeTorsionClass(){
  chosenRigid = [];
  chosenSupport = [];
  possibleMutations = [];
  drawARquiver(d,p,l,'displayDivForARQuiver');
}


function obtainTorsionClass(){
  let btnTorsion_old = document.getElementById('torsionButton');
  let btnTorsion = btnMutate_old.cloneNode(true);
  btnToesion_old.parentNode.replaceChild(btnTorsion,btnTorsion_old);
  btnTorsion.disabled = false;
  btnTorsion.addEventListener('click',function(){
    computeTorsionClass();
  });
}
