import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import CameraControls from "camera-controls";
import { CustomOutlinePass } from "./custom-outline-pass";
import { Components } from "../../components";

// TODO: Clean up and document this

// source: https://discourse.threejs.org/t/how-to-render-full-outlines-as-a-post-process-tutorial/22674

export class Postproduction {
  htmlOverlay = document.createElement("img");
  excludedItems = new Set<THREE.Object3D>();

  private initialized = false;

  private saoPass?: SAOPass;
  private fxaaPass?: ShaderPass;
  private basePass?: RenderPass;

  /** @hidden */
  private customOutline?: CustomOutlinePass;
  private outlineUniforms: any;
  private depthTexture?: THREE.DepthTexture;
  private readonly composer: EffectComposer;
  private readonly renderTarget: THREE.WebGLRenderTarget;
  private readonly visibilityField = "ifcjsPostproductionVisible";

  private isUserControllingCamera = false;
  private isControlSleeping = true;
  private lastWheelUsed = 0;
  private lastResized = 0;
  private resizeDelay = 500;

  private isActive = false;
  private isVisible = false;

  private scene?: THREE.Scene;
  private white = new THREE.Color(255, 255, 255);

  private tempMaterial = new THREE.MeshLambertMaterial({
    colorWrite: false,
    opacity: 0,
    transparent: true,
  });

  private outlineParams = {
    mode: { Mode: 0 },
    FXAA: true,
    outlineColor: 0x777777,
    depthBias: 1,
    depthMult: 1,
    normalBias: 5,
    normalMult: 1,
  };

  get active() {
    return this.isActive;
  }

  set active(active: boolean) {
    if (this.isActive === active) return;
    if (!this.initialized) this.tryToInitialize();
    this.visible = active;
    this.isActive = active;
  }

  get visible() {
    return this.isVisible;
  }

  set visible(visible: boolean) {
    if (!this.isActive) return;
    this.isVisible = visible;
    if (visible) this.update();
    this.htmlOverlay.style.visibility = visible ? "visible" : "collapse";
  }

  get outlineColor() {
    return this.outlineParams.outlineColor;
  }

  set outlineColor(color: number) {
    this.outlineParams.outlineColor = color;
    if (this.outlineUniforms) {
      this.outlineUniforms.outlineColor.value.set(color);
    }
  }

  get sao() {
    return this.saoPass?.params;
  }

