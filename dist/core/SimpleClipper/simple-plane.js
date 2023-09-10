import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Component, Event } from "../../base-types";
/**
 * Each of the planes created by {@link SimpleClipper}.
 */
export class SimplePlane extends Component {
    /** {@link Component.enabled} */
    get enabled() {
        return this._enabled;
    }
    /** {@link Component.enabled} */
    set enabled(state) {
        this._enabled = state;
        this._components.renderer.togglePlane(state, this._plane);
    }
    /** {@link Hideable.visible } */
    get visible() {
        return this._visible;
    }
    /** {@link Hideable.visible } */
    set visible(state) {
        this._visible = state;
        this._controls.visible = state;
        this._helper.visible = state;
        this.toggleControls(state);
    }
    /** The meshes used for raycasting */
    get meshes() {
        return [this._planeMesh, this._arrowBoundBox];
    }
    /** The material of the clipping plane representation. */
    get planeMaterial() {
        return this._planeMesh.material;
    }
    /** The material of the clipping plane representation. */
    set planeMaterial(material) {
        this._planeMesh.material = material;
    }
    /** The size of the clipping plane representation. */
    get size() {
        return this._planeMesh.scale.x;
    }
    /** Sets the size of the clipping plane representation. */
    set size(size) {
        this._planeMesh.scale.set(size, size, size);
    }
    constructor(components, origin, normal, material, size = 5, activateControls = true) {
        super();
        /** {@link Component.name} */
        this.name = "SimplePlane";
        /** Event that fires when the user starts dragging a clipping plane. */
        this.draggingStarted = new Event();
        /** Event that fires when the user stops dragging a clipping plane. */
        this.draggingEnded = new Event();
        this._plane = new THREE.Plane();
        // TODO: Make all planes share the same geometry
        // TODO: Clean up unnecessary attributes, clean up constructor
        this._visible = true;
        this._enabled = true;
        this._controlsActive = false;
        this._arrowBoundBox = new THREE.Mesh();
        this._hiddenMaterial = new THREE.MeshBasicMaterial({
            visible: false,
        });
        /** {@link Updateable.update} */
        this.update = () => {
            if (!this._enabled)
                return;
            this._plane.setFromNormalAndCoplanarPoint(this._normal, this._helper.position);
        };
        this.changeDrag = (event) => {
            this._visible = !event.value;
            this.preventCameraMovement();
            this.notifyDraggingChanged(event);
        };
        this._components = components;
        this._normal = normal;
        this._origin = origin;
        this._components.renderer.togglePlane(true, this._plane);
        this._planeMesh = SimplePlane.newPlaneMesh(size, material);
        this._helper = this.newHelper();
        this._controls = this.newTransformControls();
        this._plane.setFromNormalAndCoplanarPoint(normal, origin);
        if (activateControls) {
            this.toggleControls(true);
        }
    }
    /** {@link Component.get} */
    get() {
        return this._plane;
    }
    /** {@link Disposable.dispose} */
    dispose() {
        this._enabled = false;
        this.draggingStarted.reset();
        this.draggingEnded.reset();
        this._helper.removeFromParent();
        this._components.renderer.togglePlane(false, this._plane);
        this._arrowBoundBox.removeFromParent();
        this._arrowBoundBox.geometry.dispose();
        this._planeMesh.geometry.dispose();
        this._controls.removeFromParent();
        this._controls.dispose();
    }
    toggleControls(state) {
        if (state) {
            if (this._controlsActive)
                return;
            this._controls.addEventListener("change", this.update);
            this._controls.addEventListener("dragging-changed", this.changeDrag);
        }
        else {
            this._controls.removeEventListener("change", this.update);
            this._controls.removeEventListener("dragging-changed", this.changeDrag);
        }
        this._controlsActive = state;
    }
    newTransformControls() {
        const camera = this._components.camera.get();
        const container = this._components.renderer.get().domElement;
        const controls = new TransformControls(camera, container);
        this.initializeControls(controls);
        this._components.scene.get().add(controls);
        return controls;
    }
    initializeControls(controls) {
        controls.attach(this._helper);
        controls.showX = false;
        controls.showY = false;
        controls.setSpace("local");
        this.createArrowBoundingBox();
        controls.children[0].children[0].add(this._arrowBoundBox);
    }
    createArrowBoundingBox() {
        this._arrowBoundBox.geometry = new THREE.CylinderGeometry(0.18, 0.18, 1.2);
        this._arrowBoundBox.material = this._hiddenMaterial;
        this._arrowBoundBox.rotateX(Math.PI / 2);
        this._arrowBoundBox.updateMatrix();
        this._arrowBoundBox.geometry.applyMatrix4(this._arrowBoundBox.matrix);
    }
    notifyDraggingChanged(event) {
        if (event.value) {
            this.draggingStarted.trigger();
        }
        else {
            this.draggingEnded.trigger();
        }
    }
    preventCameraMovement() {
        this._components.camera.enabled = this._visible;
    }
    newHelper() {
        const helper = new THREE.Object3D();
        helper.lookAt(this._normal);
        helper.position.copy(this._origin);
        this._planeMesh.position.z += 0.01;
        helper.add(this._planeMesh);
        this._components.scene.get().add(helper);
        return helper;
    }
    static newPlaneMesh(size, material) {
        const planeGeom = new THREE.PlaneGeometry(1);
        const mesh = new THREE.Mesh(planeGeom, material);
        mesh.scale.set(size, size, size);
        return mesh;
    }
}
//# sourceMappingURL=simple-plane.js.map