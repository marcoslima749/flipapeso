import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { gsap } from "gsap";
    
import { CustomEase } from "gsap/CustomEase";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";


gsap.registerPlugin(RoughEase,ExpoScaleEase,SlowMo,CustomEase);

const scene =  new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
const bg = document.querySelector("#bg");
const renderer = new THREE.WebGLRenderer({
  canvas: bg,
  alpha: true
});

//Tomando la medida del padre #app para mantener el canvas dentro del elemento
//let anchoApp = document.getElementById("app").offsetWidth;

renderer.setPixelRatio(window.devicePixelRatio);
console.log(window.devicePixelRatio)
renderer.setSize(window.innerWidth * 0.6,window.innerHeight * 0.6);
camera.position.setZ(30);

const colorFondo = new THREE.Color(0xbdb4a5);
//scene.background = colorFondo;

const caraTexture = new THREE.TextureLoader().load('./assets/pesofrente.jpg');
const cantoTexture = new THREE.TextureLoader().load('./assets/pesocanto.jpg');
const secaTexture = new THREE.TextureLoader().load('./assets/pesodorso.jpg');

const caraBump = new THREE.TextureLoader().load('./assets/pesofrentebump.jpg');
const secaBump = new THREE.TextureLoader().load('./assets/pesodorsobump.jpg');
const cantoBump = new THREE.TextureLoader().load('./assets/pesocantobump.jpg');

const geometry = new THREE.CylinderGeometry(10,10,2);
const cara = new THREE.MeshStandardMaterial({map: caraTexture, bumpMap: caraBump, bumpScale: 1.6});
const canto = new THREE.MeshStandardMaterial({map: cantoTexture, bumpMap: secaBump, bumpScale: 1.6});
const seca = new THREE.MeshStandardMaterial({map: secaTexture, bumpMap: cantoBump, bumpScale: 1.6});
const materials = [canto,cara,seca];
const moneda = new THREE.Mesh(geometry,materials);
moneda.rotation.x = 90 / 57.2958; //todos los ángulos están en radianes


scene.add(moneda);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(12,12,12);

const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(pointLight, ambientLight);

//const lightHelper = new THREE.PointLightHelper(pointLight);
//const gridHelper = new THREE.GridHelper(200,50);
//scene.add(lightHelper,gridHelper);

//const controls = new OrbitControls(camera,renderer.domElement);


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
});

const resultado = document.getElementById("resultado");
let esCara = true;
let tiroAnterior = true;
let girando = false;

const flip = () => {
  esCara = Math.random() >= 0.5
}

const updateResultado = () => {
  resultado.textContent = esCara ? "¡CARA!" : "¡SECA!";
}

const cleanResultado = () => {
  resultado.textContent = resultado.textContent.replace(/[\!\¡]/g,"");
}




bg.addEventListener("click", ()=> {

  if(girando){
    return
  }
  girando = true;

  cleanResultado();
  flip();

  const tl = gsap.timeline();

  tl.to(moneda.rotation, { duration: 1, z: esCara === tiroAnterior ? moneda.rotation.z + (360 / 57.2958) : moneda.rotation.z + ((360 + 180) / 57.2958) , onComplete: ()=> {
    updateResultado();
    moneda.rotation.z =  esCara ? 0 : 180 / 57.2958;
    tiroAnterior = esCara;
  }});

  tl.to(resultado,{duration: 0.17,fontSize: "32px"});
  tl.to(resultado,{duration: 0.17,fontSize: "28px", onComplete: ()=>{
    girando = false;
  }});
});


function animate() {
  requestAnimationFrame(animate);

  //moneda.rotation.z += 0.01;
  //controls.update();

  renderer.render(scene,camera);
}

animate();