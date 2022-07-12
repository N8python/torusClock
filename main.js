import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.137.0-X5O2PK3x44y1WRry67Kr/mode=imports/optimized/three.js';
import { EffectComposer } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/SMAAPass.js';
import { GammaCorrectionShader } from 'https://unpkg.com/three@0.137.0/examples/jsm/shaders/GammaCorrectionShader.js';
import { EffectShader } from "./EffectShader.js";
import { OrbitControls } from 'https://unpkg.com/three@0.137.0/examples/jsm/controls/OrbitControls.js';
import { AssetManager } from './AssetManager.js';
import { ShadowMesh } from './ShadowMesh.js';
import { Stats } from "./stats.js";
async function main() {
    // Setup basic renderer, controls, and profiler
    const clientWidth = window.innerWidth * 0.99;
    const clientHeight = window.innerHeight * 0.98;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000);
    camera.position.set(50, 75, 50);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(clientWidth, clientHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.ShadowMap;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    // Setup scene
    // Skybox
    const environment = new THREE.CubeTextureLoader().load([
        "skybox/Box_Right.bmp",
        "skybox/Box_Left.bmp",
        "skybox/Box_Top.bmp",
        "skybox/Box_Bottom.bmp",
        "skybox/Box_Front.bmp",
        "skybox/Box_Back.bmp"
    ]);
    scene.background = environment;
    // Lighting
    const ambientLight = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 0.25);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.35);
    directionalLight.position.set(150, 200, 50);
    // Shadows
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.left = -75;
    directionalLight.shadow.camera.right = 75;
    directionalLight.shadow.camera.top = 75;
    directionalLight.shadow.camera.bottom = -75;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = -0.001;
    directionalLight.shadow.blurSamples = 8;
    directionalLight.shadow.radius = 4;
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.15);
    directionalLight2.color.setRGB(1.0, 1.0, 1.0);
    directionalLight2.position.set(-50, 200, -150);
    //scene.add(directionalLight2);
    // Objects
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100).applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2)), new THREE.MeshStandardMaterial({
        side: THREE.FrontSide,
        stencilWrite: true,
        stencilZPass: THREE.IncrementStencilOp,
        side: THREE.DoubleSide
    }));
    ground.castShadow = true;
    ground.receiveShadow = true;
    // scene.add(ground);
    /*const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: new THREE.Color(1.0, 0.0, 0.0) }));
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.y = 5.01;
    scene.add(box);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(6.25, 32, 32), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 1.0, roughness: 0.25 }));
    sphere.position.y = 7.5;
    sphere.position.x = 25;
    sphere.position.z = 25;
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);*/

    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(10, 0.25, 2000, 320, 1, 12), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 1.0, roughness: 0.3, color: new THREE.Color(0.4, 0.4, 0.4), normalMap: new THREE.TextureLoader().load("metalness.jpeg") }));
    torusKnot.position.y = 10;
    torusKnot.position.x = 0;
    torusKnot.position.z = 0;
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    torusKnot.rotation.x = Math.PI / 2;
    torusKnot.rotation.z = Math.PI * 2 / 24;
    scene.add(torusKnot);
    const glassTorus = new THREE.Mesh(new THREE.TorusGeometry(10, Math.PI * 3 / 2, 16, 100), new THREE.MeshPhysicalMaterial({ transmission: 1.0, ior: 1.1, roughness: 0.0, thickness: 1.0, side: THREE.DoubleSide, envMap: environment, depthWrite: true, attenuationColor: new THREE.Color(0.5, 0.5, 1.0), attenuationDistance: 1 }));
    glassTorus.position.y = 10;
    glassTorus.rotation.x = Math.PI / 2;
    scene.add(glassTorus);
    const tknotShadow = new ShadowMesh(torusKnot, new THREE.Color(0.4, 0.4, 0.4));
    scene.add(tknotShadow);
    const torusShadow = new ShadowMesh(glassTorus, new THREE.Color(0.5, 0.5, 1.0));
    scene.add(torusShadow);
    const torusSphereTraverse = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 1.0, 1.0) }));
    torusKnot.add(torusSphereTraverse);
    const traverseLight = new THREE.PointLight(0xffffff, 0.5, 50);
    traverseLight.castShadow = false;
    traverseLight.shadow.bias = -0.005;
    torusSphereTraverse.add(traverseLight);
    const clockDisk = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: new THREE.Color(1.0, 0.5, 0.25), map: new THREE.TextureLoader().load("clock.jpeg") }));
    clockDisk.material.map.flipY = false;
    const clockShadow = new ShadowMesh(clockDisk, new THREE.Color(0.4, 0.4, 0.4));
    scene.add(clockShadow);
    const hourHand = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.5).translate(1.25, 0, 0), new THREE.MeshStandardMaterial({
        polygonOffset: true,
        polygonOffsetFactor: -10,
        side: THREE.DoubleSide,
        color: new THREE.Color(0.75, 0.75, 0.75)
    }));
    const minuteHand = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.5).translate(2, 0, 0), new THREE.MeshStandardMaterial({
        polygonOffset: true,
        polygonOffsetFactor: -5,
        side: THREE.DoubleSide,
    }));
    clockDisk.position.y = 10;
    clockDisk.rotation.x = Math.PI / 2;
    clockDisk.castShadow = true;
    clockDisk.add(hourHand);
    clockDisk.add(minuteHand);
    scene.add(clockDisk);

    function calculatePositionOnCurve(u, p, q, radius, position) {

        const cu = Math.cos(u);
        const su = Math.sin(u);
        const quOverP = q / p * u;
        const cs = Math.cos(quOverP);

        position.x = radius * (2 + cs) * 0.5 * cu;
        position.y = radius * (2 + cs) * su * 0.5;
        position.z = radius * Math.sin(quOverP) * 0.5;
    }
    // Build postprocessing stack
    // Render Targets
    const defaultTexture = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter
    });
    defaultTexture.depthTexture = new THREE.DepthTexture(clientWidth, clientWidth, THREE.UnsignedInt248Type);
    defaultTexture.depthTexture.format = THREE.DepthStencilFormat;
    const torusFreeTexture = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter
    });
    torusFreeTexture.depthTexture = new THREE.DepthTexture(clientWidth, clientWidth, THREE.UnsignedInt248Type);
    torusFreeTexture.depthTexture.format = THREE.DepthStencilFormat;
    const bloomTexture = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter
    });
    bloomTexture.depthTexture = new THREE.DepthTexture(clientWidth, clientHeight, THREE.FloatType);
    // Post Effects
    const composer = new EffectComposer(renderer);
    const smaaPass = new SMAAPass(clientWidth, clientHeight);
    const effectPass = new ShaderPass(EffectShader);
    composer.addPass(effectPass);
    composer.addPass(smaaPass);
    let tick = 0;
    const bloomScene = new THREE.Scene();
    const bloomSphere = torusSphereTraverse.clone();
    bloomScene.add(bloomSphere);

    function animate() {

        renderer.setRenderTarget(defaultTexture);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.setRenderTarget(torusFreeTexture);
        renderer.clear();
        glassTorus.visible = false;
        renderer.render(scene, camera);
        glassTorus.visible = true;
        renderer.setRenderTarget(bloomTexture);
        renderer.clear();
        renderer.render(bloomScene, camera);
        effectPass.uniforms["sceneDiffuse"].value = defaultTexture.texture;
        effectPass.uniforms["sceneDepth"].value = torusFreeTexture.depthTexture;
        effectPass.uniforms["bloomDiffuse"].value = bloomTexture.texture;
        effectPass.uniforms["bloomDepth"].value = bloomTexture.depthTexture;
        effectPass.uniforms["resolution"].value = new THREE.Vector2(clientWidth, clientHeight);
        effectPass.uniforms["lightPos"].value = bloomSphere.position;
        effectPass.uniforms["projMat"].value = camera.projectionMatrix;
        effectPass.uniforms["viewMat"].value = camera.matrixWorldInverse;
        effectPass.uniforms["time"].value = performance.now() / 1000;
        composer.render();
        controls.update();
        stats.update();
        calculatePositionOnCurve(performance.now() / 5000, 1, 12, 10, torusSphereTraverse.position);
        hourHand.rotation.z = performance.now() / 5000;
        minuteHand.rotation.z = 12 * (performance.now() / 5000);
        torusSphereTraverse.getWorldPosition(bloomSphere.position);
        const lightPosition4D = new THREE.Vector4(directionalLight.position.x, directionalLight.position.y, directionalLight.position.z, 0.0);
        torusShadow.update(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), lightPosition4D);
        tknotShadow.update(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), lightPosition4D);
        clockShadow.update(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), lightPosition4D);
        requestAnimationFrame(animate);
        tick++;
    }
    requestAnimationFrame(animate);
}
main();