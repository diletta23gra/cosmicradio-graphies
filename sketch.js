/* =========================================================================
   COSMIC RADIO GRAPHIES // Diletta Grazioli
   Biennio Graphic Design // Tecniche dei nuovi media integrati
   
Descrizione:
Atlante interattivo dedicato alla transcodifica mediale delle onde elettromagnetiche catturate nello spazio dalle sonde NASA (Voyager, Cassini, Juno).
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

// --- Precaricamento degli asset multimediali ---
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
  cursor(ARROW); // reset globale del mouse
  
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


// --- SCHERMATA INTRODUTTIVA (LANDING & INTRO) ---
function drawSchermataLanding() {
  if (!scanStarted) {
    textAlign(CENTER, CENTER);
    textFont('Orbitron');
    textSize(12);

    let brilla = map(sin(frameCount * 0.05), -1, 1, 100, 255);
    fill(140, 210, 230, brilla);
    text("CLICCA PER AVVIARE LA SINTONIZZAZIONE RADIO", width / 2, height / 2);
  } 
  else if (!scanComplete) {
    // avanzamento della linea sincronizzata con il tempo dell'audio
    if (soundGenerale.isPlaying()) {
      let tempoCorrente = soundGenerale.currentTime();
      let durataTotale = soundGenerale.duration();
      scanX = map(tempoCorrente, 0, durataTotale, 0, width);
    }
    
    // dimostrazione progressivo dello sfondo 
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
      let waveOffset = waveform[i] * 150; 
      vertex(scanX + waveOffset, y);
    }
    endShape();

    if (scanX >= width - 2 || (scanStarted && !soundGenerale.isPlaying() && scanX > 10)) {
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
    textSize(26);
    textStyle(BOLD);
    text("COSMIC RADIO GRAPHIES", width / 2, height / 2 - 20);

    textStyle(NORMAL);
    textSize(11);
    let pulsazione = map(sin(frameCount * 0.06), -1, 1, 100, 255);
    fill(240, 150, 60, map(pulsazione, 100, 255, 100, alphaPulsante));
    text("ACCEDI ALL'ATLANTE ORBITALE", width / 2, height / 2 + 30);
  }
}


// --- FUNZIONE: MAPPA ATLANTE ---
function drawSchermataAtlante() {
  background(0);
  push(); tint(255, 20); image(img, 0, 0, width, height); pop();

  drawScenografiaBackground();
  drawIntestazioneFissa();

  let soleX = width * 0.5;
  let soleY = height * 0.52; 

  stroke(240, 150, 60, 100); strokeWeight(1); fill(240, 150, 60, 40); circle(soleX, soleY, 24); noStroke();
  fill(120, 140, 160, 140); textFont('Orbitron'); textSize(9); textAlign(CENTER, CENTER);
  text("SOLE", soleX, soleY + 22);

  let pianeti = [
    ["MERCURIO", 45,  -1.2, false], 
    ["VENERE",   75,  0.6,  false], 
    ["TERRA",    110, -0.2, false], 
    ["MARTE",    145,  1.1, false], 
    ["GIOVE",    190, -0.4, true],  
    ["SATURNO",  240,  0.1, true],  
    ["URANO",    290, -0.1, true],  
    ["NETTUNO",  340,  0.4, true]   
  ];

  let testoNotifica = "";
  let coloreNotifica = color(120);

  for (let i = 0; i < pianeti.length; i++) {
    let nome = pianeti[i][0];
    let raggio = pianeti[i][1];
    let angolo = pianeti[i][2];
    let interattivo = pianeti[i][3];

    let pX = soleX + cos(angolo) * raggio;
    let pY = soleY + sin(angolo) * raggio;

    // disegno vettoriale delle orbite circolari
    noFill(); stroke(140, 210, 230, 60); strokeWeight(0.6);
    push();
    drawingContext.setLineDash([3, 5]); 
    circle(soleX, soleY, raggio * 2);
    pop();

    let dMouse = dist(mouseX, mouseY, pX, pY);
    let inHoverPianeta = dMouse < 14;
    let inHoverTesto = mouseX > pX + 10 && mouseX < pX + 90 && mouseY > pY - 8 && mouseY < pY + 8;
    let inHover = inHoverPianeta || inHoverTesto;

    // differenziazione segnali attivi e fissi
    if (interattivo) {
      if (inHover && !mostraLegenda && !mostraInfo) {
        cursor(HAND);
        testoNotifica = "SEGNALE EMISSIONE ATTIVO // " + nome + ". Clicca per decodificare il flusso.";
        coloreNotifica = color(240, 150, 60);
        stroke(240, 150, 60); fill(240, 150, 60, 100);
      } else {
        stroke(240, 150, 60, 150); fill(15, 20, 30);
      }
      strokeWeight(1);
      circle(pX, pY, 12);
      noFill(); stroke(240, 150, 60, 50);
      let pPulsa = map(sin(frameCount * 0.07 + i), -1, 1, 16, 24); 
      circle(pX, pY, pPulsa);
    } else {
      if (inHover && !mostraLegenda && !mostraInfo) {
        testoNotifica = "SEGNALE SCHERMATO // " + nome + " non possiede emissioni magnetosferiche.";
        coloreNotifica = color(120, 130, 140);
        stroke(140); fill(90);
      } else {
        stroke(80, 90, 100, 100); fill(40, 45, 50);
      }
      strokeWeight(1);
      circle(pX, pY, 7); 
    }

    noStroke(); fill(inHover ? 255 : 160); textAlign(LEFT, CENTER); textFont('Orbitron'); textSize(10);
    textStyle(inHover ? BOLD : NORMAL);
    text(nome, pX + 12, pY);
  }

  // Barra informativa inferiore
  textStyle(NORMAL); stroke(140, 210, 230, 20); fill(10, 15, 20, 180);
  rect(80, height - 105, width - 160, 28);
  noStroke(); textAlign(CENTER, CENTER); fill(coloreNotifica); textSize(10);
  if (testoNotifica === "") {
    text("ESPLORA IL SISTEMA DI REPERTORIO MULTIMEDIALE POSIZIONANDO IL MIRINO SULLE ORBITE.", width/2, height - 91);
  } else {
    text(testoNotifica.toUpperCase(), width/2, height - 91);
  }

  // --- Pulsanti per pannelli ---
  disegnaPulsanteHub(80, height - 60, 180, 30, "SPECIFICHE DI SEGNALE", color(240, 150, 60));
  disegnaPulsanteHub(width - 260, height - 60, 180, 30, "INFO & CREDITI", color(140, 210, 230));

  if (mostraLegenda) drawOverlayDati();
  if (mostraInfo) drawOverlayInfo();
}


// --- IDENTIKIT E FORMA D'ONDA ---
function drawSchermataDecodifica() {
  background(0);
  drawScenografiaBackground();
  drawIntestazioneFissa();
  
  let nomePianeta = stato.replace("DECODE_", "");

  textAlign(LEFT, TOP); textFont('Orbitron');
  textSize(18); textStyle(BOLD); fill(240, 150, 60);
  text("DECODIFICA FLUSSO AUDIO // " + nomePianeta, 100, height * 0.15);
  textSize(10); textStyle(NORMAL); fill(140, 210, 230, 180);
  text("ANALISI DELLO SPETTRO MAGNETICO IN CORSO", 100, height * 0.19);

  let fotoX = 100; let fotoY = height * 0.28; let fotoSize = 190;        
  let schedaX = fotoX + fotoSize + 50; let schedaY = height * 0.28; 
  let schedaW = width - schedaX - 100; let gapY = 26;              

  let pianetaImmagini = { "GIOVE": imgGiove, "SATURNO": imgSaturno, "URANO": imgUrano, "NETTUNO": imgNettuno };
  let fotoPianeta = pianetaImmagini[nomePianeta];

  if (fotoPianeta && fotoPianeta.width > 0) {
    push(); 
    let ctx = drawingContext;
    ctx.save(); ctx.beginPath();
    ctx.arc(fotoX + fotoSize/2, fotoY + fotoSize/2, fotoSize/2 - 2, 0, Math.PI * 2); 
    ctx.clip();
    
    let srcX = 0, srcY = 0; let srcW = fotoPianeta.width; let srcH = fotoPianeta.height;
    if (srcW > srcH) { srcX = (srcW - srcH) / 2; srcW = srcH; } 
    else if (srcH > srcW) { srcY = (srcH - srcW) / 2; srcH = srcW; }

    if (nomePianeta === "SATURNO") {
      let offsetSaturno = 25; 
      image(fotoPianeta, fotoX + offsetSaturno, fotoY + offsetSaturno, fotoSize - (offsetSaturno * 2), fotoSize - (offsetSaturno * 2), srcX, srcY, srcW, srcH);
    } else {
      image(fotoPianeta, fotoX, fotoY, fotoSize, fotoSize, srcX, srcY, srcW, srcH);
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
  stroke(240, 150, 60, 40); strokeWeight(1); noFill();
  rect(schedaX - 15, schedaY - 15, schedaW + 20, fotoSize); noStroke();

  fill(240, 150, 60); textFont('Orbitron'); textStyle(BOLD); textSize(11);
  text("DATI DI RILEVAMENTO:", schedaX, schedaY);
  
  textStyle(NORMAL); textFont('sans-serif'); textSize(12); fill(220);
  for(let i = 0; i < info.length; i++) {
    if(i === info.length - 1) { fill(150); textStyle(ITALIC); } 
    text(info[i], schedaX, schedaY + 28 + (i * gapY), schedaW - 10); 
  }

  let coloriOnde = {
    "GIOVE": color(240, 160, 50),    
    "SATURNO": color(225, 200, 100), 
    "URANO": color(100, 210, 230),   
    "NETTUNO": color(60, 120, 240)   
  };
  let coloreOndaAttiva = coloriOnde[nomePianeta] || color(255);

  let waveform = fft.waveform();
  noFill(); stroke(coloreOndaAttiva); strokeWeight(2);
  
  let simulazioneOnda = waveform.every(v => v === 0 || v === -1); 
  let waveStartX = 100; let waveEndX = width - 100; let waveCenterY = height * 0.68; 

  beginShape();
  for (let i = 0; i < waveform.length; i += 4) {
    let x = map(i, 0, waveform.length, waveStartX, waveEndX);
    let yOffset = simulazioneOnda ? sin(i * 0.1 + frameCount * 0.15) * 35 : waveform[i] * 140; 
    vertex(x, waveCenterY + yOffset);
  }
  endShape();

  stroke(140, 210, 230, 20); line(waveStartX, waveCenterY + 60, waveEndX, waveCenterY + 60); noStroke();
  fill(140, 210, 230, 120); textFont('Orbitron'); textStyle(NORMAL); textSize(8); textAlign(CENTER, TOP);
  text("[ TRADUZIONE FLUSSO ONDE D'URTO INTERPLANETARIE ]", width / 2, waveCenterY + 68);

  textAlign(CENTER, CENTER);
  disegnaPulsanteHub(width/2 - 110, height - 55, 220, 32, "SCOLLEGA SEGNALE", color(240, 150, 60));
}


function drawOverlayDati() {
  fill(5, 10, 15, 240); stroke(240, 150, 60, 100); strokeWeight(1);
  rect(100, height * 0.22, width - 200, height * 0.58);
  
  noStroke(); textAlign(LEFT, TOP); textFont('Orbitron'); textStyle(BOLD); fill(240, 150, 60); textSize(16);
  text("SPECIFICHE DI SEGNALE METODOLOGICO", 140, height * 0.26);
  
  textFont('sans-serif'); textStyle(NORMAL); textSize(12); fill(230);
  let xSimbolo = 150; let xTesto = 195; let textW = width - xTesto - 160;
  
  let y1 = height * 0.33;
  stroke(240, 150, 60, 180); noFill(); circle(xSimbolo, y1 + 6, 18);
  fill(240, 150, 60); circle(xSimbolo, y1 + 6, 8); noStroke();
  textStyle(BOLD); fill(240, 150, 60); text("SEGNALE EMISSIONE ATTIVO", xTesto, y1);
  textStyle(NORMAL); fill(210); text("Indica un pianeta gassoso (come Giove). Il suo forte campo magnetico genera onde radio che le sonde sono riuscite a registrare. Questo nodo è interattivo e si può cliccare sulla mappa per ascoltarlo.", xTesto, y1 + 18, textW);
  
  let y2 = height * 0.46;
  stroke(120, 130, 140, 150); noFill(); circle(xSimbolo, y2 + 6, 16);
  line(xSimbolo - 4, y2 + 2, xSimbolo + 4, y2 + 10); line(xSimbolo + 4, y2 + 2, xSimbolo - 4, y2 + 10); noStroke();
  textStyle(BOLD); fill(120, 130, 140); text("SEGNALE SCHERMATO / ASSENZA DI ATTIVITÀ", xTesto, y2);
  textStyle(NORMAL); fill(190); text("Indica un pianeta roccioso (come Marte). Poiché non ha un campo magnetico forte, non emette segnali radio da poter ascoltare. Per questo motivo il nodo non è cliccabile.", xTesto, y2 + 18, textW);
  
  let y3 = height * 0.59;
  stroke(255, 180); noFill(); beginShape();
  for (let i = -12; i <= 12; i++) { vertex(xSimbolo + i, y3 + 6 + sin(i * 0.4 + frameCount * 0.1) * 5); }
  endShape(); noStroke();
  textStyle(BOLD); fill(255); text("SPETTRO DI REPERTORIO GENERATIVO (FFT)", xTesto, y3);
  textStyle(NORMAL); fill(210); text("Mostra la forma dell'audio in tempo reale. L'algoritmo analizza le frequenze sonore della NASA e le traduce istantaneamente in onde grafiche in movimento.", xTesto, y3 + 18, textW);
  
  disegnaPulsanteHub(width - 240, height * 0.25, 100, 26, "CHIUDI [X]", color(240, 150, 60));
}


function drawOverlayInfo() {
  fill(5, 10, 15, 240); stroke(140, 210, 230, 100); strokeWeight(1);
  rect(100, height * 0.22, width - 200, height * 0.58);
  
  noStroke(); textAlign(LEFT, TOP); textFont('Orbitron'); textStyle(BOLD); fill(140, 210, 230); textSize(16);
  text("INFORMAZIONI SUL PROGETTO", 140, height * 0.26);
  
  textFont('sans-serif'); textStyle(NORMAL); textSize(12); fill(210);
  let textW = width - 280; let startY = height * 0.33;
  
  textStyle(BOLD); fill(140, 210, 230); text("AUTORE:", 140, startY);
  textStyle(NORMAL); fill(220);
  text("Progetto individuale realizzato da Diletta Grazioli per il corso di Tecniche dei Nuovi Media Integrati (Biennio di Graphic Design).", 140, startY + 16, textW);
  
  textStyle(BOLD); fill(140, 210, 230); text("OBIETTIVO COMUNICATIVO:", 140, startY + 65);
  textStyle(NORMAL); fill(220);
  text("Questo atlante esplora la transcodifica mediale, trasformando i dati radio e le onde magnetiche dello spazio in suoni e onde grafiche animate in tempo reale.", 140, startY + 81, textW);

  textStyle(BOLD); fill(140, 210, 230); text("FONTI DEI DATI:", 140, startY + 130);
  textStyle(NORMAL); fill(220);
  text("I suoni e i dati tecnici appartengono agli archivi pubblici della NASA e provengono dalle registrazioni storiche delle sonde Voyager, Cassini e Juno.", 140, startY + 146, textW);

  textStyle(BOLD); fill(140, 210, 230); text("PUBBLICO DI RIFERIMENTO:", 140, startY + 195);
  textStyle(NORMAL); fill(190);
  text("L'interfaccia è progettata per un pubblico dagli 8-10 anni in su, unendo un'estetica visiva da plancia di controllo a modalità di scoperta semplici e immediate.", 140, startY + 211, textW);

  disegnaPulsanteHub(width - 240, height * 0.25, 100, 26, "CHIUDI [X]", color(140, 210, 230));
}


// --- COMPONENTI GRAFICI ---
function drawIntestazioneFissa() {
  noStroke(); textAlign(LEFT, TOP); textFont('Orbitron');
  textSize(14); textStyle(BOLD); fill(255);
  text("COSMIC RADIO GRAPHIES", 80, height * 0.05);
  textSize(9); textStyle(NORMAL); fill(140, 210, 230, 160);
  text("By Diletta Grazioli // Archivio di Sonificazione", 80, height * 0.082);
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


function disegnaPulsanteHub(x, y, w, h, testo, coloreTema) {
  let sopraPulsante = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  let r = red(coloreTema); let g = green(coloreTema); let b = blue(coloreTema);

  if (sopraPulsante) {
    cursor(HAND); fill(r, g, b, 35); stroke(coloreTema); strokeWeight(1.5); rect(x, y, w, h);
    fill(255); noStroke();
  } else {
    fill(8, 12, 18, 180); stroke(r, g, b, 75); strokeWeight(1); rect(x, y, w, h);
    fill(220); noStroke();
  }
  textFont('Orbitron'); textStyle(NORMAL); textSize(10); textAlign(CENTER, CENTER);
  text(testo, x + w/2, y + h/2);
}


// --- FUNZIONE MOUSE ---
function mousePressed() {
  userStartAudio();

  if (stato === "LANDING") {
    if (!scanStarted) {
      scanStarted = true;
      if (soundGenerale.isLoaded()) { soundGenerale.setVolume(0.25); soundGenerale.play(); }
    } 
    else if (scanComplete) {
      if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > height/2 + 10 && mouseY < height/2 + 50) {
        stato = "ATLANTE"; 
      }
    }
  }
  else if (stato === "ATLANTE") {
    if (mostraLegenda) {
      if (mouseX > width - 240 && mouseX < width - 140 && mouseY > height * 0.25 && mouseY < height * 0.25 + 26) { mostraLegenda = false; return; }
    }
    if (mostraInfo) {
      if (mouseX > width - 240 && mouseX < width - 140 && mouseY > height * 0.25 && mouseY < height * 0.25 + 26) { mostraInfo = false; return; }
    }

    if (mostraLegenda || mostraInfo) return;

    if (mouseX > 80 && mouseX < 260 && mouseY > height - 60 && mouseY < height - 30) { mostraLegenda = true; return; }
    if (mouseX > width - 260 && mouseX < width - 80 && mouseY > height - 60 && mouseY < height - 30) { mostraInfo = true; return; }

    let soleX = width * 0.5; 
    let soleY = height * 0.52;
    
    // MATRICE PERFETTAMENTE SINCRONIZZATA CON IL DRAW()
    let pianetiInterattivi = [
      ["GIOVE",    190, -0.4, "DECODE_GIOVE",    soundGiove],
      ["SATURNO",  240,  0.1, "DECODE_SATURNO",  soundSaturno],
      ["URANO",    290, -0.1, "DECODE_URANO",    soundUrano],
      ["NETTUNO",  340,  0.4, "DECODE_NETTUNO",  soundNettuno]
    ];

    for (let p of pianetiInterattivi) {
      let raggio = p[1];
      let angolo = p[2];
      let pX = soleX + cos(angolo) * raggio;
      let pY = soleY + sin(angolo) * raggio;
      
      let dMouse = dist(mouseX, mouseY, pX, pY);
      let inHoverPianeta = dMouse < 14;
      let inHoverTesto = mouseX > pX + 10 && mouseX < pX + 90 && mouseY > pY - 8 && mouseY < pY + 8;

      if (inHoverPianeta || inHoverTesto) {
        stato = p[3];
        if (p[4] && p[4].isLoaded()) { p[4].setVolume(0.4); p[4].play(); }
        return;
      }
    }
  }
  else if (stato.startsWith("DECODE_")) {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height - 55 && mouseY < height - 23) {
      if (soundGiove && soundGiove.isPlaying()) soundGiove.stop(); 
      if (soundSaturno && soundSaturno.isPlaying()) soundSaturno.stop(); 
      if (soundUrano && soundUrano.isPlaying()) soundUrano.stop();
      if (soundNettuno && soundNettuno.isPlaying()) soundNettuno.stop();
      stato = "ATLANTE";
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  img.resize(width, height);
}


