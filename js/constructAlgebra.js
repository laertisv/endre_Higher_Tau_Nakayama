
/* Basic functions */

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

/* Class declarations */
class makeIndecomposable {
    constructor(a, b, d, p, l, simples,n) {
        this.id = "M-" + String(a)+ "-" + String(b);
        this.top = b;
        this.socle = a;
        this.xpos = (a+b+1)*50;
        this.ypos = -(b-a+1)*50;
        this.isProjective = Is_Projective(a, b, l);
        this.classes = ['notchosen'];
        if (this.isProjective) {
            this.isDCT = true;
            this.classes.push('projective');
        } else {
            this.isDCT = Is_dCluster(a, b, d, p, l, simples);
            this.classes.push('notprojective');
        }
        if (this.isDCT) {
            this.classes.push('ClusterTiltingSummand');
        } else {
            this.classes.push('notClusterTiltingSummand');
        }
        this.taud = Taud(a, b, d, l);
        this.taudInverse = TaudInverse(a, b, d, l, n);
        this.elementaryMorphisms =[];
        if (b-a>0) {
            this.elementaryMorphisms.push(
                {
                data: {
                    source:this.id,
                    target:"M-"+ String(a+1) + "-" + String(b),
                    selectable: false,
                    headType: 'triangle',
                    
                }
            })
        }
        if (b-a<l-1 && b<n) {
            this.elementaryMorphisms.push(
                {
                    data: {
                        source: this.id,
                        target: "M-"+ String(a) + "-" + String(b+1),
                        selectable: false,
                        headType: 'triangle',
                    }
                }
            )
        }
        if (!this.isProjective){
            this.elementaryMorphisms.push(
                {
                    data: {
                        source: this.id,
                        target: "M-"+ String(a-1) + "-" + String(b-1),
                        selectable: false,
                        lineType: 'dashed',
                    }
                }
            )
        }
    }
}

class makeModuleCategory {
    constructor(d, p, l) {
        this.d = d;
        this.p =p;
        this.l =l;
        this.n = Number_Of_Simples(d, p, l);
        this.simples = Index_Simple_dCluster(d, p, l);
        this.modules = [];
        for (let i = 1; i < this.n + 1; i = i + 1) {
            for (let j = i; j-i < l && j<this.n+1 ; j = j + 1) {
                this.modules.push(new makeIndecomposable(i, j, d, p, l, this.simples,this.n));
            }
        }
        this.dctModules = this.modules.filter(x=> x.isDCT).map(y=> y.id);
        this.projectives = this.modules.filter(x=> x.isProjective).map(y=>y.id);
        for (let i in this.modules){
            let M = this.modules[i];
            if (M.isDCT){
                this.modules[i].notRigidCompatible = [];
                this.modules[i].notSupportCompatible = [];
                if (M.isProjective){
                    this.modules[i].isSupportOf = [];
                }
                for (let j in this.modules){
                    let N = this.modules[j];
                    if ((N.isDCT) && (i!==j)){
                        if ( ( !(N.isProjective) && (hom([M.socle,M.top],N.taud)) ) || ( !(M.isProjective) && (hom([N.socle,N.top],M.taud)) ) ){
                            this.modules[i].notRigidCompatible.push(N.id);
                        }
                        if ( (M.isProjective) && (hom([M.socle,M.top],[N.socle,N.top])) ){
                            this.modules[i].isSupportOf.push(N.id);
                        }
                        if ( (N.isProjective) && (hom([N.socle,N.top],[M.socle,M.top])) ){
                            this.modules[i].notSupportCompatible.push(N.id);
                        }
                    }
                }
            }
        }
    }
}

/* Generate nodes to populate the graph */

function generateGraphElements(d,p,l,chosenPair){
    if ((nakayamaAlgebra.d !== d) || (nakayamaAlgebra.p !== p) || (nakayamaAlgebra.l !== l)){ 
        nakayamaAlgebra = new makeModuleCategory(d,p,l);
    }
    let Nakayama = nakayamaAlgebra;
    let modules = [];
    let minMorphism = [];
    for (let i in Nakayama.modules){
        let M = Nakayama.modules[i];
        modules.push(
            {
                data:{ 
                    id: M.id,
                    socle: M.socle,
                    top: M.top,
                    taud: M.taud,
                    isProjective: M.isProjective,
                    taudInverse: M.taudInverse,
                }, 
                position:{
                    x:M.xpos,
                    y:M.ypos
                },
                classes: M.classes,
                selectable: M.isDCT,
                locked: true,
            }
        );
        M.elementaryMorphisms.forEach((elements) => minMorphism.push(elements));
    }
    let elmt = {
        nodes: modules,
        edges: minMorphism, 
    }
    return elmt
}

