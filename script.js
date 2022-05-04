// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';
import { OrbitControls } from './sources/OrbitControls.js';

// 🌐 GLOBAL VARIABLES -------------------------- 

let scene, renderer, camera, controls, pointer, raycaster;
let Cubes = [];

// INTERACTION
pointer = new THREE.Vector2();
raycaster = new THREE.Raycaster();

let nearToPivotPoint = 4; //Info: The higher the closer //5 is very far away, 20 is very close

// RUN MAIN FUNCTIONS (AND LOAD JSON DATA (D3 Framework is in html!)-------------------------- 
Promise.all([
  d3.json("./sources/keywords.json"),
  d3.json("./sources/categories.json"),
]).then(function (data) {
  init(data);
  animate(renderer, scene, camera, controls);
});

// 🎛 RENDER SETTINGS -------------------------- 

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio / 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor('rgb(30,30,30)');
document.body.appendChild(renderer.domElement);

// 🌇 SCENE SETTING -------------------------- 

scene = new THREE.Scene();
scene.background = new THREE.Color(0x96AFB9);

// 🎥 CAM SETTING -------------------------- 

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set( 35, 35, 35 );

// CONTROLS SETTING -------------------------- 

controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0,0,0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.update();

// 🌞 LIGHT SETTINGS -------------------------- 

const skyColor = 0xffffff;
const groundColor = 0x000000;
const hemiIntensity = 5;
const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, hemiIntensity);
hemiLight.position.set(17, 50, 17);
scene.add(hemiLight);

const ambiColor = 0x40ff40;
const ambiIntensity = 10;
const ambiLight = new THREE.AmbientLight(ambiColor, ambiIntensity);
scene.add(ambiLight);

//DIR LIGHT 1
const light1 = new THREE.DirectionalLight(0xffffff, 100);
light1.position.set(17, 30, 50);
scene.add(light1);
//+HELPER
const helper1 = new THREE.DirectionalLightHelper( light1, 5 );
//scene.add( helper1 );

//DIR LIGHT 2
const light2 = new THREE.DirectionalLight(0xffffff, 100);
light2.position.set(50, 30, 17);
scene.add(light2);
//+HELPER
const helper2 = new THREE.DirectionalLightHelper( light2, 5 );
//scene.add( helper2 );

// 🎯 MAIN FUNCTION -------------------------- 

function init(data) {

	raycaster = new THREE.Raycaster();

  let category = [];
  for (var i = 0; i < data[1].category.length; i++) {
    category.push(data[1].category[i].name);
  }
  
  let keywords1 = [];
  let keywords2 = [];
  let keywords3 = [];
  let keywords4 = [];
  let keywords5 = [];
  let keywords6 = [];
  let keywords7 = [];
  let keywords8 = [];

  for (var i = 0; i < data[0].article.length; i++) {
    if (data[0].article[i].Digitalisierung == 'x') {
      keywords1.push(data[0].article[i].Stichwort);
    }
    if (data[0].article[i].Stadtentwicklung == 'x') {
      keywords2.push(data[0].article[i].Stichwort);
    }
    if (data[0].article[i].Zukunftsforschung == 'x') {
      keywords3.push(data[0].article[i].Stichwort);
    }
    if (data[0].article[i].CircularCity == 'x') {
      keywords4.push(data[0].article[i].Stichwort);
    }
    if (data[0].article[i].Klimawandel == 'x') {
      keywords5.push(data[0].article[i].Stichwort);
    }
    if (data[0].article[i].Innovation == 'x') {
      keywords6.push(data[0].article[i].Stichwort);
    }
    if (data[0].article[i].Nachhaltigkeit == 'x') {
      keywords7.push(data[0].article[i].Stichwort);
    }
    if (data[0].article[i].Nachhaltigkeitsinnovationen == 'x') {
      keywords8.push(data[0].article[i].Stichwort);
    }
  }

  let keywords1Length = keywords1.length;
  let keywords2Length = keywords2.length;
  let keywords3Length = keywords3.length;
  let keywords4Length = keywords4.length;
  let keywords5Length = keywords5.length;
  let keywords6Length = keywords6.length;
  let keywords7Length = keywords7.length;
  let keywords8Length = keywords8.length;

  let keyWordList = [keywords1, keywords2, keywords3, keywords4, keywords5, keywords6, keywords7, keywords8];
  let keyWordLengthList = [keywords1Length, keywords2Length, keywords3Length, keywords4Length, keywords5Length, keywords6Length, keywords7Length, keywords8Length]

  
  //tbd: Keywords2 usw. muss dann hier übergeben werden!
  generate_cloud(category, keyWordList, keyWordLengthList);

  //helper(); // Koordinatensystem  
}