  constructor(
    private components: Components,
    private renderer: THREE.WebGLRenderer
  ) {
    this.renderTarget = this.newRenderTarget();

    this.composer = new EffectComposer(this.renderer, this.renderTarget);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  dispose() {
    this.active = false;
    window.removeEventListener("resize", this.onResize);
    this.renderTarget.dispose();
    this.depthTexture?.dispose();
    this.customOutline?.dispose();
    this.excludedItems.clear();
    this.htmlOverlay.remove();
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  update() {
    if (!this.initialized || !this.isActive) return;

    this.hideExcludedItems();

    const scene = this.components.scene.get();

    scene.traverse((object) => {
      // @ts-ignore
      object.userData.prevMaterial = object.material;
      // @ts-ignore
      object.material = this.tempMaterial;
    });

    const background = this.scene?.background;
    if (this.scene?.background && background)
      this.scene.background = this.white;

    this.composer.render();

    if (this.scene?.background && background)
      this.scene.background = background;

    scene.traverse((object) => {
      // @ts-ignore
      object.material = object.userData.prevMaterial;
      delete object.userData.prevMaterial;
    });

    this.htmlOverlay.src = this.renderer.domElement.toDataURL();
    this.showExcludedItems();
  }

  private hideExcludedItems() {
    for (const object of this.excludedItems) {
      object.userData[this.visibilityField] = object.visible;
      object.visible = false;
    }
  }

  private showExcludedItems() {
    for (const object of this.excludedItems) {
      if (object.userData[this.visibilityField] !== undefined) {
        object.visible = object.userData[this.visibilityField];
      }
    }
  }

  private tryToInitialize() {
    const scene = this.components.scene.get();
    const camera = this.components.camera.get() as THREE.PerspectiveCamera;
    if (!scene || !camera) return;

    this.scene = scene;
    const renderer = this.components.renderer;
    this.renderer.clippingPlanes = renderer.clippingPlanes;

    this.addBasePass(scene, camera);
    this.addSaoPass(scene, camera);
    this.addOutlinePass(scene, camera);
    this.addAntialiasPass();
    this.setupHtmlOverlay();

    this.initialized = true;
  }

  setup(controls: CameraControls) {
    const domElement = this.components.renderer.get().domElement;
    controls.addEventListener("control", this.onControl);
    controls.addEventListener("controlstart", this.onControlStart);
    controls.addEventListener("wake", this.onWake);
    controls.addEventListener("controlend", this.onControlEnd);
    domElement.addEventListener("wheel", this.onWheel);
    controls.addEventListener("sleep", this.onSleep);
    window.addEventListener("resize", this.onResize);
  }

  updateProjection(camera: THREE.Camera) {
    this.composer.passes.forEach((pass) => {
      // @ts-ignore
      pass.camera = camera;
    });
    this.update();
  }

  private onControlStart = () => (this.isUserControllingCamera = true);
  private onWake = () => (this.isControlSleeping = false);

  private onResize = () => {
    this.lastResized = performance.now();
    this.visible = false;

    setTimeout(() => {
      if (performance.now() - this.lastResized >= this.resizeDelay) {
        this.visible = true;
      }
    }, this.resizeDelay);
  };

  private onControl = () => {
    this.visible = false;
  };

  private onControlEnd = () => {
    this.isUserControllingCamera = false;
    if (!this.isUserControllingCamera && this.isControlSleeping) {
      this.visible = true;
    }
  };

  private onWheel = () => {
    this.lastWheelUsed = performance.now();
  };

  private onSleep = () => {
    // This prevents that this gets triggered a million times when zooming with the wheel
    this.isControlSleeping = true;
    const currentWheel = performance.now();
    setTimeout(() => {
      if (this.lastWheelUsed > currentWheel) return;
      if (!this.isUserControllingCamera && this.isControlSleeping) {
        this.visible = true;
      }
    }, 200);
  };

  private setupHtmlOverlay() {
    const dom = this.components.renderer.get().domElement;
    if (!dom.parentElement) {
      throw new Error("The viewer container has no HTML parent");
    }
    dom.parentElement.appendChild(this.htmlOverlay);
    // @ts-ignore
    this.htmlOverlay.style.mixBlendMode = "multiply";
    this.htmlOverlay.style.position = "absolute";
    this.htmlOverlay.style.height = "100%";
    this.htmlOverlay.style.userSelect = "none";
    this.htmlOverlay.style.pointerEvents = "none";
    this.htmlOverlay.style.top = "0";
    this.htmlOverlay.style.left = "0";
  }

  private addAntialiasPass() {
    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.uniforms.resolution.value.set(
      (1 / this.renderer.domElement.offsetWidth) *
        this.renderer.getPixelRatio(),
      (1 / this.renderer.domElement.offsetHeight) *
        this.renderer.getPixelRatio()
    );
    this.composer.addPass(this.fxaaPass);
  }

  private addOutlinePass(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.customOutline = new CustomOutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );

    // Initial values
    // @ts-ignore
    this.outlineUniforms = this.customOutline.fsQuad.material.uniforms;
    this.outlineUniforms.outlineColor.value.set(
      this.outlineParams.outlineColor
    );
    this.outlineUniforms.multiplierParameters.value.x =
      this.outlineParams.depthBias;
    this.outlineUniforms.multiplierParameters.value.y =
      this.outlineParams.depthMult;
    this.outlineUniforms.multiplierParameters.value.z =
      this.outlineParams.normalBias;
    this.outlineUniforms.multiplierParameters.value.w =
      this.outlineParams.normalMult;

    this.composer.addPass(this.customOutline);
  }

  private addSaoPass(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.saoPass = new SAOPass(scene, camera, false, true);
    this.composer.addPass(this.saoPass);

    this.saoPass.enabled = true;
    this.saoPass.params.saoIntensity = 0.02;
    this.saoPass.params.saoBias = 0.5;
    this.saoPass.params.saoBlurRadius = 8;
    this.saoPass.params.saoBlurDepthCutoff = 0.0015;
    this.saoPass.params.saoScale = 30;
    this.saoPass.params.saoKernelRadius = 30;
  }

  private addBasePass(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.basePass = new RenderPass(scene, camera);
    this.composer.addPass(this.basePass);
  }

  private newRenderTarget() {
    this.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight
    );
    return new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      depthTexture: this.depthTexture,
      depthBuffer: true,
    });
  }
}
