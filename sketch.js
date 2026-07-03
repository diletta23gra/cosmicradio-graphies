/* =========================================================================
   COSMIC RADIO GRAPHIES // Diletta Grazioli
   Graphic Design // Tecniche dei nuovi media integrati
   
   Descrizione:
   Atlante interattivo dedicato alla transcodifica mediale delle onde 
   elettromagnetiche e delle tempeste radio catturate nello spazio profondo 
   dalle sonde NASA (Voyager, Cassini, Juno).
========================================================================= */

let img;                  
let soundGenerale;        
let fft;                  
let scanX = 0;            
let scanStarted = false;  
let scanComplete = false;
let alphaPulsante = 0;    

let soundGiove, soundSaturno, soundUrano, soundNettuno;
let imgGiove, imgSaturno, imgUrano, imgNettuno;

let stato = "LANDING"; 

let mostraLegenda = false;
let mostraInfo = false;

// Elenco dei pianeti con le posizioni delle orbite
const DATA_PIANETI = [
  { nome: "MERCURIO", raggio: 45,  angolo: -1.2, interattivo: false }, 
  { nome: "VENERE",   raggio: 75,  angolo: 0.6,  interattivo: false }, 
  { nome: "TERRA",    raggio: 110, angolo: -0.2, interattivo: false }, 
  { nome: "MARTE",    raggio: 145, angolo: 1.1,  interattivo: false }, 
  { nome: "GIOVE",    raggio: 190, angolo: -0.4, interattivo: true,  statoDecode: "DECODE_GIOVE" },  
  { nome: "SATURNO",  raggio: 240, angolo: 0.1,  interattivo: true,  statoDecode: "DECODE_SATURNO" },  
  { nome: "URANO",    raggio: 290, angolo: -0.1, interattivo: true,  statoDecode: "DECODE_URANO" },  
  { nome: "NETTUNO",  raggio: 340, angolo: 0.4,  interattivo: true,  statoDecode: "DECODE_NETTUNO" }   
];