// CLASS FOR CATEGORY CUBE

class categoryCube {

  constructor(_categoryText,  categoryCubeXPos, categoryCubeYPos, categoryCubeZPos) {

    // GEOMETRY 

    this.size = 5;
    this.geometry = new THREE.BoxBufferGeometry(this.size, this.size, this.size);

    // MATERIAL AND TEXTURE

    this.categoryString = _categoryText;
    this.dynamicTexture = new THREEx.DynamicTexture(600, 600)

    this.dynamicTexture.drawTextCooked({
      background: "white", 
      text: this.categoryString,
      lineHeight: 0.20,
      emissive: 100,
      //blending: THREE.AdditiveBlending,
      fillStyle: "black",
      font: "75px Helvetica",
      marginTop: 0
    })

    this.material =  new THREE.MeshPhongMaterial({
        color: "rgb(0,0,0)",
        emissiveIntensity: 8,
        emissive: "rgb(40,255,6)",
        emissiveMap: this.dynamicTexture.texture,
    }),

    // MESH, NAME OF THE MESH, AND IT'S POSITIONING
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "categoryCube";
    console.log("It's name must be categoryCube: " + this.mesh.name);
    this.mesh.position.set( categoryCubeXPos,categoryCubeYPos,categoryCubeZPos);
  }
}

// CLASS FOR SINGLE CUBE -------------------------- 

class Cube {

  constructor(_keywordString, randomCategoryCubeXPos, randomCategoryCubeYPos, randomCategoryCubeZPos) {

    //GEOMETRY
    let size = 2;

    //BOX WITH SHARP EDGES
    this.geometry = new THREE.BoxGeometry(size, size, size);

    //BOX WITH ROUND EDGES

    /*let shape = new THREE.Shape();
    
    let eps = 0.00001;
    let radius = 0.03;
    let radius0 = 0.03;
    let height = size;
    let width = size;
    let depth = size;
    let smoothness = 3;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    this.geometry = new THREE.ExtrudeBufferGeometry(shape, {
      amount: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness
    });*/

    //MATERIAL AND TEXTURE

    this.keywordString = _keywordString;
    this.dynamicTexture = new THREEx.DynamicTexture(1000, 1000);

    this.dynamicTexture.drawTextCooked({
      background: "white", 
      text: this.keywordString,
      lineHeight: 0.20,
      emissive: 100,
      //blending: THREE.AdditiveBlending,
      fillStyle: "black",
      font: "150px Helvetica",
      marginTop: 0
    })

    this.material = new THREE.MeshPhongMaterial({
      color: "rgb(0,0,0)",
      emissiveIntensity: 8,
      emissive: "rgb(40,255,6)",
      emissiveMap: this.dynamicTexture.texture,
    })

    /*this.material = new THREE.MeshPhysicalMaterial({
      color: CubeColor, 
      roughness: 0.2,  
      transmission: 1,  
      thickness: 0.2,
      emissiveIntensity: 7,
      emissive: new THREE.Color(EmissiveColor),
    })*/
    /*
    this.material = [
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
        emissiveMap: this.dynamicTexture.texture,
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
        emissiveMap: this.dynamicTexture.texture,
      }),
      new THREE.MeshStandardMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      })
    ]; */

    // MESH, MESH NAME AND IT'S POSITIONING

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    this.mesh.name = "smallCube";
    console.log("It's name must be smallCube: " + this.mesh.name);

    this.mesh.position.x = randomCategoryCubeXPos;
    this.mesh.position.y = randomCategoryCubeYPos;
    this.mesh.position.z = randomCategoryCubeZPos;
  }
}

