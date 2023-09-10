import * as THREE from "three";
import { Event, Component, } from "../../base-types";
import { Canvas, Button, RangeInput } from "../../ui";
export class MiniMap extends Component {
    get lockRotation() {
        return this._lockRotation;
    }
    set lockRotation(active) {
        this._lockRotation = active;
        if (active) {
            this._camera.rotation.z = 0;
        }
    }
    get zoom() {
        return this._camera.zoom;
    }
    set zoom(value) {
        this._camera.zoom = value;
        this._camera.updateProjectionMatrix();
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(active) {
        this._enabled = active;
        this.uiElement.canvas.visible = active;
    }
    constructor(components) {
        super();
        this.name = "MiniMap";
        this.afterUpdate = new Event();
        this.beforeUpdate = new Event();
        // By pushing the map to the front, what the user sees on screen corresponds with what they see on the map
        this.frontOffset = 0;
        this.overrideMaterial = new THREE.MeshDepthMaterial();
        this.backgroundColor = new THREE.Color(0x06080a);
        this._enabled = true;
        this._lockRotation = true;
        this._size = new THREE.Vector2(320, 160);
        this._tempVector1 = new THREE.Vector3();
        this._tempVector2 = new THREE.Vector3();
        this._tempTarget = new THREE.Vector3();
        this.down = new THREE.Vector3(0, -1, 0);
        this.updatePlanes = () => {
            const planes = [];
            const renderer = this._components.renderer.get();
            for (const plane of renderer.clippingPlanes) {
                planes.push(plane);
            }
            planes.push(this._plane);
            this._renderer.clippingPlanes = planes;
        };
        this.uiElement = {
            main: new Button(components),
            canvas: new Canvas(components),
        };
        this.uiElement.main.materialIcon = "map";
        this.uiElement.main.onclick = () => {
            this.uiElement.canvas.visible = !this.uiElement.canvas.visible;
        };
        const range = new RangeInput(components);
        this.uiElement.canvas.addChild(range);
        this._components = components;
        const canvas = this.uiElement.canvas.get();
        this._renderer = new THREE.WebGLRenderer({ canvas });
        this._renderer.setSize(this._size.x, this._size.y);
        const frustumSize = 1;
        const aspect = this._size.x / this._size.y;
        this._camera = new THREE.OrthographicCamera((frustumSize * aspect) / -2, (frustumSize * aspect) / 2, frustumSize / 2, frustumSize / -2);
        this._components.renderer.onClippingPlanesUpdated.on(this.updatePlanes);
        this._camera.position.set(0, 200, 0);
        this._camera.zoom = 0.1;
        this._camera.rotation.x = -Math.PI / 2;
        this._plane = new THREE.Plane(this.down, 200);
        this.updatePlanes();
    }
    dispose() {
        this.enabled = false;
        this.uiElement.main.dispose();
        this.uiElement.canvas.dispose();
        this.beforeUpdate.reset();
        this.afterUpdate.reset();
        this.overrideMaterial.dispose();
        this._renderer.dispose();
        this._components = null;
    }
    get() {
        return this._camera;
    }
    update() {
        if (!this.enabled)
            return;
        this.beforeUpdate.trigger();
        const scene = this._components.scene.get();
        const cameraComponent = this._components.camera;
        const controls = cameraComponent.controls;
        controls.getPosition(this._tempVector1);
        this._camera.position.x = this._tempVector1.x;
        this._camera.position.z = this._tempVector1.z;
        if (this.frontOffset !== 0) {
            controls.getTarget(this._tempVector2);
            this._tempVector2.sub(this._tempVector1);
            this._tempVector2.normalize().multiplyScalar(this.frontOffset);
            this._camera.position.x += this._tempVector2.x;
            this._camera.position.z += this._tempVector2.z;
        }
        if (!this._lockRotation) {
            controls.getTarget(this._tempTarget);
            const angle = Math.atan2(this._tempTarget.x - this._tempVector1.x, this._tempTarget.z - this._tempVector1.z);
            this._camera.rotation.z = angle + Math.PI;
        }
        this._plane.set(this.down, this._tempVector1.y);
        const previousBackground = scene.background;
        scene.background = this.backgroundColor;
        this._renderer.render(scene, this._camera);
        scene.background = previousBackground;
        this.afterUpdate.trigger();
    }
    getSize() {
        return this.uiElement.canvas.getSize();
    }
    resize(size) {
        if (size) {
            this._size.copy(size);
            this.uiElement.canvas.resize(size);
            this._renderer.setSize(size.x, size.y);
            const aspect = size.x / size.y;
            const frustumSize = 1;
            this._camera.left = (frustumSize * aspect) / -2;
            this._camera.right = (frustumSize * aspect) / 2;
            this._camera.top = frustumSize / 2;
            this._camera.bottom = -frustumSize / 2;
            this._camera.updateProjectionMatrix();
        }
    }
}
//# sourceMappingURL=index.js.map