// 📀 LOAD THREE JS --------------------------

import * as THREE from './sources/three.module.js';
import { OrbitControls } from './sources/OrbitControls.js';

// 🌐 GLOBAL VARIABLES --------------------------

let scene, renderer, camera, controls, pointer, raycaster;
const CATEGORY_COUNT = 8;

var language = "german"

// SCRIPTSOURCES

let scriptKeywords = './typo3conf/ext/skeleton/Resources/Public/Themencloud/sources/keywords.json';
let scriptCategories = './typo3conf/ext/skeleton/Resources/Public/Themencloud/sources/categories.json';

// INTERACTION!
pointer = new THREE.Vector2();

var nearToPivotPoint = 1; //Info: The higher the closer //5 is very far away, 20 is very close

// RUN MAIN FUNCTIONS (AND LOAD JSON DATA (D3 Framework is in html!)--------------------------
document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    d3.json(scriptKeywords),
    d3.json(scriptCategories),
  ]).then(function (data) {
    init(data);
    animate(renderer, scene, camera, controls);
  });
}, false);

// 🎛 RENDER SETTINGS --------------------------

renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(window.devicePixelRatio / 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor('rgb(30,30,30)');

document.getElementsByName("cloudcanvas")[0].appendChild(renderer.domElement);
//document.body.appendChild(renderer.domElement);

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
controls.minDistance = 20;
controls.maxDistance = 150;
controls.zoomSpeed = 0.4;
controls.update();



// 🎯 MAIN FUNCTION --------------------------

function init(data) {

  raycaster = new THREE.Raycaster();

  // 🌞 LIGHT SETTINGS --------------------------
  const ambiColor = 0x40ff40;
  const ambiIntensity = 5;
  const ambiLight = new THREE.AmbientLight(ambiColor, ambiIntensity);
  scene.add(ambiLight);

  //DIR LIGHT 1
  const light1 = new THREE.DirectionalLight(0xffffff, 2.5);
  light1.position.set(17, 30, -50);
  scene.add(light1);
  //DIR LIGHT 1 HELPER
  const helper1 = new THREE.DirectionalLightHelper( light1, 5 );
  //scene.add( helper1 );

  //DIR LIGHT 2
  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(-50, 30, 17);
  scene.add(light2);
  //DIR LIGHT 2 HELPER
  const helper2 = new THREE.DirectionalLightHelper( light2, 5 );
  //scene.add( helper2 );
  
  //Get Categories

  let categories = [];
  for (var i = 0; i < data[1].categories.length; i++) {
    if (language == "german") {
      categories.push(data[1].categories[i].wordDE);
    } 
    else {
      categories.push(data[1].categories[i].wordEN);
    }    
  }

  //Get Keywords

  const articles = data[0].articles;

  let keywords = {};

  for (const article of articles) {
    for (const key_value_pair of Object.entries(article)) {
      
      const key = key_value_pair[0];
      const value = key_value_pair[1];

      if (value == "x") {
        if (key in keywords) {
          if (language == "german") {
            keywords[key].push(article["Stichwort"]);
          }
          else {
            keywords[key].push(article["Übersetzung"]);
          }
        }

        else {
          if (language == "german") {
            keywords[key] = [article["Stichwort"]];
          }
          else {
            keywords[key] = [article["Übersetzung"]];
          }
        }
      }
    }
  }

  // TODO check if order of keys and values are guarantueed to be the same 
  const keyWordList = Object.values(keywords);
  const keyWordLengthList = []
  
  for (const array of Object.values(keywords)) {
    keyWordLengthList.push(array.length);
  }

  generate_cloud(categories, keyWordList, keyWordLengthList);

  window.addEventListener( 'resize', onWindowResize );
}

// CLASS FOR CATEGORY CUBE

class categoryCube {

  constructor(_categoryText,  categoryCubeXPos, categoryCubeYPos, categoryCubeZPos) {

    //GEOMETRY
    let size = 5;
    this.geometry = new THREE.BoxBufferGeometry(size, size, size);

    // MATERIAL AND TEXTURE

    this.categoryString = _categoryText;
    let dynamicTexture = new THREEx.DynamicTexture(900, 300, THREE)

    dynamicTexture.drawTextCooked({
      margin: 0.08,
      background: "#D7FE1A",  //Here is the Color of the
      text: this.categoryString,
      lineHeight: 0.28,
      fillStyle: "black",
      font: "80px FKGroteskRegular",
      marginTop: 0.15,
      flatShading: true
    })

    //Remove Texture Canvas to save GPU memory
    dynamicTexture.texture.onUpdate = () => dynamicTexture.canvas.remove();

    //UV Mapping
    dynamicTexture.texture.magFilter = THREE.LinearFilter;
    dynamicTexture.texture.minFilter = THREE.LinearMipMapLinearFilter;
    dynamicTexture.texture.offset.y = -1.9;
    dynamicTexture.texture.repeat.y = 3;

    this.material = new THREE.MeshPhongMaterial({
      map: dynamicTexture.texture,
    }),

    // MESH, NAME OF THE MESH, AND IT'S POSITIONING
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "categoryCube";
    this.mesh.position.set( categoryCubeXPos,categoryCubeYPos,categoryCubeZPos);
  }
}

// CLASS FOR SINGLE CUBE --------------------------

class Cube {

  constructor(_keywordString, randomCategoryCubeXPos, randomCategoryCubeYPos, randomCategoryCubeZPos, categoryNumber) {

    //GEOMETRY
    let size = 2;
    this.geometry = new THREE.BoxBufferGeometry(size, size, size);

    //MATERIAL AND TEXTURE

    this.keywordString = _keywordString;
    let dynamicTexture = new THREEx.DynamicTexture(600, 200, THREE);

    dynamicTexture.drawTextCooked({
      margin: 0.1,
      background: "#D7FE1A",
      text: this.keywordString,
      lineHeight: 0.25,
      fillStyle: "black",
      font: "50px FKGroteskRegular",
      marginTop: 0.15,
      flatShading: true
    })

    dynamicTexture.texture.onUpdate = () => dynamicTexture.canvas.remove();
    setTimeout(() => dynamicTexture.canvas.remove(), 2000)

    dynamicTexture.texture.offset.y = -1.9;
    dynamicTexture.texture.repeat.y = 3;

    this.material = new THREE.MeshPhongMaterial({
      map: dynamicTexture.texture,
    })

    // MESH, MESH NAME AND IT'S POSITIONING

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    scene.add(this.mesh);
    this.mesh.name = "smallCube" + categoryNumber;

    this.mesh.position.x = randomCategoryCubeXPos;
    this.mesh.position.y = randomCategoryCubeYPos;
    this.mesh.position.z = randomCategoryCubeZPos;
  }
}

// FUNCTION TO GENERATE CATEGORIE CLOUD (e.g. Digitalisierung) --------------------------

class generate_categoryCloud {

  constructor(specialKeywordList, specialKeywordLengthList, categoryCubeXPos, categoryCubeYPos, categoryCubeZPos, categoryNumber) {

    this.keywordlength = specialKeywordLengthList;

    for (var i = 0; i < specialKeywordLengthList; i++) {

      let keywordText = specialKeywordList[i];

      let randomCategoryCubeXPos = categoryCubeXPos + Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)/nearToPivotPoint;
      let randomCategoryCubeYPos = categoryCubeYPos + Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)/nearToPivotPoint;
      let randomCategoryCubeZPos = categoryCubeZPos + Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)/nearToPivotPoint;

      const cube = new Cube(keywordText, randomCategoryCubeXPos, randomCategoryCubeYPos, randomCategoryCubeZPos, categoryNumber);
      scene.add(cube.mesh);
    }
  }

}