function preload() {
  img = loadImage('pexels-cosmos-1853491.jpg');
  soundGenerale = loadSound('hubble-sonification-lensing-galaxy-cluster.mp3'); 
  
  soundGiove = loadSound('giove.mp3');
  soundSaturno = loadSound('saturno.mp3');
  soundUrano = loadSound('urano.mp3');
  soundNettuno = loadSound('nettuno.mp3'); 

  imgGiove = loadImage('foto_giove.jpg');
  imgSaturno = loadImage('foto_saturno.jpg');
  imgUrano = loadImage('foto_urano.jpg');
  imgNettuno = loadImage('foto_nettuno.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight); 
  img.resize(width, height);
  fft = new p5.FFT();
}

function draw() {
  background(0); 
  
  if (stato === "LANDING") {
    drawSchermataLanding();
  } 
  else if (stato === "ATLANTE") {
    drawSchermataAtlante();
  }
  else if (stato.startsWith("DECODE_")) {
    drawSchermataDecodifica();
  }
}

function drawSchermataLanding() {
  if (!scanStarted) {
    textAlign(CENTER, CENTER);
    textFont('Orbitron');
    textSize(13); 
    drawingContext.letterSpacing = '2px'; 

    let brilla = map(sin(frameCount * 0.05), -1, 1, 100, 255);
    fill(140, 210, 230, brilla);
    text("CLICCA PER AVVIARE LA SINTONIZZAZIONE RADIO", width / 2, height / 2);
  } 
  else if (!scanComplete) {
    if (soundGenerale.isPlaying()) {
      scanX = map(soundGenerale.currentTime(), 0, soundGenerale.duration(), 0, width);
    }

    if (scanX > 0) {
      image(img, 0, 0, scanX, height, 0, 0, scanX, height);
    }

    let waveform = fft.waveform();
    noFill();
    stroke(255, 230); 
    strokeWeight(1.5);
    
    beginShape();
    for (let i = 0; i < waveform.length; i += 4) {
      let y = map(i, 0, waveform.length, 0, height);
      vertex(scanX + (waveform[i] * 150), y);
    }
    endShape();

    if (scanX >= width - 2 || (!soundGenerale.isPlaying() && scanX > 10)) {
      scanComplete = true;
      soundGenerale.stop(); 
      scanX = width; 
    }
  } 
  else {
    image(img, 0, 0, width, height);
    fill(0, 160); 
    rect(0, 0, width, height);

    if (alphaPulsante < 255) alphaPulsante += 4;

    fill(255, alphaPulsante);
    noStroke();
    textAlign(CENTER, CENTER);
    textFont('Orbitron');
    textSize(28); 
    textStyle(BOLD);
    drawingContext.letterSpacing = '3px';
    text("COSMIC RADIO GRAPHIES", width / 2, height / 2 - 20);

    textStyle(NORMAL);
    textSize(12); 
    drawingContext.letterSpacing = '1.5px';
    let pulsazione = map(sin(frameCount * 0.06), -1, 1, 100, 255);
    fill(240, 150, 60, map(pulsazione, 100, 255, 100, alphaPulsante));
    text("ACCEDI ALL'ATLANTE ORBITALE", width / 2, height / 2 + 40);
  }
}

function drawSchermataAtlante() {
  push(); tint(255, 20); image(img, 0, 0, width, height); pop();

  drawScenografiaBackground();
  drawIntestazioneFissa();

  let soleX = width * 0.5;
  let soleY = height * 0.52; 

  stroke(240, 150, 60, 100); strokeWeight(1); fill(240, 150, 60, 40); circle(soleX, soleY, 24); noStroke();
  fill(120, 140, 160, 140); textFont('Orbitron'); textSize(10); textAlign(CENTER, CENTER);
  drawingContext.letterSpacing = '1px';
  text("SOLE", soleX, soleY + 22);

  let testoNotifica = "";
  let coloreNotifica = [120, 120, 120];

  for (let i = 0; i < DATA_PIANETI.length; i++) {
    let p = DATA_PIANETI[i];
    let pX = soleX + cos(p.angolo) * p.raggio;
    let pY = soleY + sin(p.angolo) * p.raggio;

    noFill(); stroke(140, 210, 230, 60); strokeWeight(0.6);
    push();
    drawingContext.setLineDash([3, 5]); 
    circle(soleX, soleY, p.raggio * 2);
    pop();

    let inHover = dist(mouseX, mouseY, pX, pY) < 14 || (mouseX > pX + 10 && mouseX < pX + 90 && mouseY > pY - 8 && mouseY < pY + 8);

    if (p.interattivo) {
      if (inHover && !mostraLegenda && !mostraInfo) {
        cursor(HAND);
        testoNotifica = "SEGNALE EMISSIONE ATTIVO // " + p.nome + ". Clicca per decodificare il flusso.";
        coloreNotifica = [240, 150, 60];
        stroke(240, 150, 60); fill(240, 150, 60, 100);
      } else {
        stroke(240, 150, 60, 150); fill(15, 20, 30);
      }
      strokeWeight(1);
      circle(pX, pY, 12);
      noFill(); stroke(240, 150, 60, 50);
      circle(pX, pY, map(sin(frameCount * 0.07 + i), -1, 1, 16, 24));
    } else {
      if (inHover && !mostraLegenda && !mostraInfo) {
        testoNotifica = "SEGNALE SCHERMATO // " + p.nome + " non possiede emissioni magnetosferiche.";
        coloreNotifica = [120, 130, 140];
        stroke(140); fill(90);
      } else {
        stroke(80, 90, 100, 100); fill(40, 45, 50);
      }
      strokeWeight(1);
      circle(pX, pY, 7); 
    }

    noStroke(); fill(inHover ? 255 : 160); textAlign(LEFT, CENTER); textFont('Orbitron'); textSize(11); 
    textStyle(inHover ? BOLD : NORMAL);
    text(p.nome, pX + 12, pY);
  }

  textStyle(NORMAL); stroke(140, 210, 230, 20); fill(10, 15, 20, 180);
  rect(80, height - 105, width - 160, 28);
  noStroke(); textAlign(CENTER, CENTER); fill(coloreNotifica[0], coloreNotifica[1], coloreNotifica[2]); textSize(11);
  text(testoNotifica === "" ? "ESPLORA IL SISTEMA DI REPERTORIO MULTIMEDIALE POSIZIONANDO IL MIRINO SULLE ORBITE." : testoNotifica.toUpperCase(), width/2, height - 91);

  disegnaPulsanteHub(80, height - 60, 200, 32, "SPECIFICHE DI SEGNALE", [240, 150, 60]);
  disegnaPulsanteHub(width - 280, height - 60, 200, 32, "INFO & CREDITI", [140, 210, 230]);

  if (mostraLegenda) drawOverlayDati();
  if (mostraInfo) drawOverlayInfo();
}

function drawSchermataDecodifica() {
  drawScenografiaBackground();
  drawIntestazioneFissa();
  
  let nomePianeta = stato.replace("DECODE_", "");

  textAlign(LEFT, TOP); textFont('Orbitron');
  textSize(20); textStyle(BOLD); fill(240, 150, 60);
  drawingContext.letterSpacing = '1.5px';
  text("DECODIFICA FLUSSO AUDIO // " + nomePianeta, 100, height * 0.15);
  textSize(11); textStyle(NORMAL); fill(140, 210, 230, 180);
  text("ANALISI DELLO SPETTRO MAGNETICO IN CORSO", 100, height * 0.19);

  let fotoX = 100; 
  let fotoY = height * 0.28; 
  let fotoSize = 190;        
  let schedaX = fotoX + fotoSize + 50; 
  let schedaY = height * 0.28; 
  let schedaW = width - schedaX - 100; 

  let fotoPianeta = { "GIOVE": imgGiove, "SATURNO": imgSaturno, "URANO": imgUrano, "NETTUNO": imgNettuno }[nomePianeta];

  if (fotoPianeta && fotoPianeta.width > 0) {
    push(); 
    let ctx = drawingContext;
    ctx.save(); ctx.beginPath();
    ctx.arc(fotoX + fotoSize/2, fotoY + fotoSize/2, fotoSize/2 - 2, 0, Math.PI * 2); 
    ctx.clip(); 
    
    let srcX = 0, srcY = 0; let srcW = fotoPianeta.width; let srcH = fotoPianeta.height;
    if (srcW > srcH) srcX = (srcW - srcH) / 2; else srcY = (srcH - srcW) / 2;
    let sizeFit = srcW > srcH ? srcH : srcW;

    if (nomePianeta === "SATURNO") {
      let offsetSaturno = 25; 
      image(fotoPianeta, fotoX + offsetSaturno, fotoY + offsetSaturno, fotoSize - (offsetSaturno * 2), fotoSize - (offsetSaturno * 2), srcX, srcY, sizeFit, sizeFit);
    } else {
      image(fotoPianeta, fotoX, fotoY, fotoSize, fotoSize, srcX, srcY, sizeFit, sizeFit);
    }
    ctx.restore(); pop();         
  }

  let datiTecnici = {
    "GIOVE":   ["Sonda di rilevamento: JUNO (2016-2021)", "Tipo di emissione: ONDE PLASMA MAGNETOSFERICHE", "Frequenza mediana: 150 Hz - 4.5 kHz", "Distanza media dal Sole: 5.2 AU", "Note: forte picco acuto registrato nel flyby ravvicinato di Ganimede."],
    "SATURNO": ["Sonda di rilevamento: CASSINI (2004)", "Tipo di emissione: AURORAL RADIO EMISSIONS (SKR)", "Frequenza mediana: 100 kHz - 1.2 MHz", "Distanza media dal Sole: 9.5 AU", "Note: emissioni radio aurorali modulate in base alla rotazione dei poli."],
    "URANO":   ["Sonda di rilevamento: VOYAGER 2 (1986)", "Tipo di emissione: SPETTRO ALTA ENERGIA PLASMA", "Frequenza mediana: 60 Hz - 2.1 kHz", "Distanza media dal Sole: 19.2 AU", "Note: flusso continuo profondo. Campo magnetico inclinato di 59° rispetto all'asse."],
    "NETTUNO": ["Sonda di rilevamento: VOYAGER 2 (1989)", "Tipo di emissione: EMISSIONI MAGNETICHE E ACUSTICHE", "Frequenza mediana: 20 Hz - 3.2 kHz", "Distanza media dal Sole: 30.1 AU", "Note: catturato nel flyby storico. Suoni cupi legati a venti supersonici a 2100 km/h."]
  };

  let info = datiTecnici[nomePianeta];
  
  textWrap(WORD); 
  textFont('Arial'); 
  textStyle(NORMAL); 
  textSize(14);
  let rigaLeading = 20;
  textLeading(rigaLeading); 
  drawingContext.letterSpacing = '0px';

  let cursoreY = schedaY + 32;

  let altezzaRiquadroFinale = max(240, fotoSize + 15);
  stroke(240, 150, 60, 40); strokeWeight(1); noFill();
  rect(schedaX - 15, schedaY - 15, schedaW + 20, altezzaRiquadroFinale); noStroke();

  fill(240, 150, 60); textFont('Orbitron'); textStyle(BOLD); textSize(12); 
  textAlign(LEFT, TOP);
  text("DATI DI RILEVAMENTO:", schedaX, schedaY);
  
  textFont('Arial'); textStyle(NORMAL); fill(220); textLeading(rigaLeading);
  for(let i = 0; i < info.length; i++) {
    if(i === info.length - 1) fill(150); 
    text(info[i], schedaX, cursoreY, schedaW - 10);
    cursoreY += rigaLeading + 14; 
  }

  let rgbOnda = { "GIOVE": [240, 160, 50], "SATURNO": [225, 200, 100], "URANO": [100, 210, 230], "NETTUNO": [60, 120, 240] }[nomePianeta] || [255, 255, 255];

  let waveform = fft.waveform();
  let simulazioneOnda = waveform.every(v => v === 0 || v === -1); 
  let waveStartX = 100; let waveEndX = width - 100; let waveCenterY = height * 0.72; 

  if (nomePianeta === "GIOVE") {
    noFill(); stroke(rgbOnda[0], rgbOnda[1], rgbOnda[2]); strokeWeight(2.5);
    beginShape();
    for (let i = 0; i < waveform.length; i += 4) {
      let x = map(i, 0, waveform.length, waveStartX, waveEndX);
      let yOffset = simulazioneOnda ? sin(i * 0.1 + frameCount * 0.15) * 55 : waveform[i] * 240; 
      vertex(x, waveCenterY + yOffset);
    }
    endShape();
  } 
  else if (nomePianeta === "SATURNO") {
    stroke(rgbOnda[0], rgbOnda[1], rgbOnda[2]); strokeWeight(3.5);
    for (let i = 0; i < waveform.length; i += 6) {
      let x = map(i, 0, waveform.length, waveStartX, waveEndX);
      let yOffset = simulazioneOnda ? cos(i * 0.08 + frameCount * 0.1) * 40 : waveform[i] * 200;
      point(x, waveCenterY + yOffset);
    }
  } 
  else if (nomePianeta === "URANO") {
    noFill(); stroke(rgbOnda[0], rgbOnda[1], rgbOnda[2]); strokeWeight(2);
    beginShape();
    for (let i = 0; i < waveform.length; i += 4) {
      let x = map(i, 0, waveform.length, waveStartX, waveEndX);
      let yOffset = simulazioneOnda ? sin(i * 0.2 + frameCount * 0.1) * 30 : waveform[i] * 160;
      vertex(x, waveCenterY + yOffset);
    }
    endShape();
    
    stroke(rgbOnda[0], rgbOnda[1], rgbOnda[2], 80); strokeWeight(1);
    beginShape();
    for (let i = 0; i < waveform.length; i += 8) {
      let x = map(i, 0, waveform.length, waveStartX, waveEndX);
      let yOffset = simulazioneOnda ? cos(i * 0.15 + frameCount * 0.08) * 20 : waveform[i] * -100;
      vertex(x, waveCenterY + yOffset);
    }
    endShape();
  } 
  else if (nomePianeta === "NETTUNO") {
    stroke(rgbOnda[0], rgbOnda[1], rgbOnda[2]); strokeWeight(2);
    for (let i = 0; i < waveform.length; i += 8) {
      let x = map(i, 0, waveform.length, waveStartX, waveEndX);
      let yOffset = simulazioneOnda ? sin(i * 0.15 + frameCount * 0.2) * 35 : waveform[i] * 180;
      line(x, waveCenterY, x, waveCenterY + yOffset);
    }
  }

  stroke(140, 210, 230, 20); line(waveStartX, waveCenterY + 75, waveEndX, waveCenterY + 75); noStroke();
  
  textAlign(CENTER, TOP); textFont('Orbitron'); textSize(9); fill(160, 170, 180);
  text("[ TRADUZIONE FLUSSO ONDE D'URTO INTERPLANETARIE ]", width / 2, waveCenterY + 83);

  disegnaPulsanteHub(width/2 - 110, height - 55, 220, 32, "SCOLLEGA SEGNALE", [240, 150, 60]);
}

function drawOverlayDati() {
  fill(5, 10, 15, 245); stroke(240, 150, 60, 100); strokeWeight(1);
  let boxH = min(height * 0.70, 540); 
  let boxY = height * 0.15;
  rect(100, boxY, width - 200, boxH);
  
  noStroke(); textAlign(LEFT, TOP); textFont('Orbitron'); textStyle(BOLD); fill(240, 150, 60); textSize(16);
  text("SPECIFICHE DI SEGNALE METODOLOGICO", 140, boxY + 35);
  
  textWrap(WORD);
  textFont('Arial'); textStyle(NORMAL); textSize(14); fill(210);
  let overlayLeading = 20;
  textLeading(overlayLeading);
  drawingContext.letterSpacing = '0px';
  
  let xSimbolo = 150; let xTesto = 195; let textW = width - xTesto - 140;
  let cursoreY = boxY + 95;
  
  // Sezione 1
  stroke(240, 150, 60, 180); noFill(); circle(xSimbolo, cursoreY + 6, 18);
  fill(240, 150, 60); circle(xSimbolo, cursoreY + 6, 8); noStroke();
  textFont('Orbitron'); textStyle(BOLD); fill(240, 150, 60); text("SEGNALE EMISSIONE ATTIVO", xTesto, cursoreY);
  textFont('Arial'); textStyle(NORMAL); fill(210); textLeading(overlayLeading);
  let t1 = "Indica un pianeta gassoso (come Giove). Il suo forte campo magnetico genera onde radio che le sonde sono riuscite a registrare. Questo nodo è interattivo e si può cliccare sulla mappa per ascoltarlo.";
  text(t1, xTesto, cursoreY + 24, textW);
  cursoreY += 110;
  
  // Sezione 2
  stroke(120, 130, 140, 150); noFill(); circle(xSimbolo, cursoreY + 6, 16);
  line(xSimbolo - 4, cursoreY + 2, xSimbolo + 4, cursoreY + 10); line(xSimbolo + 4, cursoreY + 2, xSimbolo - 4, cursoreY + 10); noStroke();
  textFont('Orbitron'); textStyle(BOLD); fill(120, 130, 140); text("SEGNALE SCHERMATO / ASSENZA DI ATTIVITÀ", xTesto, cursoreY);
  textFont('Arial'); textStyle(NORMAL); fill(190); textLeading(overlayLeading);
  let t2 = "Indica un pianeta roccioso (come Marte). Poiché non ha un campo magnetico forte, non emette segnali radio da poter ascoltare. Per questo motivo il nodo non è cliccabile.";
  text(t2, xTesto, cursoreY + 24, textW);
  cursoreY += 110;
  
  // Sezione 3
  stroke(255, 180); noFill(); beginShape();
  for (let i = -12; i <= 12; i++) { vertex(xSimbolo + i, cursoreY + 6 + sin(i * 0.4 + frameCount * 0.1) * 5); }
  endShape(); noStroke();
  textFont('Orbitron'); textStyle(BOLD); fill(255); text("SPETTRO DI REPERTORIO GENERATIVO (FFT)", xTesto, cursoreY);
  textFont('Arial'); textStyle(NORMAL); fill(210); textLeading(overlayLeading);
  let t3 = "Mostra la forma dell'audio in tempo reale. L'algoritmo analizza le frequenze sonore della NASA e le traduce istantaneamente in onde grafiche in movimento.";
  text(t3, xTesto, cursoreY + 24, textW);
  
  disegnaPulsanteHub(width - 240, boxY + 25, 100, 26, "CHIUDI [X]", [240, 150, 60]);
}

function drawOverlayInfo() {
  fill(5, 10, 15, 245); stroke(140, 210, 230, 100); strokeWeight(1);
  let boxH = min(height * 0.70, 520);
  let boxY = height * 0.15;
  rect(100, boxY, width - 200, boxH);
  
  noStroke(); textAlign(LEFT, TOP); textFont('Orbitron'); textStyle(BOLD); fill(140, 210, 230); textSize(16);
  text("INFORMAZIONI SUL PROGETTO", 140, boxY + 35);
  
  textWrap(WORD);
  textFont('Arial'); textStyle(NORMAL); textSize(14); fill(210);
  let overlayLeading = 20;
  textLeading(overlayLeading);
  drawingContext.letterSpacing = '0px';
  
  let textW = width - 280; 
  let cursoreY = boxY + 95;


  textFont('Orbitron'); textStyle(BOLD); fill(140, 210, 230); text("AUTORE:", 140, cursoreY);
  textFont('Arial'); textStyle(NORMAL); fill(220); textLeading(overlayLeading);
  let r1 = "Progetto individuale realizzato da Diletta Grazioli per il corso di Tecniche dei Nuovi Media Integrati (Biennio di Graphic Design).";
  text(r1, 140, cursoreY + 22, textW);
  cursoreY += 75; // Distanza proporzionata
  
  textFont('Orbitron'); textStyle(BOLD); fill(140, 210, 230); text("OBIETTIVO COMUNICATIVO:", 140, cursoreY);
  textFont('Arial'); textStyle(NORMAL); fill(220); textLeading(overlayLeading);
  let r2 = "Questo atlante esplora la transcodifica mediale, trasformando i dati radio e le onde magnetiche dello spazio in suoni e onde grafiche animate in tempo reale.";
  text(r2, 140, cursoreY + 22, textW);
  cursoreY += 95; 

  textFont('Orbitron'); textStyle(BOLD); fill(140, 210, 230); text("FONTI DEI DATI:", 140, cursoreY);
  textFont('Arial'); textStyle(NORMAL); fill(220); textLeading(overlayLeading);
  let r3 = "I suoni e i dati tecnici appartengono agli archivi pubblici della NASA e provengono dalle registrazioni storiche delle sonde Voyager, Cassini e Juno.";
  text(r3, 140, cursoreY + 22, textW);
  cursoreY += 95; 

  textFont('Orbitron'); textStyle(BOLD); fill(140, 210, 230); text("PUBBLICO DI RIFERIMENTO:", 140, cursoreY);
  textFont('Arial'); textStyle(NORMAL); fill(190); textLeading(overlayLeading);
  let r4 = "L'interfaccia è progettata per un pubblico dagli 8-10 anni in su, unendo un'estetica visiva da plancia di controllo a modalità di scoperta semplici e immediate.";
  text(r4, 140, cursoreY + 22, textW);

  disegnaPulsanteHub(width - 240, boxY + 25, 100, 26, "CHIUDI [X]", [140, 210, 230]);
}

function drawIntestazioneFissa() {
  noStroke(); textAlign(LEFT, TOP); textFont('Orbitron');
  textSize(15); textStyle(BOLD); fill(255);
  drawingContext.letterSpacing = '1px';
  text("COSMIC RADIO GRAPHIES", 80, height * 0.05);
  textSize(10); textStyle(NORMAL); fill(140, 210, 230, 160);
  text("Progetto di Diletta Grazioli // Archivio di Sonificazione NASA", 80, height * 0.082);
  stroke(140, 210, 230, 30); strokeWeight(0.5);
  line(80, height * 0.11, width - 80, height * 0.11); noStroke();
}

function drawScenografiaBackground() {
  stroke(140, 210, 230, 20); strokeWeight(0.5);
  for (let x = 0; x < width; x += 80) line(x, 0, x, height);
  for (let y = 0; y < height; y += 80) line(0, y, width, y);

  stroke(240, 150, 60, 100); strokeWeight(1);
  let d = 20; let marg = 30; 
  line(marg, marg, marg + d, marg); line(marg, marg, marg, marg + d);
  line(width - marg, marg, width - marg - d, marg); line(width - marg, marg, width - marg, marg + d);
  line(marg, height - marg, marg + d, height - marg); line(marg, height - marg, marg, height - marg - d);
  line(width - marg, height - marg, width - marg - d, height - marg); line(width - marg, height - marg, width - marg, height - marg - d);
  noStroke();
}

function disegnaPulsanteHub(x, y, w, h, testo, arrayRGB) {
  let sopraPulsante = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  if (sopraPulsante) {
    cursor(HAND); fill(arrayRGB[0], arrayRGB[1], arrayRGB[2], 35); stroke(arrayRGB[0], arrayRGB[1], arrayRGB[2]); strokeWeight(1.5); rect(x, y, w, h);
    fill(255); noStroke();
  } else {
    fill(8, 12, 18, 180); stroke(arrayRGB[0], arrayRGB[1], arrayRGB[2], 75); strokeWeight(1); rect(x, y, w, h);
    fill(220); noStroke();
  }
  textFont('Orbitron'); textStyle(NORMAL); textSize(11); textAlign(CENTER, CENTER);
  drawingContext.letterSpacing = '1px';
  text(testo, x + w/2, y + h/2);
}

function mousePressed() {
  userStartAudio(); 

  let boxY = height * 0.15;

  if (stato === "LANDING") {
    if (!scanStarted) {
      scanStarted = true;
      if (soundGenerale.isLoaded()) { soundGenerale.setVolume(0.25); soundGenerale.play(); }
    } 
    else if (scanComplete) {
      if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > height/2 + 10 && mouseY < height/2 + 60) {
        stato = "ATLANTE"; 
      }
    }
  }
  else if (stato === "ATLANTE") {
    if (mostraLegenda && mouseX > width - 240 && mouseX < width - 140 && mouseY > boxY + 25 && mouseY < boxY + 51) { mostraLegenda = false; return; }
    if (mostraInfo && mouseX > width - 240 && mouseX < width - 140 && mouseY > boxY + 25 && mouseY < boxY + 51) { mostraInfo = false; return; }
    if (mostraLegenda || mostraInfo) return;

    if (mouseX > 80 && mouseX < 280 && mouseY > height - 60 && mouseY < height - 30) { mostraLegenda = true; return; }
    if (mouseX > width - 280 && mouseX < width - 80 && mouseY > height - 60 && mouseY < height - 30) { mostraInfo = true; return; }

    let soleX = width * 0.5; 
    let soleY = height * 0.52;

    for (let p of DATA_PIANETI) {
      if (!p.interattivo) continue;
      let pX = soleX + cos(p.angolo) * p.raggio;
      let pY = soleY + sin(p.angolo) * p.raggio;

      if (dist(mouseX, mouseY, pX, pY) < 14 || (mouseX > pX + 10 && mouseX < pX + 90 && mouseY > pY - 8 && mouseY < pY + 8)) {
        stato = p.statoDecode;
        let s = { "GIOVE": soundGiove, "SATURNO": soundSaturno, "URANO": soundUrano, "NETTUNO": soundNettuno }[p.nome];
        if (s && s.isLoaded()) { s.setVolume(0.4); s.play(); }
        return;
      }
    }
  }
  else if (stato.startsWith("DECODE_")) {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height - 55 && mouseY < height - 23) {
      if (soundGiove?.isPlaying()) soundGiove.stop(); 
      if (soundSaturno?.isPlaying()) soundSaturno.stop(); 
      if (soundUrano?.isPlaying()) soundUrano.stop();
      if (soundNettuno?.isPlaying()) soundNettuno.stop();
      stato = "ATLANTE";
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  img.resize(width, height);
}
