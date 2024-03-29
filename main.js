import './style.css'
import { setupCounter } from './counter.js'

import * as THREE from 'three'

import { GUI } from "dat.gui"

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass"

document.querySelector('#app').innerHTML = /*html*/`
  <div>
    <div>
    <h1 id="titre">TES NOUVEAUX MUNCHIES PRÉFÉRÉS!</h1>
    </div>
    <div class="card">
      <button id="counter" type="button"></button>
      <label for="fileInput" class="custom-file-upload">
        Upload File
      </label>
      <input  type="file" id="fileInput" accept=".glb, .gltf">
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))



var currentModelPath = '/soucoupe V5.glb'
var newModelPath = '/soucoupe V5.glb'

const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files
  console.log(file);
  newModelPath = URL.createObjectURL(file[0])
});

const title = document.querySelector('#titre')
title.style.zIndex = '5'
title.style.color = 'yellow'
//border of the text
title.style.textShadow = '2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000'
//box the text to go back to the line when it's too long
title.style.width = '50%'


// add a canvas element
const canvas = document.createElement('canvas')
canvas.style.position = 'absolute'
canvas.style.zIndex = '100000'
canvas.style.pointerEvents = 'none' // allow click events to pass through
canvas.style.cursor = 'none' // hide the cursor

document.body.appendChild(canvas)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2
camera.fov = 50
camera.aspect = 16 / 11
camera.updateProjectionMatrix()

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true })
renderer.setSize(80, 80)
// renderer.setSize(200, 200)

// import a 3D model
const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/js/libs/draco/');
loader.setDRACOLoader(dracoLoader);
var model = new THREE.Object3D();
if (currentModelPath) {
  loader.load(currentModelPath, (gltf) => {
    scene.remove(model)
    model = gltf.scene
    scene.add(model)
    model.scale.set(.1, .1, .1)
    model.position.set(0, 0, 0)
    model.rotation.set(0, 0, 0)
    // log model camera aspect ratio and fov
    console.log(model)
    // give a color to each sphere
    model.traverse((child) => {
      if (child.isMesh) {
        console.log('child', child)
        if (child.name === 'Sphere017_2') { // top balls
          const top = child.material
          top.emissive = new THREE.Color(0xffffff)
          top.emissiveIntensity = 0.5
        }
      }
    })
  })
}

// add a light
const light = new THREE.AmbientLight(0xffffff, 0.5)
light.position.set(0, 0, 1)
scene.add(light)

// add a light2
const light2 = new THREE.SpotLight(0xffffff, 25, 10, Math.PI, 1, 1)
light2.position.set(0, 1, 5)
scene.add(light2)
const lightHelper2 = new THREE.SpotLightHelper(light2)

// gui inside html
const gui = new GUI()
gui.domElement.id = 'gui'

//gui model
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10).name('Zoom').step(0.01)
cameraFolder.add(camera.position, 'y', -10, 10).name('Height').step(0.01)
cameraFolder.add(camera.position, 'x', -10, 10).name('Horizontal').step(0.01)
// fov
cameraFolder.add(camera, 'fov', 0, 180).name('Field of View').step(0.01).onFinishChange(() => {
  camera.updateProjectionMatrix()
})
cameraFolder.open()

let mousePos = { x: 0, y: 0 }

let lastMousePos = { x: 0, y: 0 }
// get time
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  // update the mouse position if one second has passed
  if (clock.getElapsedTime() > 0.1) {
    clock.start()
    lastMousePos = { x: mousePos.x, y: mousePos.y }
  }

  if (newModelPath !== currentModelPath) {
    currentModelPath = newModelPath
    loader.load(currentModelPath, (gltf) => {
      scene.remove(model)
      model = gltf.scene
      scene.add(model)
      model.scale.set(.1, .1, .1)
      model.position.set(0, 0, 0)
      model.rotation.set(0, 0, 0)
    })
  }

  if (lastMousePos.x !== mousePos.x || lastMousePos.y !== mousePos.y) {
    // get mouse direction
    const direction = new THREE.Vector2(
      mousePos.x - lastMousePos.x,
      mousePos.y - lastMousePos.y
    )
    // make velocity effect using z axis as acceleration and x and y as direction
    if (direction.x > 0 && model.rotation.z > -0.1) {
      model.rotation.z -= Math.sin(direction.x * 0.001)
    }
    if (direction.x < 0 && model.rotation.z < 0.1) {
      model.rotation.z += -Math.sin(direction.x * 0.001)
    }
    if (model.rotation.z > -0.0001 && model.rotation.z < 0.0001) {
      model.rotation.z = 0
    } else if (model.rotation.z > 0.1) {
      model.rotation.z -= 0.01
    } else if (model.rotation.z < -0.1) {
      model.rotation.z += 0.01
    }
  }
  if (model.rotation.z > -0.0001 && model.rotation.z < 0.0001) {
    model.rotation.z = 0
  } else if (model.rotation.z > 0) {
    model.rotation.z -= 0.01
  } else if (model.rotation.z < 0) {
    model.rotation.z += 0.01
  }

  // model.rotation.y += 0.01
  model.traverse((child) => {
    if (child.isMesh) {
      // child.material.emissive = new THREE.Color(0x00ff00)
      child.rotateY(0.01)
    }
  })

  model.rotation.x = (mousePos.y - (window.innerHeight / 2) + 500) * 0.00025

  // move light2 x from mouse position from -3 to 3
  light2.position.x = -(mousePos.x - (window.innerWidth / 2)) * 0.01
  light2.position.y = (mousePos.y - (window.innerHeight / 2)) * 0.01

  renderer.render(scene, camera)
}

animate()

// make the canvas follow the mouse
document.addEventListener('mousemove', (event) => {
  let x = event.clientX - 35;
  let y = event.clientY - 35;

  // Prevent the canvas from going beyond the viewport
  x = Math.min(x, window.innerWidth - (canvas.offsetWidth));
  y = Math.min(y, window.innerHeight - canvas.offsetHeight);

  canvas.style.left = `${x}px`;
  canvas.style.top = `${y}px`;

  mousePos = { x: event.clientX, y: event.clientY };
});


// Add this CSS to your styles to prevent cursor change on all elements
const style = document.createElement('style');
style.innerHTML = `
  * {
    cursor: none !important;
  }
`;
document.head.appendChild(style);

// background color must be a gradient
document.body.style.background = 'linear-gradient(0deg, #ef495a, #ddff77)'
