import './style.css'
import { setupCounter } from './counter.js'

import * as THREE from 'three'

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

var currentModelPath = '/soucoupe_V2.glb'
var newModelPath = '/soucoupe_V2.glb'

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

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true })
renderer.setSize(100, 100)

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
  })
}

// add bloom effect
const renderScene = new RenderPass(scene, camera)

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight)
)
bloomPass.threshold = 1.0
bloomPass.strength = 1.5
bloomPass.radius = 0.1

const bloomComposer = new EffectComposer(renderer)
bloomComposer.addPass(renderScene)
bloomComposer.addPass(bloomPass)

const outputPass = new OutputPass()
bloomComposer.addPass(outputPass)

// add a light
const light = new THREE.DirectionalLight(0xffffff, 3)
light.position.set(0, 0, 1)
scene.add(light)

camera.position.z = 2

let mousePos = { x: 0, y: 0 }
function animate() {
  requestAnimationFrame(animate)

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

  model.rotation.y += 0.01

  model.rotation.x = (mousePos.y - (window.innerHeight / 2) + 800) * 0.0005
  model.rotation.z = (mousePos.x + (window.innerWidth / 2)) * 0.0002

  bloomComposer.render()

  renderer.render(scene, camera)
}

animate()

// make the canvas follow the mouse
document.addEventListener('mousemove', (event) => {
  canvas.style.left = `${event.clientX - 35}px`
  canvas.style.top = `${event.clientY - 35}px`
  mousePos = { x: event.clientX, y: event.clientY }
})


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
