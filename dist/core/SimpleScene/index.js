import * as THREE from "three";
import { Component } from "../../base-types";
import { Disposer } from "../Disposer";
/**
 * A basic 3D [scene](https://threejs.org/docs/#api/en/scenes/Scene) to add
 * objects hierarchically, and easily dispose them when you are finished with it.
 * @noInheritDoc
 */
export class SimpleScene extends Component {
    constructor(_components) {
        super();
        /** {@link Component.enabled} */
        this.enabled = true;
        /** {@link Component.name} */
        this.name = "SimpleScene";
        this._disposer = new Disposer();
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x202932);
    }
    /** {@link Component.get} */
    get() {
        return this._scene;
    }
    /** {@link Disposable.dispose} */
    dispose() {
        for (const child of this._scene.children) {
            const mesh = child;
            if (mesh.geometry) {
                this._disposer.dispose(mesh);
            }
        }
        this._scene.children = [];
    }
}
//# sourceMappingURL=index.js.map