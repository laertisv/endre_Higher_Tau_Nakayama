
function Number_Of_Simples(d,p,l) {
    return (p-1)*(((d-1)/2)*l+1)+l/2;
}

function Is_Projective(a,b,l){
    if ((b-a)==l-1) {
        return true;
    }
    else if ((a==1) && (b<l+1)) {
        return true;
    } else {
        return false;
    }
}

function Index_Simple_dCluster(d,p,l){
    const evenSimples = []
    const oddSimples = []
    for (let i=1; i<p+1; i=i+2){
        oddSimples.push( (i-1)*((d-1)/2)*l+i )
        evenSimples.push( i*(((d-1)/2)*l+1)+l/2 )
    }
    return [oddSimples,evenSimples]
}

function Taud(a,b,d,l) {
    let c = b-(d/2)*l;
    let e = a-((d-2)/2)*l-2
    if ((c<=e) && (c>0)) {
        return [c,e];
    } else {
        return 0;
    }
}

function TaudInverse(a,b,d,l,n) {
    let c = b+((d-2)/2)*l+2;
    let e = a+(d/2)*l;
    if ((c<=e) && (e<=n)) {
        return [c,e];
    } else {
        return 0;
    }
}

function Is_dCluster(a,b,d,p,l,simples){
    if (simples[0].includes(a)) {
        return true;
    } else if (simples[1].includes(b)) {
        return true;
    } else {
        return false;
    }
}

function hom(Mint,Nint){
    let a = Mint[0];
    let b = Mint[1];
    let c = Nint[0];
    let d = Nint[1];
    if ((a<= c) && (c<=b) && (b<=d)){
        return true;
    } else {
        return false;
    }
}

function makeModule(a,b,d,p,l,simples,n){
    let classesList=[];
    let notSupportCompatible_temp = [];
    let isprojective = Is_Projective(a,b,l);
    let isInDCT = (Is_dCluster(a,b,d,p,l,simples) || isprojective);
    if (isprojective) {
        classesList.push('projective');
        notSupportCompatible_temp.push("M-" + String(a)+ "-" + String(b))
    } else {
        classesList.push('notprojective');
    }
    if (isInDCT) {
        classesList.push('ClusterTiltingSummand');
    } else {
        classesList.push('notClusterTiltingSummand');
    }
    M = {
        data : {
            id : "M-" + String(a)+ "-" + String(b),
            socle : a,
            top : b,
            taud : Taud(a,b,d,l),
            isProjective : isprojective,
            isDCT : isInDCT,
            notRigidCompatible : ["M-" + String(a)+ "-" + String(b)],
            notSupportCompatible : notSupportCompatible_temp,
            taudInverse : TaudInverse(a, b, d, l, n),
            isSupportOf : ["M-" + String(a)+ "-" + String(b)]
        },
        position : {
            x : (a+b+1)*50,
            y : -(b-a+1)*50
        },
        classes : classesList,
        selectable : false,
        locked : true,
    };
    edges = [];
    if (b-a>0){
        edges.push({
            data: {
                source:M.data.id,
                target:"M-"+ String(a+1) + "-" + String(b),
                selectable: false,
                headType: 'triangle',
            }
        })
    }
    if ((b-a<l-1) && (b<n)) {
        edges.push({
            data: {
                source:M.data.id,
                target:"M-"+ String(a) + "-" + String(b+1),
                selectable: false,
                headType: 'triangle',
            }
        })
    }
    if (!M.data.isProjective) {
        edges.push(
            {
                data: {
                    source: M.data.id,
                    target: "M-"+ String(a-1) + "-" + String(b-1),
                    selectable: false,
                    lineType: 'dashed',
                }
            }
        )
    }
    return [M,edges]
}

class generateModuleCategory{
    constructor(d,p,l){
        this.d = d;
        this.p = p;
        this.l = l;
        this.n = Number_Of_Simples(d,p,l);
        this.simples = Index_Simple_dCluster(d, p, l);
        this.modules = [];
        this.edges = [];
        this.projectives = [];
        for (let i = 1; i < this.n + 1; i = i + 1) {
            for (let j = i; j-i < l && j<this.n+1 ; j = j + 1) {
                let temp = makeModule(i,j,d,p,l,this.simples,this.n)
                this.modules.push(temp[0]);
                this.edges.push(...temp[1]);
                if (temp[0].data.isProjective) {
                    this.projectives.push(temp[0].data.id);
                }
            }
        }
        let dctModules = this.modules.filter(x=>x.data.isDCT);
        this.dctCat = dctModules.map(y => y.data.id);
        for ( let i in dctModules){
            let M = dctModules[i];
            for ( let j in dctModules ){
                let N = dctModules[j];
                if (i!==j){
                    if ( ( !(N.data.isProjective) && (hom([M.data.socle,M.data.top],N.data.taud)) ) || ( !(M.data.isProjective) && (hom([N.data.socle,N.data.top],M.data.taud)) ) ){
                        M.data.notRigidCompatible.push(N.data.id);
                    }
                    if ( (N.data.isProjective) && (hom([N.data.socle,N.data.top],[M.data.socle,M.data.top])) ){
                        M.data.notSupportCompatible.push(N.data.id);
                    }
                    if ( (M.data.isProjective) && (hom([M.data.socle,M.data.top],[N.data.socle,N.data.top])) ){
                        M.data.isSupportOf.push(N.data.id);
                    }
                }
            }
        }
    }
}

function findPossibleMutations(rigidPart,supportPart){
    let output = [];
    let indecSummands = currentAlgebra.modules.filter( x => rigidPart.includes(x.data.id) || supportPart.includes(x.data.id) );
    for( let i in indecSummands ){
      let mutatedAt = indecSummands[i].data.id;
      let output_element_rigid = rigidPart.filter(x=> mutatedAt !== x).map(x=> x);
      let output_element_support = supportPart.filter(x=> mutatedAt !== x).map(x=> x);
      let allowedRigid = new Set([...currentAlgebra.dctCat]);
      let allowedSupport = new Set([...currentAlgebra.projectives]);
      if (rigidPart.includes(mutatedAt)){
        allowedRigid = allowedRigid.difference(new Set([mutatedAt]));
      }
      if (supportPart.includes(mutatedAt)){
        allowedSupport = allowedSupport.difference(new Set([mutatedAt]));
      }
      for (let j in indecSummands){
        if (i!==j){
          if (supportPart.includes(indecSummands[j].data.id)){
            allowedRigid = allowedRigid.difference(new Set(indecSummands[j].data.isSupportOf));
            allowedSupport = allowedSupport.difference(new Set([indecSummands[j].data.id]));
          } else {
            allowedRigid = allowedRigid.difference(new Set(indecSummands[j].data.notRigidCompatible));
            allowedSupport = allowedSupport.difference(new Set(indecSummands[j].data.notSupportCompatible));
            allowedRigid = allowedRigid.difference(new Set([indecSummands[j].data.id]));
          }
        }
      }
      if (allowedRigid.size>0){
        output.push([
          [...output_element_rigid,...allowedRigid],output_element_support,mutatedAt
        ]);
      }
      if (allowedSupport.size>0){
        output.push([
          output_element_rigid,[...output_element_support,...allowedSupport],mutatedAt
        ]);
      }  
    }
    return output;
  }