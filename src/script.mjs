import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js";
import { bezier3 } from "../bezier3.mjs";

// cores
const PRETO = 0x000000;
const CINZA = 0xf0f0f0;
const VERMELHO = 0xff0000;
const AZUL = 0x0000ff;
const VERDE = 0x00ff00;

const BOLAS_CORES = ['yellow', 'red', 'green', 'blue'];

const GRID_PAR = 0x9289b4;
const GRID_IMPAR = 0xff8866;

// dimensoes
const CUBO_SIZE = 20 * 2;

let mouseMoveMesh;
let renderer, scene, camera, raycaster, pointer, controls;
let objectosIntercetar = [];
let objectosApagar = [];

let bolas = [];
let iBolaSelecionada = -1;
let retasFinas = [];

/**
 * Classe "Palhinha" para representar a curva Bézier
 */
class Palhinha extends THREE.Curve {
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }

  converteBolaParaVector3(bola) {
    return new THREE.Vector3(bola.position.x, bola.position.y, bola.position.z);
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const vetor = bezier3(
      this.converteBolaParaVector3(bolas[0]),
      this.converteBolaParaVector3(bolas[1]),
      this.converteBolaParaVector3(bolas[2]),
      this.converteBolaParaVector3(bolas[3]),
      t
    );

    return optionalTarget
      .set(vetor.x, vetor.y, vetor.z)
      .multiplyScalar(this.scale);
  }
}

/**
 * Inicializa a pagina com os objectos
 */
function inicializa() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CINZA);

  // grelha
  const grid = new THREE.PlaneGeometry(1, 1, 1, 1);
  const colorir = {
    PAR: new THREE.LineBasicMaterial({
      color: GRID_PAR,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    }),
    IMPAR: new THREE.LineBasicMaterial({
      color: GRID_IMPAR,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    }),
  };
  for (let x = -10; x < 10; x += 1) {
    for (let y = -10; y < 10; y += 1) {
      const linha = (x + y) % 2 === 0 ? colorir.PAR : colorir.IMPAR;
      const square = new THREE.Mesh(grid, linha);
      square.position.x = x;
      square.position.y = y;
      square.position.z = 0;

      objectosIntercetar.push(square);
      scene.add(square);
    }
  }

  // linha referencial y
  const coordenadasY = [];
  coordenadasY.push(new THREE.Vector3(0, 0, 0));
  coordenadasY.push(new THREE.Vector3(0, CUBO_SIZE / 4, 0));

  const lineY = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(coordenadasY),
    new THREE.LineBasicMaterial({ color: VERMELHO })
  );
  scene.add(lineY);

  // linha referencial x
  const coordenadasX = [];
  coordenadasX.push(new THREE.Vector3(0, 0, 0));
  coordenadasX.push(new THREE.Vector3(CUBO_SIZE / 4, 0, 0));
  const lineX = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(coordenadasX),
    new THREE.LineBasicMaterial({ color: AZUL })
  );
  scene.add(lineX);

  // linha referencial z
  const coordenadasZ = [];
  coordenadasZ.push(new THREE.Vector3(0, 0, -CUBO_SIZE / 4));
  coordenadasZ.push(new THREE.Vector3(0, 0, CUBO_SIZE / 4));
  const lineZ = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(coordenadasZ),
    new THREE.LineBasicMaterial({ color: VERDE })
  );
  scene.add(lineZ);

  // quadrado apontador
  const mouseMoveGeo = new THREE.BoxGeometry(1, 1, 0);
  const mouseMoveMaterial = new THREE.MeshBasicMaterial({
    color: VERMELHO,
    opacity: 0.4,
    transparent: true,
  });
  mouseMoveMesh = new THREE.Mesh(mouseMoveGeo, mouseMoveMaterial);
  scene.add(mouseMoveMesh);

  // camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  // renderizacao
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controlos
  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 15;

  // intersecao de objetos
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  inicializaBolas();
  reposicionaBolas();
  visualizadorAjuda();

  // eventos
  document.addEventListener("pointermove", onMovimentoPonteiro);
  document.addEventListener("keydown", onTeclaClick);
  window.addEventListener("resize", onWindowResize);
}

/**
 * initializacao das 4 bolas
 */
function inicializaBolas() {
  BOLAS_CORES.forEach((cor, i) => {
    const geometryBola = new THREE.SphereGeometry(0.5, 10, 10);
    const materialBola = new THREE.MeshBasicMaterial({
      color: new THREE.Color(cor),
      transparent: true,
    });

    const bola = new THREE.Mesh(geometryBola, materialBola);
    bolas[i] = bola;
    scene.add(bola);
  });
}

/**
 * mete as bolas na sua posicao inicial
 */
function reposicionaBolas() {
  deSelecionaBolas();

  bolas.forEach((bola, i) => {
    bola.position.x = -5 + i * 3;
    bola.position.y = -3;
    bola.position.z = 0;
  });
}

/**
 * Remove opacidade maxima de todas as bolas
 */
function deSelecionaBolas() {
  bolas.forEach((bola, i) => {
    bola.material.opacity = 0.4;
  });
}

/**
 * Seleciona a bola na "posicao"
 * @param  {int} posicao Posicao de 0 a 4
 */
