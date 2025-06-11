class Sparkle {  // class 및 vector 관련 AI 참고함
  constructor(x, y, z) {
    this.pos = createVector(x, y, z);
    this.vel = p5.Vector.random3D().mult(random(1, 3));
    this.lifespan = 255;
    this.size = random(3, 6);
    this.color = color(random(200, 255), random(200, 255), random(100, 255));
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 4;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    sphere(this.size);
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}

class Particle {
  constructor() {
    this.pos = p5.Vector.random3D().mult(random(100));//입자의 위치를 나타내는 3D벡터 AI 이용하여 제작
    this.vel = createVector(0, 0, 0);
    this.color = color('#FFFF00')
  }
  explode() {
    this.vel = p5.Vector.random3D().mult(random(10,20));
  }

  update() {
    if (exploded) {
      this.pos.add(this.vel);
    } else {
      this.pos.add(p5.Vector.random3D().mult(1.5)); // 입자가 진동하는 부분 AI이용하여 제작
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

    // 원뿔이 카메라 쪽으로 날아오게 하는 부분 AI 이용하여 제작
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
    let axis = createVector(0, 1, 0).cross(dir);   
    // 회전축과 각도 계산 AI 이용하여 제작 
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
let sparkles=[];

let balls = [];
let pocket;
let animationStarted = false;
let animationStartFrame;
let currentEmotion = "";
let emotionEndLimit = animationStartFrame + 150 + 200;


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

let joyQuote = [
  "나는 기쁨이야!\n너는 여기까지 잘 견뎌냈어",
  "감정은 돌고 돌아 결국 너를 위한 것이었어"
];

let quoteIndex = 0;
let changeInterval = 300; //텍스트 전환 시간

let introTexts = [
  "안녕! 우리를 소개할게 — 우리는 너의 감정들이야.",
  "너를 더 잘 이해하기 위해, 우리 이야기를 들려줄게."
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
  joyCharacterImg = loadImage('joyCharacter.png');
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
  
   balls = [ // Vector 사용 관련 AI 참고함.
 { pos: createVector(-200, -100, 0), color: color(255, 230, 0), delay: 0, emotion: "때로는 기쁨," },
 { pos: createVector(-100, -100, 0), color: color(255, 50, 50), delay: 50, emotion: "때로는 분노," },
 { pos: createVector(0, -100, 0), color: color(180, 100, 255), delay: 100, emotion: "때로는 공포," },
 { pos: createVector(100, -100, 0), color: color(100, 150, 255), delay: 150, emotion: "때로는 평온," }
 ];
  pocket = createVector(0, 150, 0);
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
    else if (emotion === 'joy')
      drawJoyShapes();
    
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
  else if (key === 'j' || key === 'J') emotion = 'joy';
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
  text("조작법 안내:\n→ : 화면 전환\nC : 고요\nA : 분노\nP : 공포\nJ : 기쁨\nE : 엔딩/크레딧", 0, 0);
  pop();
  
  
  
  // 4개의 회전하는 토러스
  push();
  translate(-250, -100, 0); // x: 왼쪽, y: 위쪽, z: 그대로
  rotateY(frameCount * 0.5);
  rotateX(frameCount * 0.5);
  stroke(250, 0, 0); // 빨간색 (분노)
  strokeWeight(1.5);
  noFill();
  torus(100, 20, 24, 16);
  pop();

  push();
  translate(-100, -50, 0); // x: 왼쪽, y: 위쪽, z: 그대로
  rotateY(frameCount * 0.7);
  rotateX(frameCount * 0.7);
  stroke(153, 51, 255); // 보라색 토러스 (공포)
  torus(100, 20, 24, 16);
  pop();

  push();
  translate(50, -100, 0); // x: 왼쪽, y: 위쪽, z: 그대로
  rotateY(frameCount * 0.9);
  rotateX(frameCount * 0.9);
  stroke(255, 200, 0); // 노란색 토러스 (기쁨)
  torus(100, 20, 24, 16);
  pop();
  
  push();
  translate(200, -50, 0); // x: 왼쪽, y: 위쪽, z: 그대로
  rotateY(frameCount * 1.1);
  rotateX(frameCount * 1.1);
  stroke(0, 0, 250); // 파란색 토러스 (슬픔)
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
  background(20);
  noStroke();
  lights();

  if (!animationStarted) {
    animationStarted = true;
    animationStartFrame = frameCount;
  }

  // 주머니
  push();
  translate(pocket.x, pocket.y, pocket.z);
  fill(0, 204, 204);
  sphere(80);
  pop();

  // 감정 문구 초기화
  currentEmotion = "";
  let emotionEndLimit = animationStartFrame + 150 + 200;

  for (let i = 0; i < balls.length; i++) {
    let b = balls[i];
    let t = frameCount - animationStartFrame - b.delay;

    // 공 이동
    if (t > 0 && t < 400) {
      let amt = constrain(t / 800, 0, 1);
      b.pos = p5.Vector.lerp(b.pos, pocket, amt);
    }

    let d = p5.Vector.dist(b.pos, pocket);
    let displayDuration = (b.emotion === "때로는 평온,") ? 200 : 400;

    if (frameCount < emotionEndLimit && d < 40 && t > 0 && t < displayDuration) {
      currentEmotion = b.emotion;
    }

    // 공 그리기
    push();
    translate(b.pos.x, b.pos.y, b.pos.z);
    fill(b.color);
    sphere(30);
    pop();
  }

  // 감정 텍스트
  if (currentEmotion !== "") {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(currentEmotion, 0, -height / 3);
  }

  // 엔딩 문구
  if (frameCount > emotionEndLimit && frameCount < emotionEndLimit + 400) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("수많은 감정들이 때때로 너를 흔들겠지만,\n\n이를 모두 받아들일 때,\n\n너는 더 단단해질거야!", 0, -height / 4);
  }

  // 마지막 엔딩 크레딧
  if (frameCount > emotionEndLimit + 250) {
  orbitControl();
  background(10);
  fill(255);
  textAlign(LEFT, TOP);
  textSize(18);

  let x = -width / 2 + 450;
  let y = -height / 2 + 60;

  // 이름 및 소감
  let developerText = "김승미\n" +
                      "이번 프로젝트는 일상에서 자주 느끼는 감정 네 가지를 시각적으로 표현하는 데 중점을 두었습니다. \n감정은 추상적인 개념이라 시각화가 쉽지 않았고, 사람마다 느끼고 표현하는 방식이 달라 이를 하나로 표현하는 데 많은 시간이 걸렸지만\n열심히 한만큼 결과물이 나와 많이 배우면서 즐겁게 작업했습니다.\n\n" + "신성현\n프로젝트를 통해 각자 역할을 분담하여 협업하며, 그 과정에서 코드 통합과 스타일 일관성 유지의 중요성을 실감했습니다.\n이러한 프로젝트의 경험은 앞으로 해야할 졸업 프로젝트에 많은 도움이 될 것 같습니다\n\n" + "이하경\n한 프로그램을 여러 명이 함께 만들 때 어려움이 많을 것이라고 예상했지만, 협업하여 만들어나가는 과정에서 책임감과 협동심을 배우게 되었습니다.\n또한, 프로그램을 만들며 한 학기 동안 배운 내용을 되짚어볼 수 있는 소중한 기회였습니다.\n\n";
  text(developerText, x, y);

  y += 320;

  //AI 사용 비율
  let aiText = "AI 활용 내역\n" +
               "• 전체 코드 대비 AI 사용 비율: 약 60%\n" +
               "• 감정별 캐릭터를 대표하는 이미지 AI(ComfyUI) 통해 생성함\n\n";
  text(aiText, x, y);

  y += 120;

  //문법 정리 사항
  let codeText = "JavaScript 및 p5.js 기능 요약\n\n" +
                 "JavaScript 문법\n" +
                 "- 클래스(class): Sparkle, Particle, FearParticle 객체 정의\n" +
                 "- 조건문/반복문: if, for 사용\n" +
                 "- 전역 변수/배열: 감정 상태 및 객체 저장\n" +
                 "- 함수 분리: 감정별 draw 함수, DisplayQuote 등으로 기능별 분리\n\n" +
                 "p5.js 기능\n" +
                 "- 기본 구조: setup(), draw(), preload()\n" +
                 "- 3D 그래픽: box(), sphere(), torus()로 3D 도형 표현\n" +
                 "- 카메라 제어: orbitControl()로 3D 시점 회전\n" +
                 "- 이미지 출력: loadImage(), image()로 캐릭터 이미지 출력\n" +
                 "- 텍스트 처리: text(), fill(), alpha 기반 페이드 효과로 텍스트 출력";
  text(codeText, x, y);

  // 마무리 인사
  textAlign(CENTER, CENTER);
  textSize(16);
  fill(180);
  text("감사합니다.", 0, height / 2 - 80);
}

}



function DisplayQuote() {
  let t = frameCount % changeInterval;
  let alpha;
  
  //투명도 조정하여 페이드 인&아웃 조절하는 부분 AI 이용해 제작
  if (t < 30) {
  alpha = map(t, 0, 30, 0, 200);         // 페이드 인
} else if (t < 270) {
  alpha = 200;                          // 유지
} else {
  alpha = map(t, 270, 300, 200, 0);     // 페이드 아웃
}
  
  //frameCounnt와 changeInterval 변수 사용하여 텍스트 전환 AI 도움 받아서 제작
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
  else if (emotion === 'joy') {
    currentQuote = joyQuote[quoteIndex];
  if (t === changeInterval - 1) {
    quoteIndex = (quoteIndex + 1) % joyQuote.length;
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
  else if (emotion === 'joy'){
    fill(180, 120, 40, alpha)
  }
  textFont(myFont);
  textSize(20);
  text(currentQuote, 0, 0);
  
  
  let charImg = null;
 
  if (emotion === 'calm') charImg = calmCharacterImg;
  else if (emotion === 'anger') charImg = angerCharacterImg;
  else if (emotion === 'panic') charImg = panicCharacterImg;
  else if (emotion === 'joy') charImg = joyCharacterImg;
  if (charImg) {
    image(charImg, -50,50, 170, 190);
  }
  
  pop();
}

function drawCalmShapes() {
  angleOffset += 0.2;
  
    //3D box 이용하여 원 모양의 기하학적 도형 제작 AI 이용하여 제작
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
  blendMode(BLEND);
  background(30);
  DisplayQuote();

  ambientLight(150);
  pointLight(255, 100, 100, 0, 0, 300);
  rotateY(frameCount * 0.01);

  
  if (!exploded) {
    stroke(216, 0, 0);
    strokeWeight(5);
    noFill();
    box(200);

    explosionTimer--;
    if (explosionTimer <= 0) {
      exploded = true;
      for (let p of particles) {
        p.explode();
      }
    }
  }

  
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

function drawJoyShapes() {
  background('#FFFC95');
  // 스파클
  if (frameCount % 3 === 0) {
    for (let i = 0; i < 5; i++) {
      sparkles.push(new Sparkle(random(-500,500), random(-500,500), random(-500,500)));
    }
  }

  // 스파클 업데이트 및 그리기
  for (let i = sparkles.length - 1; i >= 0; i--) {
    sparkles[i].update();
    sparkles[i].display();
    if (sparkles[i].isDead()) {
      sparkles.splice(i, 1);
    }}
  angleOffset += 1;
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



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function emotionTransition() {
  //감정 전환 판단 구조 (emotion !== prevEmotion) AI 사용하여 제작
  if (emotion !== prevEmotion) {
    transitionFrame = frameCount;
    prevEmotion = emotion;
    quoteIndex = 0;
  }
  //블러 효과 AI 사용해서 제작
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
