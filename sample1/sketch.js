class Particle {
  constructor() {
    this.pos = p5.Vector.random3D().mult(random(100));
    this.vel = createVector(0, 0, 0);
    this.color = color(255, 120, 0, 255)
  }
  explode() {
    this.vel = p5.Vector.random3D().mult(random(3, 8));
  }

  update() {
    if (exploded) {
      this.pos.add(this.vel);
    } else {
      this.pos.add(p5.Vector.random3D().mult(1.5)); // 진동
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    stroke(0)
    strokeWeight(1)
    fill(this.color);
    box(7);
    pop();
  }
}

class FearParticle {
  constructor() {
    this.pos = p5.Vector.random3D().mult(random(500, 700));

    // 카메라 쪽으로 날아오게
    let camPos = createVector(0, 0, 500);
    this.vel = p5.Vector.sub(camPos, this.pos).normalize().mult(random(5, 10));

    this.size = random(20, 40);
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    let dir = this.vel.copy().normalize();
    let axis = createVector(0, 1, 0).cross(dir);   // ← 기준 
    let angle = acos(createVector(0, 1, 0).dot(dir)); 
    if (axis.mag() > 0.0001) {
      rotate(angle, axis);
    }

    fill(80, 120, 255);
    noStroke();
    cone(this.size * 0.3, this.size);
    pop();
  }
}

//전역변수 추가
let particles = [];
let fearParticles = [];
let exploded = false;
let explosionTimer = 200;
let camPos;


let emotionIndex = ['calm', 'anger', 'panic', 'joy'];
let indexNum = 0;

let currentScreen = 'intro';
let emotion = 'calm';
let angleOffset = 0;

let transitionFrame = -1;     // 감정이 바뀐 프레임 기록
let prevEmotion = emotion;   // 이전 감정 상태 기억
let blurDuration = 30;       // 블러 지속 프레임 수 (약 0.5초)

let myFont;
let calmQuote = [
  "나는 고요함이야\n 세상이 아무 말도 하지 않을 때, 나는 너에게 말해.", "그 침묵 속에서 너는 비로소 너 자신을 마주할 수 있지",
];
let angerQuote = [
  "안녕, 나는 분노야",
  "내가 나타났다고 놀라지 마\n고요함이 무시당했을 때, 나는 너를 지키러 온 거야",
  "나를 두려워하지 마 — 나는 너의 ‘지킴이’야",
];
let panicQuote = [
  "나는 공포야\n분노조차 감당되지 않았을 때, 나의 차례가 와",
  "나는 너를 혼란스럽게 하지만, 사실…\n나는 네가 얼마나, 소중한 존재인지를 보여주고 싶었을 뿐이야.",
];

let quoteIndex = 0;
let changeInterval = 300;

let introTexts = [
  "감정은 때때로 우리를 흔들지만…",
  "...그것은 우리가 이해해야 할, 하나의 구조입니다."
];
let introTextIndex = 0;
let introTextTimer = 0;
let introTextDuration = 170;
let showStartPrompt = false;
let endingTexts = [
  "감정은 흘러가고,\n남는 것은 이해의 구조입니다.",
  "당신의 감정도,\n이 구조 안에서 존재할 수 있습니다.",
  "감사합니다."
];
let endingTextIndex = 0;
let endingTextTimer = 0;
let endingTextDuration = 170; // 한 문장당 프레임 수

function preload() {
  myFont = loadFont('NanumGothic.ttf');
  calmCharacterImg = loadImage('calmCharacter.png');
  angerCharacterImg = loadImage('angerCharacter.png');
  panicCharacterImg = loadImage('panicCharacter.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  strokeWeight(1);
  noFill();
  textFont(myFont);
  textAlign(LEFT, TOP);
  textSize(20);
  
  camPos=createVector(0,0,500);
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  
    for (let i = 0; i < 10; i++) {
     fearParticles.push(new FearParticle());
    }
  }
}

function draw() {
  if (currentScreen === 'intro') {
    drawIntro();
    return;
  } else if (currentScreen === 'credits') {
    drawCredits();
    return;
  }
  
  else if (currentScreen === 'main') {
    orbitControl();
  
    if (emotion === 'calm' ) 
      drawCalmShapes();
    else if (emotion === 'anger' )
      drawAngerShapes();
    else if (emotion === 'panic' )
      drawPanicShapes();
    
    
    emotionTransition();
  }
  
  
}

function keyPressed() {
  if (key === 'a' || key === 'A') emotion = 'anger';
  else if (key === 'c' || key === 'C') emotion = 'calm';
  else if (key === 'f' || key === 'F') fullscreen(!fullscreen());
  else if (keyCode === RIGHT_ARROW && currentScreen === 'intro')       
    currentScreen = 'main';
  else if (keyCode === RIGHT_ARROW && indexNum < 4) {
     emotion = emotionIndex[indexNum];
    indexNum++;
  }
   
  else if (key === 'e' || key === 'E') currentScreen = 'credits';
  else if (key === 'p' || key === 'P') emotion = 'panic';
}

function drawIntro() {
  resetMatrix();
  camera();
  noLights();
  background(30);
  
  push();
  translate(-width / 2 + 20, -height / 2 + 20); // 좌측 상단 위치
  textAlign(LEFT, TOP);
  fill(255, 180);
  textSize(14);
  text("조작법 안내:\nC - 고요\nA - 분노\nP - 공포\nE - 엔딩/크레딧", 0, 0);
  pop();
  
  
  
  // 3개의 회전하는 토러스
  push();
  translate(-100, -100, 0); // x: 왼쪽, y: 위쪽, z: 그대로
  rotateY(frameCount * 0.7);
  rotateX(frameCount * 0.7);
  stroke(200, 180, 220); // 보라색
  strokeWeight(1.5);
  noFill();
  torus(100, 20, 24, 16);
  pop();

  push();
  translate(100, -100, 0); // x: 왼쪽, y: 위쪽, z: 그대로
  rotateY(frameCount * 0.9);
  rotateX(frameCount * 0.9);
  stroke(170, 230, 210); // 민트색 토러스
  torus(100, 20, 24, 16);
  pop();
  
  push();
  translate(0, -50, 0); // x: 왼쪽, y: 위쪽, z: 그대로
  rotateY(frameCount * 1.1);
  rotateX(-frameCount * 1.1);
  stroke(255, 200, 180); // 주황색 토러스
  torus(100, 20, 24, 16);
  pop();
  
  let t = introTextTimer % introTextDuration;
  let alpha = 0;

  if (t < 30) {
    alpha = map(t, 0, 30, 0, 255); // 페이드 인
  } else if (t < 120) {
    alpha = 255; // 유지
  } else {
    alpha = map(t, 120, introTextDuration, 255, 0); // 페이드 아웃
  }

  // 문장을 순서대로 번갈아 표시하되, 첫 프레임에는 넘어가지 않도록
  if (t === 0 && introTextTimer > 0) {
    introTextIndex = (introTextIndex + 1) % introTexts.length;
  }

  // 두 문장 모두 한 번 이상 출력되면 시작 문구 표시
  if (introTextTimer > introTextDuration * introTexts.length) {
    showStartPrompt = true;
  }

  introTextTimer++;

  push();
  translate(-width / 2, -height / 2);
  textAlign(CENTER, CENTER);
  textFont(myFont);

  // 메인 문장 표시
  fill(255, alpha);
  textSize(24);
  text(introTexts[introTextIndex], width / 2, height - 130);

  // 시작 안내 문구 (하단 중앙 깜빡임)
  if (showStartPrompt && frameCount % 60 < 30) {
    fill(255, 180);
    textSize(16);
    text("→ 키를 눌러 시작", width / 2, height - 80);
  }

  pop();
  
  // 2D처럼 텍스트 출력
  push();
  translate(-width / 2, -height / 2);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("By 김승미, 이하경, 신성현", width - 660, height - 40);
  pop();
}


function drawCredits() {
  
  
  
  background(0);
  noLights();
  textAlign(CENTER, CENTER);
  textFont(myFont);

  // 페이드 인/아웃 처리
  let t = endingTextTimer % endingTextDuration;
  let alpha = 0;

  if (t < 30) {
    alpha = map(t, 0, 30, 0, 255); // 페이드 인
  } else if (t < 120) {
    alpha = 255; // 유지
  } else {
    alpha = map(t, 120, endingTextDuration, 255, 0); // 페이드 아웃
  }

  // 문장을 순서대로 번갈아 표시
  if (t === 0 && endingTextTimer > 0) {
    endingTextIndex = (endingTextIndex + 1) % endingTexts.length;
  }

  endingTextTimer++;

  // 중앙 텍스트 표시
  fill(255, alpha);
  textSize(24);
  text(endingTexts[endingTextIndex], 0, 0);

  // 크레딧 텍스트
  fill(255, 150);
  textSize(14);
  text("개발 · 시각화: 김승미, 이하경, 신성현", 0, height / 2 - 60);
}


function DisplayQuote() {
  let t = frameCount % changeInterval;
  let alpha;
  
  if (t < 30) {
  alpha = map(t, 0, 30, 0, 200);         // 페이드 인
} else if (t < 270) {
  alpha = 200;                          // 유지
} else {
  alpha = map(t, 270, 300, 200, 0);     // 페이드 아웃
}
  
  let currentQuote;
  if (emotion === 'calm') {
    
    currentQuote = calmQuote[quoteIndex];
    if (t === changeInterval - 1)
      quoteIndex = (quoteIndex + 1) % calmQuote.length;
    }
  else if (emotion === 'anger') {
    currentQuote = angerQuote[quoteIndex];
    if (t === changeInterval - 1) {
      quoteIndex = (quoteIndex + 1) % angerQuote.length;
    }
  } 
  else if (emotion === 'panic') {
    
    currentQuote = panicQuote[quoteIndex];
    if (t === changeInterval - 1) {
      quoteIndex = (quoteIndex + 1) % panicQuote.length;
    }
  }
  

  push();
  noLights();
  translate(-width / 2 + width * 0.2, -height / 2 + height * 0.1);
  if (emotion === 'calm'){
      fill(26, 26, 128, alpha);
  }
  else if (emotion === 'anger'){
    fill(255, alpha);
  }
  else if (emotion === 'panic'){
    fill(200, 220, 255, alpha);
  }
  textFont(myFont);
  textSize(20);
  text(currentQuote, 0, 0);
  
  
  let charImg = null;
 
  if (emotion === 'calm') charImg = calmCharacterImg;
  else if (emotion === 'anger') charImg = angerCharacterImg;
  else if (emotion === 'panic') charImg = panicCharacterImg;

  if (charImg) {
    image(charImg, -50,50, 170, 190);
  }
  
  
  
  
  pop();
}

function drawCalmShapes() {
  angleOffset += 0.2;
  
  background("#B9E0FD");
  
  strokeWeight(1);
  DisplayQuote();
  for (let zAngle = 0; zAngle < 180; zAngle += 30) {
    for (let xAngle = 0; xAngle < 360; xAngle += 30) {
      push();
      rotateZ(zAngle);
      rotateX(xAngle + angleOffset);
      translate(0, 250, 0);
      stroke(80, 50, 150);
      box(20);
      pop();
    }
  }
}




function drawAngerShapes() {
  blendMode(BLEND)
  background('#D32F2F');
  DisplayQuote();
  ambientLight(150);
  pointLight(255, 100,100, 0, 0, 300);
  rotateY(frameCount * 0.01);

  noFill();
  stroke(0);
  strokeWeight(5)
  box(200);

  // 폭발
  if (!exploded) {
    explosionTimer--;
    if (explosionTimer <= 0) {
      exploded = true;
      for (let p of particles) {
        p.explode();
      }
    }
  }

  // 파티클 
  for (let p of particles) {
    p.update();
    p.display();
  }
}

function drawPanicShapes() {
  background('#263238'); 
  DisplayQuote();

  ambientLight(100);
  pointLight(80, 120, 255, 0, 0, 300); 

  for (let p of fearParticles) {
    p.update();
    p.display();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function emotionTransition() {
  if (emotion !== prevEmotion) {
    transitionFrame = frameCount;
    prevEmotion = emotion;
    quoteIndex = 0;
  }

  let elapsed = frameCount - transitionFrame;
  if (elapsed < blurDuration) {
    let alpha = map(elapsed, 0, blurDuration, 255, 0);
    push();
    noStroke();
    fill(255, alpha);
    rect(-width / 2, -height / 2, width, height);  // 전체 화면 덮기
    pop();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
