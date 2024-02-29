import "./style.css";
import * as THREE from "three";
import { gsap } from "gsap";


//Setea la escena, tamaños y aspecto
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const bg = document.querySelector("#bg");
const renderer = new THREE.WebGLRenderer({
  canvas: bg,
  alpha: true,
});

renderer.setPixelRatio(window.devicePixelRatio * 3);
renderer.setSize(300, 300);
camera.position.setZ(40);
camera.aspect = 1 / 1;
camera.updateProjectionMatrix();


//Carga las texturas de la moneda y crea la geometría

const caraTexture = new THREE.TextureLoader().load("./pesofrente.jpg");
const cantoTexture = new THREE.TextureLoader().load("./pesocanto.jpg");
const secaTexture = new THREE.TextureLoader().load("./pesodorso.jpg");

const caraBump = new THREE.TextureLoader().load("./pesofrentebump.jpg");
const secaBump = new THREE.TextureLoader().load("./pesodorsobump.jpg");
const cantoBump = new THREE.TextureLoader().load("./pesocantobump.jpg");

const geometry = new THREE.CylinderGeometry(15, 15, 3);
const cara = new THREE.MeshStandardMaterial({
  map: caraTexture,
  bumpMap: caraBump,
  bumpScale: 1.6,
});
const canto = new THREE.MeshStandardMaterial({
  map: cantoTexture,
  bumpMap: secaBump,
  bumpScale: 1.6,
});
const seca = new THREE.MeshStandardMaterial({
  map: secaTexture,
  bumpMap: cantoBump,
  bumpScale: 1.6,
});
const materials = [canto, cara, seca];

const moneda = new THREE.Mesh(geometry, materials);

//Rota "el cilindro" para ver la moneda de frente
moneda.rotation.x = 90 / 57.2958; //todos los ángulos están en radianes

scene.add(moneda);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(12, 12, 12);

const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(pointLight, ambientLight);


//Crea la lógica del resultado
const resultado = document.getElementById("resultado");
let esCara = true;
let tiroAnterior = true;
let girando = false;

const flip = () => {
  esCara = Math.random() >= 0.5;
};

const updateResultado = () => {
  resultado.textContent = esCara ? "¡CARA!" : "¡SECA!";
};

const cleanResultado = () => {
  resultado.textContent = resultado.textContent.replace(/[\!\¡]/g, "");
};


//Crea las funciones para reproducir el audio
const audio = document.getElementById("audio");
const botonMute = document.getElementById("mute");
const botonUnmute = document.getElementById("unmute");

const stopSound = () => {
  audio.pause();
  audio.currentTime = 0;
};

const playSoundAtSecond = (startSecond) => {
  if (!audio.paused) {
    stopSound();
  }
  audio.currentTime = startSecond;
  audio.play();
};

//Detiene el sonido después de 0.7 segundos para que no suene la caida de la moneda
//(los dos sonidos están en el mismo audio)
const stopSoundAfterAWhile = () => {
  if (audio.currentTime > 0.7) {
    stopSound();
  }
};

//Agrega los listeners para detener el audio
const addStopListener = () => {
  audio.addEventListener("timeupdate", stopSoundAfterAWhile);
};

//Remueve el listener si hay que detener el audio para reproducir otro sonido 
const removeStopListener = () => {
  audio.removeEventListener("timeupdate", stopSoundAfterAWhile);
};

const coinTossSound = () => {
  playSoundAtSecond(0);
  addStopListener();
};

const coinFallSound = () => {
  removeStopListener();
  playSoundAtSecond(1.06);
};


//Maneja mutear y desmutear el sonido
const toggleMute = () => {
  audio.muted = !audio.muted;
  if (audio.muted) {
    botonUnmute.style.display = "none";
    botonMute.style.display = "inline-flex";
  } else {
    botonUnmute.style.display = "inline-flex";
    botonMute.style.display = "none";
  }
};

botonMute.addEventListener("click", toggleMute);
botonUnmute.addEventListener("click", toggleMute);



const tirarLaMoneda = () => {
  if (girando) {
    return;
  }
  girando = true;

  cleanResultado();
  flip();

  coinTossSound();

  //anima la moneda
  const tl = gsap.timeline();

  tl.to(moneda.rotation, {
    duration: 0.9,
    z:
      esCara === tiroAnterior
        ? moneda.rotation.z + 360 / 57.2958
        : moneda.rotation.z + (360 + 180) / 57.2958,
    onComplete: () => {
      coinFallSound();
      updateResultado();
      moneda.rotation.z = esCara ? 0 : 180 / 57.2958;
      tiroAnterior = esCara;
    },
  });

  //Anima el texto del resultado
  tl.to(resultado, { duration: 0.17, fontSize: "32px" });
  tl.to(resultado, {
    duration: 0.17,
    fontSize: "28px",
    onComplete: () => {
      girando = false;
    },
  });

};

//Agrega el listener con la función para tirar la moneda
bg.addEventListener("click", tirarLaMoneda);


function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
