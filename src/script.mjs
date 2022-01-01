import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js";
import { bezier3 } from "../bezier3.mjs";

// cores
const PRETO = 0x000000;
const CINZA = 0xf0f0f0;
const VERMELHO = 0xff0000;
const AZUL = 0x0000ff;
const VERDE = 0x00ff00;

const BOLA_AMARELO = 0xffff00;
const BOLA_VERMELHO = 0xff0000;
const BOLA_VERDE = 0x00ff00;
const BOLA_AZUL = 0x0000ff;

const GRID_PAR = 0x9289b4;
const GRID_IMPAR = 0xff8866;

// dimensoes
const CUBO_SIZE = 20 * 2;

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

let mouseMoveMesh;
let renderer, scene, camera, raycaster, pointer, controls;
let objects = [];
let bolas = [];
let iBolaSelecionada = -1;
let rectasFinas = [];

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

      objects.push(square);
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
    SCREEN_WIDTH / SCREEN_HEIGHT,
    1,
    1000
  );

  // renderizacao
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);

  // controlos
  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 15;

  // intersecao de objetos
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  inicializacaoBolas();
  reposicionaBolas();

  // eventos
  document.addEventListener("pointermove", onMovimentoPonteiro);
  document.addEventListener("keydown", onTeclaClick);
}

function inicializacaoBolas() {
  // initializacao das bolas
  [BOLA_AMARELO, BOLA_VERMELHO, BOLA_VERDE, BOLA_AZUL].forEach((cor, i) => {
    const geometryBola = new THREE.SphereGeometry(0.5, 10, 10);
    const materialBola = new THREE.MeshBasicMaterial({
      color: cor,
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

function deSelecionaBolas() {
  bolas.forEach((bola, i) => {
    bola.material.opacity = 0.4;
  });
}

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

function clicaPixel() {
  const bola = bolas[iBolaSelecionada];
  bola.position.set(
    mouseMoveMesh.position.x,
    mouseMoveMesh.position.y,
    mouseMoveMesh.position.z
  );
}

function sobeBola() {
  if (iBolaSelecionada >= 0) {
    bolas[iBolaSelecionada].position.z += 0.1;
    rectaFina();
  }
}
function desceBola() {
  if (iBolaSelecionada >= 0) {
    bolas[iBolaSelecionada].position.z -= 0.1;
    rectaFina();
  }
}
function rectaFina() {
  if (rectasFinas[iBolaSelecionada] !== undefined) {
    scene.remove(rectasFinas[iBolaSelecionada]); // remove linha anterior
  }

  const bola = bolas[iBolaSelecionada];
  const coordenadas = [];
  coordenadas.push(new THREE.Vector3(bola.position.x, bola.position.y, 0));
  coordenadas.push(
    new THREE.Vector3(bola.position.x, bola.position.y, bola.position.z)
  );

  const rectaFina = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(coordenadas),
    new THREE.LineBasicMaterial({ color: PRETO })
  );
  rectasFinas[iBolaSelecionada] = rectaFina;
  scene.add(rectaFina);
}

function criaBezier() {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  const path = new Palhinha(1);
  const geometry = new THREE.TubeGeometry(path, 20, 0.25, 8, false);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#" + color),
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  deSelecionaBolas();
}

/**
 * lida com o evento de quando uma tecla e precionada
 * @param  {ClickEvent} event
 */
function onTeclaClick(event) {
  // console.log('key', event.code);
  switch (event.code) {
    case "Backspace": // tecla Apagar
      break;
    case "Space": // Tecla Espaco
      clicaPixel();
      break;
    case "KeyX": // tecla X
      criaBezier();
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
}

/**
 * desenha a posicao do ponteiro no plano
 * @param  {MouseEvent} event
 */
function onMovimentoPonteiro(event) {
  const x = (event.clientX / SCREEN_WIDTH) * 2 - 1;
  const y = -(event.clientY / SCREEN_HEIGHT) * 2 + 1;
  pointer.set(x, y);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects, false);

  if (intersects.length > 0) {
    const intersect = intersects[0];

    if (intersect.face.normal) {
      mouseMoveMesh.position.copy(intersect.point).add(intersect.face?.normal);
      mouseMoveMesh.position.divideScalar(1).floor().multiplyScalar(1);
      mouseMoveMesh.position.z = 0;
    }
  }
}

function visualizadorAjuda() {
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
			desenhe com [X]`;
  }

  document.querySelector(".float p").innerHTML = html;
}

/**
 * renderiza o cenario
 */
function renderiza() {
  requestAnimationFrame(renderiza);
  controls.update();

  renderer.render(scene, camera);
  visualizadorAjuda();
}

// inicializa & renderiza o scenario inicial
inicializa();
renderiza();