function selecionaBola(posicao) {
  deSelecionaBolas();

  if (iBolaSelecionada === posicao) {
    // deseleciona se clicar de novo
    iBolaSelecionada = -1;
    return;
  }

  iBolaSelecionada = posicao;
  bolas[iBolaSelecionada].material.opacity = 1;
}

/**
 * Colaca a bola selecionada na posicao do rato
 */
function clicaPixel() {
  const bola = bolas[iBolaSelecionada];
  bola.position.set(
    mouseMoveMesh.position.x,
    mouseMoveMesh.position.y,
    mouseMoveMesh.position.z
  );
}

/**
 * Sobe a bola selecionada no eixo Z
 */
function sobeBola() {
  if (iBolaSelecionada >= 0) {
    bolas[iBolaSelecionada].position.z += 0.1;
    rectaFina();
  }
}

/**
 * Desce a bola selecionada no eixo Z
 */
function desceBola() {
  if (iBolaSelecionada >= 0) {
    bolas[iBolaSelecionada].position.z -= 0.1;
    rectaFina();
  }
}

/**
 * Cria a linha vertical na bola selecionada no eixo Z
 */
function rectaFina() {
  // se já existe uma linha desenhada anteriormente, apaga-a
  if (retasFinas[iBolaSelecionada] !== undefined) {
    scene.remove(retasFinas[iBolaSelecionada]);
  }

  // cria uma linha entre z=0 até à posicao z selecionada
  const bola = bolas[iBolaSelecionada];
  const coordenadas = [];
  coordenadas.push(new THREE.Vector3(bola.position.x, bola.position.y, 0));
  coordenadas.push(
    new THREE.Vector3(bola.position.x, bola.position.y, bola.position.z)
  );

  const retaFina = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(coordenadas),
    new THREE.LineBasicMaterial({ color: PRETO })
  );
  retasFinas[iBolaSelecionada] = retaFina;
  scene.add(retaFina);
  objectosApagar.push(retaFina);
}

/**
 * Cria a linha Bézier usando a class "Palhinha"
 */
function criaBezier() {
  // cor aleatória
  const corPalhinha = Math.floor(Math.random() * 16777215).toString(16);

  const path = new Palhinha(1);
  const geometry = new THREE.TubeGeometry(path, 20, 0.25, 8, false);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#" + corPalhinha),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  objectosApagar.push(mesh);

  deSelecionaBolas();
}

/**
 * limpa todos os objectos desenhados pelo utilizador
 */
function limpaTela() {
  objectosApagar.forEach((x) => scene.remove(x));
  camera.position.set(0, 0, 15);
}

/**
 * lida com o evento de quando uma tecla e precionada
 * @param  {ClickEvent} event
 */
function onTeclaClick(event) {
  switch (event.code) {
    case "Backspace": // tecla Apagar
      limpaTela();
      break;
    case "Space": // tecla Espaco
      clicaPixel();
      break;
    case "KeyX": // tecla X
      criaBezier();
      deSelecionaBolas();
      iBolaSelecionada = -1;
      break;
    case "Digit1": // tecla 1
      selecionaBola(0);
      break;
    case "Digit2": // tecla 2
      selecionaBola(1);
      break;
    case "Digit3": // tecla 3
      selecionaBola(2);
      break;
    case "Digit4": // tecla 4
      selecionaBola(3);
      break;
    case "KeyW": // tecla "W"
      sobeBola();
      break;
    case "KeyS": // tecla "S"
      desceBola();
      break;
  }

  visualizadorAjuda();
}

/**
 * desenha a posicao do ponteiro no plano
 * @param  {MouseEvent} event
 */
function onMovimentoPonteiro(event) {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  pointer.set(x, y);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objectosIntercetar, false);

  if (intersects.length > 0) {
    const intersect = intersects[0];

    if (intersect.face.normal) {
      mouseMoveMesh.position.copy(intersect.point).add(intersect.face?.normal);
      mouseMoveMesh.position.divideScalar(1).floor().multiplyScalar(1);
      mouseMoveMesh.position.z = 0;
    }
  }
}

/**
 * re-posiciona o plano e camera para o novo tamanho da janela
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log("aqui");
}

/**
 * mostra o texto informativo
 */
function visualizadorAjuda() {
  const alerta = document.querySelector(".alerta");

  let html = `Seleccione uma bola com [1 - 4]<br>
				Posicione a bola com [Espaco]<br>
				Desenhe a Bézier com [X]`;

  if (iBolaSelecionada >= 0) {
    const bola = bolas[iBolaSelecionada];
    const { x, y, z } = bola.position;
    html = `
			bola ${iBolaSelecionada + 1} selecionada<br/>
			posicao: [${x}, ${y}, ${Math.round(z * 100) / 100}]<br/><br/>
			posicione com cursor + [Espaco]<br/>
      suba ou desca a bola com [W/S]<br>
			desenhe com [X]`;

    alerta.style.borderColor = BOLAS_CORES[iBolaSelecionada];
  } else {
    // cor por defeito
    alerta.style.borderColor = "#000000";
  }

  document.querySelector(".alerta p").innerHTML = html;
}

/**
 * renderiza o cenario
 */
function renderiza() {
  requestAnimationFrame(renderiza);
  controls.update();
  renderer.render(scene, camera);
}

// inicializa & renderiza o scenario inicial
inicializa();
renderiza();