// 🎯 FUNCTION TO GENERATE BIG THEMENCLOUD INCLUDING ALL 8 CATEGORIES --------------------------

function generate_cloud(category, keyWordList, keyWordLengthList) {

  let categoryCubeXcoords = [3,10,12,-5,12,-6,7,-25];
  let categoryCubeYcoords = [3,2,20,7,-3,6,-17,2];
  let categoryCubeZcoords = [3,-10,22,23,-3,12,-6,7];

  //generate 8 Category Cubes for the 8 Categories
  for (let i = 0; i < CATEGORY_COUNT; i++) {

    let categoryText = category[i];
    let categoryCubeXPos = categoryCubeXcoords[i];
    let categoryCubeYPos = categoryCubeYcoords[i];
    let categoryCubeZPos = categoryCubeZcoords[i];

    let specialKeywordList = keyWordList[i];
    let specialKeywordLengthList = keyWordLengthList[i];

    const categoryCubes = new categoryCube(categoryText, categoryCubeXPos, categoryCubeYPos, categoryCubeZPos);
    scene.add(categoryCubes.mesh);

    let categoryNumber = [i];
    const categoryClouds = new generate_categoryCloud(specialKeywordList, specialKeywordLengthList, categoryCubeXPos, categoryCubeYPos, categoryCubeZPos, categoryNumber);
  }
}

function onClick( event ) {

  event.preventDefault();

  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  var intersectss = raycaster.intersectObjects(scene.children);

  nearToPivotPoint = nearToPivotPoint*2;

  for (let i = 0; i < intersectss.length; i++) {
    //intersectss[i].object.position.x = 10;
    intersectss[i].object.material.emissiveIntensity = 40;
  }
  return nearToPivotPoint;
}


// ANIMATE FUNCTION --------------------------

/*const v0 = new THREE.Vector3(3,3,3);
const v1 = new THREE.Vector3(10,2,-10);
const v2 = new THREE.Vector3(12,20,22);
const v3 = new THREE.Vector3(-5,7,23);
const v4 = new THREE.Vector3(12,-3,-3);
const v5 = new THREE.Vector3(-6,6,12);
const v6 = new THREE.Vector3(7,-17,-6);
const v7 = new THREE.Vector3(-25,2,7);*/

function animate() {

  let test = scene.children.length;
  

  var MIN_DISTANCE = 6;
  const speed = 0.005;

  controls.update();
  renderer.render(scene, camera);

  // BUTTONS
  document.getElementById("start").onclick = function () {
    document.getElementById("explore").style.display = "none";
    document.getElementById("exit").style.display = "flex";
    document.getElementById("themencloud").classList.add('full-screen');
  };

  document.getElementById("stop").onclick = function () {
    document.getElementById("explore").style.display = "flex";
    document.getElementById("exit").style.display = "none";
    document.getElementById("themencloud").classList.remove('full-screen');
  };

  // Language Button
  document.getElementById("language").changeLanguage = function () {
    if (language == "german") {
      document.getElementById("language").textContent = "Deutsch";
      language = "english";
      while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
      }
      Promise.all([
        d3.json(scriptKeywords),
        d3.json(scriptCategories),
      ]).then(function (data) {
        init(data);
      });
    } else {
      document.getElementById("language").textContent = "English";
      language = "german";
      while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
      }
      Promise.all([
        d3.json(scriptKeywords),
        d3.json(scriptCategories),
      ]).then(function (data) {
        init(data);
      });
    }
  };

  window.requestAnimationFrame(animate);

}

// ON WINDOW RESIZE FUNCTION --------------------------

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
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
