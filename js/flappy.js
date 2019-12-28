function novoElemento (tagName,className) {
    const el = document.createElement(tagName);
    el.className = className;
    return el;
}

function Barreira(reversa=False){
    this.elemento = novoElemento('div','barreira');
    const borda = novoElemento('div','borda')
    const corpo = novoElemento('div','corpo')
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);   
    this.setAltura = altura => corpo.style.height = `${altura}px`; 
}

function parDeBarreiras(altura,abertura,x) {
    this.elemento = novoElemento('div','par-de-barreiras');

    this.cima = new Barreira(true);
    this.baixo = new Barreira(false);
    
    this.elemento.appendChild(this.cima.elemento);
    this.elemento.appendChild(this.baixo.elemento);
    
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura-abertura);
        const alturaInferior = altura - abertura - alturaSuperior;
        this.cima.setAltura(alturaSuperior);
        this.baixo.setAltura(alturaInferior);
    }
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    this.setX = (x) => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parDeBarreiras(altura,abertura,largura),
        new parDeBarreiras(altura,abertura,largura+espaco),
        new parDeBarreiras(altura,abertura,largura+2*espaco),
        new parDeBarreiras(altura,abertura,largura+3*espaco)
    ]
    const deslocamento = 3
    this.animar = () => {
        //console.log('oi')
        this.pares.forEach(par => {
            par.setX(par.getX()-deslocamento)
              
            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX()+espaco*this.pares.length)
                par.sortearAbertura()
            }
            
            const meio = largura/2;
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio

            if(cruzouOMeio){
                notificarPonto()
            }

        })
        //console.log("tchau")
    }

}

function Passaro(alturaJogo) {
    let voando = false;
    this.elemento = novoElemento('img','passaro');
    this.elemento.src = 'imgs/pato.jpg';
   
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    this.setY = (y) => this.elemento.style.bottom = `${y}px`;

    window.onkeydown = e => voando = false;
    window.onkeyup = e => voando = true;

    this.animar = () => {
        let novoY = this.getY() + (voando ? 8 : -5);
        const alturaMaxima = alturaJogo - this.elemento.clientHeight;
        if(novoY<0){
            novoY=0;
        }
        if(novoY>=alturaMaxima){
            novoY=alturaMaxima;
        }
        this.setY(novoY);
    }

    this.setY(alturaJogo/2);

}

function Progresso () {
    this.elemento = novoElemento('span','progresso');
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos;
    }
    this.atualizarPontos(0)
}

function sobrepostos (elementA,elementB) {
    
    const a = elementA.getBoundingClientRect(elementA)
    const b = elementB.getBoundingClientRect(elementB)

    const hor = a.left + a.width >= b.left
        && b.left + b.width >= a.left

    const ver = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return hor && ver

}

function collided (passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach( parDeBarreiras => {
        const superior = parDeBarreiras.cima.elemento
        const inferior = parDeBarreiras.baixo.elemento
        colidiu = colidiu || sobrepostos(passaro.elemento,inferior)
            || sobrepostos(passaro.elemento, superior)

    })
    return colidiu
}

function Game () {

    let pontos = 0;

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura,largura,250,400,
        () => progresso.atualizarPontos(++pontos))

    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval( () => {
            barreiras.animar()
            passaro.animar()
            if(collided(passaro,barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }

}

new Game().start()
