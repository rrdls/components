import * as THREE from "three";
import { Component } from "../../base-types";
// TODO: Clean up and document
// TODO: Disable / enable instance color for instance meshes
export class MaterialManager extends Component {
    constructor(components) {
        super();
        this._originalBackground = null;
        this.enabled = true;
        this.name = "MaterialManager";
        this._originals = {};
        this._list = {};
        this._components = components;
    }
    get() {
        return Object.keys(this._list);
    }
    set(active, ids = Object.keys(this._list)) {
        for (const id of ids) {
            const { material, meshes } = this._list[id];
            for (const mesh of meshes) {
                if (active) {
                    if (!this._originals[mesh.uuid]) {
                        this._originals[mesh.uuid] = { material: mesh.material };
                    }
                    if (mesh instanceof THREE.InstancedMesh && mesh.instanceColor) {
                        this._originals[mesh.uuid].instances = mesh.instanceColor;
                        mesh.instanceColor = null;
                    }
                    mesh.material = material;
                }
                else {
                    if (!this._originals[mesh.uuid])
                        continue;
                    mesh.material = this._originals[mesh.uuid].material;
                    const instances = this._originals[mesh.uuid].instances;
                    if (mesh instanceof THREE.InstancedMesh && instances) {
                        mesh.instanceColor = instances;
                    }
                }
            }
        }
    }
    dispose() {
        for (const id in this._list) {
            const { material } = this._list[id];
            material.dispose();
        }
        this._list = {};
        this._originals = {};
        this._components = null;
    }
    setBackgroundColor(color) {
        const scene = this._components.scene.get();
        if (!this._originalBackground) {
            this._originalBackground = scene.background;
        }
        if (this._originalBackground) {
            scene.background = color;
        }
    }
    resetBackgroundColor() {
        const scene = this._components.scene.get();
        if (this._originalBackground) {
            scene.background = this._originalBackground;
        }
    }
    addMaterial(id, material) {
        if (this._list[id]) {
            throw new Error("This ID already exists!");
        }
        this._list[id] = { material, meshes: new Set() };
    }
    addMeshes(id, meshes) {
        if (!this._list[id]) {
            throw new Error("This ID doesn't exists!");
        }
        for (const mesh of meshes) {
            this._list[id].meshes.add(mesh);
        }
    }
}
//# sourceMappingURL=index.js.map