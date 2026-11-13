// Scena 3D dla Stańczyka: renderuje bryłę lub model do osobnego płótna, które silnik efektów
// próbkuje w każdej klatce jak klatkę wideo. Budowane do ../three3d.js (npm run build:3d).
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Box3, Vector3, Sphere,
  AmbientLight, DirectionalLight, MeshStandardMaterial, SphereGeometry, BoxGeometry,
  TorusGeometry, TorusKnotGeometry, CylinderGeometry, ExtrudeGeometry, Shape, Path,
  AnimationMixer, PMREMGenerator, SRGBColorSpace, MathUtils
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import FONT from './font.json';

let font = null;
const getFont = () => font || (font = new FontLoader().parse(FONT));

// Ton z głębi: jednostki bliżej kamery są jaśniejsze. Dopisujemy to do shadera każdego materiału.
const DU = { uNear: { value: 2 }, uFar: { value: 4 }, uMix: { value: 0 } };
function patch(m){
  if (!m || m.userData.s3d || !/Standard|Physical|Phong|Lambert|Toon/.test(m.type)) return m;
  m.userData.s3d = true;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, DU);
    sh.fragmentShader = 'uniform float uNear, uFar, uMix;\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
      '#include <dithering_fragment>\n  float s3dz = 1.0 - clamp((vViewPosition.z - uNear) / max(0.0001, uFar - uNear), 0.0, 1.0);\n  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(s3dz), uMix);');
  };
  m.customProgramCacheKey = () => 's3d-' + m.type;
  m.needsUpdate = true;
  return m;
}

function ringGeometry(){
  const s = new Shape(); s.absarc(0, 0, 1, 0, Math.PI * 2, false);
  const h = new Path(); h.absarc(0, 0, 0.62, 0, Math.PI * 2, true); s.holes.push(h);
  const g = new ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6, curveSegments: 128 });
  g.center(); return g;
}
function textGeometry(t){
  const g = new TextGeometry(t || ' ', { font: getFont(), size: 1, depth: 0.32, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.025, bevelSegments: 4 });
  g.center(); return g;
}
const SHAPES = {
  sphere: () => new SphereGeometry(1, 128, 96),
  box: () => new BoxGeometry(1.3, 1.3, 1.3, 1, 1, 1),
  torus: () => new TorusGeometry(0.8, 0.32, 96, 192),
  knot: () => new TorusKnotGeometry(0.62, 0.2, 320, 40),
  cylinder: () => new CylinderGeometry(0.75, 0.75, 1.5, 128, 1),
  ring: ringGeometry,
};

// Normalizacja: środek w (0,0,0), promień kuli otaczającej = 1
function normalize(obj){
  obj.updateMatrixWorld(true);
  const box = new Box3().setFromObject(obj, true);
  if (box.isEmpty()) return;
  const sph = box.getBoundingSphere(new Sphere()), k = 1 / (sph.radius || 1);
  obj.scale.multiplyScalar(k);
  obj.position.sub(sph.center.multiplyScalar(k));
}

export function parseModel(buf, ext){
  ext = String(ext || '').toLowerCase();
  return new Promise((res, rej) => {
    try {
      if (ext === 'glb' || ext === 'gltf') {
        const data = ext === 'gltf' && typeof buf !== 'string' ? new TextDecoder().decode(buf) : buf;
        new GLTFLoader().parse(data, '', g => res({ object: g.scene, clips: g.animations || [] }), e => rej(e || new Error('gltf')));
      } else if (ext === 'obj') {
        res({ object: new OBJLoader().parse(typeof buf === 'string' ? buf : new TextDecoder().decode(buf)), clips: [] });
      } else if (ext === 'stl') {
        const g = new STLLoader().parse(buf);
        if (!g.attributes.normal) g.computeVertexNormals();
        res({ object: new Mesh(g, new MeshStandardMaterial()), clips: [] });
      } else rej(new Error('format'));
    } catch (e) { rej(e); }
  });
}