// FUNCTION TO GENERATE CATEGORIE CLOUD (e.g. Digitalisierung) -------------------------- 

class generate_categoryCloud {

  constructor(specialKeywordList, specialKeywordLengthList, categoryCubeXPos, categoryCubeYPos, categoryCubeZPos) {

    this.keywordlength = specialKeywordLengthList;

    for (var i = 0; i < specialKeywordLengthList; i++) {

      let keywordText = specialKeywordList[i];

      let randomCategoryCubeXPos = categoryCubeXPos + Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)/nearToPivotPoint;
      let randomCategoryCubeYPos = categoryCubeYPos + Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)/nearToPivotPoint;
      let randomCategoryCubeZPos = categoryCubeZPos + Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)/nearToPivotPoint;
      
      const cube = new Cube(keywordText, randomCategoryCubeXPos, randomCategoryCubeYPos, randomCategoryCubeZPos);
      
      Cubes.push(cube); //Array von cubes -> adds a cube into the array "Cubes"
      scene.add(cube.mesh);
    } 
  }
  
}

// 🎯 FUNCTION TO GENERATE BIG THEMENCLOUD INCLUDING ALL 8 CATEGORIES -------------------------- 

function generate_cloud(category, keyWordList, keyWordLengthList) {
  
  let categoryCubeXcoords = [3,10,12,-5,12,-6,7,-30];
  let categoryCubeYcoords = [3,2,20,7,-3,6,-17,2];
  let categoryCubeZcoords = [3,-10,22,23,-3,12,-6,7];

  //generate 8 Category Cubes for the 8 Categories
  for (let i = 0; i < 8; i++) {
      
      let categoryText = category[i];
      let categoryCubeXPos = categoryCubeXcoords[i];
      let categoryCubeYPos = categoryCubeYcoords[i];
      let categoryCubeZPos = categoryCubeZcoords[i];

      let specialKeywordList = keyWordList[i];
      let specialKeywordLengthList = keyWordLengthList[i];

      const categoryCubes = new categoryCube(categoryText, categoryCubeXPos, categoryCubeYPos, categoryCubeZPos);
      scene.add(categoryCubes.mesh);

      const categoryClouds = new generate_categoryCloud(specialKeywordList, specialKeywordLengthList, categoryCubeXPos, categoryCubeYPos, categoryCubeZPos);
  }
}



// HOVER AND FOCUS CUBE ANIMATION

function resetMaterials(){

  for (let i = 0; i < scene.children.length; i++) {
    document.body.style.cursor = "url(sources/PointerCube.png), auto";
      if (scene.children[i].material) {
        scene.children[i].material.color.set( 0x002200 );
      }
    };
  }  

function hoverCubes(nearToPivotPoint){

  raycaster.setFromCamera(pointer, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  
  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.color.set( 0x000000 );
    document.body.style.cursor = "url(sources/PointerArrow.png), auto";
  }
}

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

window.addEventListener( 'pointermove', onPointerMove, false);


// ANIMATE FUNCTION -------------------------- 

function animate() {

  controls.update();
  resetMaterials();
  hoverCubes();
  renderer.render(scene, camera);
 
  // BUTTONS 
  document.getElementById("start").onclick = function () {
    document.getElementById("explore").style.display = "none";
  };

  window.requestAnimationFrame(animate);

}


// 🔶 ORIENTATION CUBES FOR AXES -------------------------- 

function helper() {

  var dir = new THREE.Vector3(0, 1, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0x00ff00;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(1, 0, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0x0000ff;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(0, 0, 1);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0xff0000;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);
}