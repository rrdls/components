import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { Event, BaseRenderer, } from "../../base-types";
/**
 * A basic renderer capable of rendering 3D and 2D objects
 * ([Objec3Ds](https://threejs.org/docs/#api/en/core/Object3D) and
 * [CSS2DObjects](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer)
 * respectively).
 */
export class SimpleRenderer extends BaseRenderer {
    constructor(components, container, parameters) {
        super();
        this.components = components;
        this.container = container;
        /** {@link Component.name} */
        this.name = "SimpleRenderer";
        /** {@link Component.enabled} */
        this.enabled = true;
        /** {@link Updateable.beforeUpdate} */
        this.beforeUpdate = new Event();
        /** {@link Updateable.afterUpdate} */
        this.afterUpdate = new Event();
        this.resized = new Event();
        this._renderer2D = new CSS2DRenderer();
        /** {@link Resizeable.resize}. */
        this.resize = () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this._renderer.setSize(width, height);
            this._renderer2D.setSize(width, height);
            this.resized.trigger();
        };
        this._renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            ...parameters,
        });
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.setupRenderers();
        this.setupEvents(true);
        this.resize();
    }
    /** {@link Component.get} */
    get() {
        return this._renderer;
    }
    /** {@link Updateable.update} */
    update(_delta) {
        if (!this.enabled)
            return;
        this.beforeUpdate.trigger(this);
        if (this.overrideScene && this.overrideCamera) {
            this._renderer.render(this.overrideScene, this.overrideCamera);
            this._renderer2D.render(this.overrideScene, this.overrideCamera);
        }
        else {
            const scene = this.components.scene.get();
            const camera = this.components.camera.get();
            if (!scene || !camera)
                return;
            this._renderer.render(scene, camera);
            this._renderer2D.render(scene, camera);
        }
        this.afterUpdate.trigger(this);
    }
    /** {@link Disposable.dispose} */
    dispose() {
        this.enabled = false;
        this.setupEvents(false);
        this._renderer.domElement.remove();
        this._renderer.dispose();
        this._renderer2D.domElement.remove();
        this.afterUpdate.reset();
        this.beforeUpdate.reset();
    }
    /** {@link Resizeable.getSize}. */
    getSize() {
        return new THREE.Vector2(this._renderer.domElement.clientWidth, this._renderer.domElement.clientHeight);
    }
    setupRenderers() {
        this._renderer.localClippingEnabled = true;
        this.container.appendChild(this._renderer.domElement);
        this._renderer2D.domElement.style.position = "absolute";
        this._renderer2D.domElement.style.top = "0px";
        this._renderer2D.domElement.style.pointerEvents = "none";
        this.container.appendChild(this._renderer2D.domElement);
    }
    setupEvents(active) {
        if (active) {
            window.addEventListener("resize", this.resize);
        }
        else {
            window.removeEventListener("resize", this.resize);
        }
    }
}
//# sourceMappingURL=index.js.map