export function create(){
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1080;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene(), camera = new PerspectiveCamera(35, 1, 0.01, 100);
  const pmrem = new PMREMGenerator(renderer), env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const amb = new AmbientLight(0xffffff, 0.2), key = new DirectionalLight(0xffffff, 2);
  scene.add(amb, key, key.target);
  const pivot = new Group(), spin = new Group(), holder = new Group();
  scene.add(pivot); pivot.add(spin); spin.add(holder);
  const mat = patch(new MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 }));
  let model = null, mixer = null, clips = [], shown = null, cur = '', spinA = 0, tw = 0, th = 0;
  const origMats = new Map();

  function clear(){ while (holder.children.length) { const c = holder.children[0]; holder.remove(c); if (c !== (model && model.object) && c.geometry) c.geometry.dispose(); } shown = null; }
  function build(P){
    clear();
    if (P.m3shape === 'model' && model) { holder.add(model.object); shown = model.object; return; }
    const kind = P.m3shape === 'text' ? 'text' : SHAPES[P.m3shape] ? P.m3shape : 'sphere';
    let g = kind === 'text' ? textGeometry(P.m3text) : SHAPES[kind]();
    if (kind === 'box') { g = mergeVertices(g); }
    const m = new Mesh(g, mat); normalize(m); holder.add(m); shown = m;
  }
  function applyMaterials(P){
    const look = P.m3mat === 'gloss' ? [0.22, 0] : P.m3mat === 'metal' ? [0.28, 1] : [0.85, 0];
    mat.roughness = look[0]; mat.metalness = look[1]; mat.envMap = P.m3mat === 'metal' ? env : null; mat.envMapIntensity = 1; mat.needsUpdate = mat.userData.lastMat !== P.m3mat; mat.userData.lastMat = P.m3mat;
    if (!model) return;
    const useOrig = !!P.m3orig;
    model.object.traverse(o => {
      if (!o.isMesh) return;
      if (!origMats.has(o)) origMats.set(o, o.material);
      const om = origMats.get(o);
      if (useOrig) { o.material = Array.isArray(om) ? om.map(patch) : patch(om); }
      else o.material = mat;
    });
  }
  return {
    canvas,
    hasClips: () => clips.length > 0,
    hasModel: () => !!model,
    async setModel(buf, ext){
      const r = await parseModel(buf, ext);
      if (model) { clear(); origMats.clear(); }
      const wrap = new Group(); wrap.add(r.object); normalize(wrap);
      model = { object: wrap }; clips = r.clips; origMats.clear();
      mixer = clips.length ? new AnimationMixer(r.object) : null;
      if (mixer) mixer.clipAction(clips[0]).play();
      cur = '';
    },
    clearModel(){ if (model) { clear(); model = null; mixer = null; clips = []; origMats.clear(); cur = ''; } },
    setSize(w, h){ if (w === tw && h === th) return; tw = w; th = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
    reset(){ spinA = 0; },
    update(dt, P){
      const sig = [P.m3shape, P.m3shape === 'text' ? P.m3text : '', model ? 1 : 0].join('|');
      if (sig !== cur) { cur = sig; build(P); applyMaterials(P); }
      applyMaterials(P);
      // obrót: ręczny (przeciąganie) + autoobrót wokół wybranej osi
      spinA += dt * (P.m3spin || 0) * Math.PI / 180;
      pivot.rotation.set(MathUtils.degToRad(P.m3rx || 0), MathUtils.degToRad(P.m3ry || 0), 0, 'YXZ');
      const ax = P.m3axis || 'y';
      spin.rotation.set(ax === 'x' ? spinA : ax === 'xy' ? spinA * 0.62 : 0, ax === 'y' || ax === 'xy' ? spinA : 0, ax === 'z' ? spinA : 0);
      if (mixer && P.m3anim !== false) mixer.update(dt);
      // kamera mieści kulę o promieniu 1 w kadrze niezależnie od proporcji
      const vh = MathUtils.degToRad(camera.fov / 2), hh = Math.atan(Math.tan(vh) * camera.aspect);
      const dist = 1.06 / Math.sin(Math.min(vh, hh)) / (P.m3zoom || 1);
      camera.position.set(0, 0, dist); camera.near = Math.max(0.01, dist - 3); camera.far = dist + 3; camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
      DU.uNear.value = dist - 1; DU.uFar.value = dist + 1; DU.uMix.value = P.m3depth || 0;
      const az = MathUtils.degToRad(P.m3az ?? -40), el = MathUtils.degToRad(P.m3el ?? 35);
      key.position.set(Math.sin(az) * Math.cos(el) * 10, Math.sin(el) * 10, Math.cos(az) * Math.cos(el) * 10);
      key.intensity = (P.m3light ?? 2); amb.intensity = (P.m3amb ?? 0.15) * 3;
      renderer.render(scene, camera);
    },
    dispose(){ renderer.dispose(); pmrem.dispose(); },
  };
}
