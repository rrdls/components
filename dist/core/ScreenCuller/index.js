import * as THREE from "three";
import { Component, Event } from "../../base-types";
import { Disposer } from "../Disposer";
import { readPixelsAsync } from "./src/screen-culler-helper";
// TODO: Clean up and document
// TODO: Work at the instance level instead of the mesh level
export class ScreenCuller extends Component {
    constructor(components, updateInterval = 1000, rtWidth = 512, rtHeight = 512, autoUpdate = true) {
        super();
        this.components = components;
        this.updateInterval = updateInterval;
        this.rtWidth = rtWidth;
        this.rtHeight = rtHeight;
        this.autoUpdate = autoUpdate;
        this.name = "ScreenCuller";
        this.enabled = true;
        this.viewUpdated = new Event();
        this.needsUpdate = false;
        this.meshColorMap = new Map();
        this.renderDebugFrame = false;
        this.visibleMeshes = [];
        this.colorMeshes = new Map();
        this.meshes = new Map();
        this.currentVisibleMeshes = new Set();
        this.recentlyHiddenMeshes = new Set();
        this._transparentMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
        });
        this._disposer = new Disposer();
        this._colors = { r: 0, g: 0, b: 0, i: 0 };
        // Alternative scene and meshes to make the visibility check
        this._scene = new THREE.Scene();
        this.updateVisibility = async (force) => {
            if (!this.enabled)
                return;
            if (!this.needsUpdate && !force)
                return;
            const camera = this.components.camera.get();
            camera.updateMatrix();
            this.renderer.setSize(this.rtWidth, this.rtHeight);
            this.renderer.setRenderTarget(this.renderTarget);
            this.renderer.render(this._scene, camera);
            const context = this.renderer.getContext();
            await readPixelsAsync(context, 0, 0, this.rtWidth, this.rtHeight, context.RGBA, context.UNSIGNED_BYTE, this._buffer);
            this.renderer.setRenderTarget(null);
            if (this.renderDebugFrame) {
                this.renderer.render(this._scene, camera);
            }
            this.worker.postMessage({
                buffer: this._buffer,
            });
            this.needsUpdate = false;
        };
        this.handleWorkerMessage = (event) => {
            const colors = event.data.colors;
            this.recentlyHiddenMeshes = new Set(this.currentVisibleMeshes);
            this.currentVisibleMeshes.clear();
            this.visibleMeshes = [];
            // Make found meshes visible
            for (const code of colors.values()) {
                const mesh = this.meshColorMap.get(code);
                if (mesh) {
                    this.visibleMeshes.push(mesh);
                    mesh.visible = true;
                    this.currentVisibleMeshes.add(mesh.uuid);
                    this.recentlyHiddenMeshes.delete(mesh.uuid);
                }
            }
            // Hide meshes that were visible before but not anymore
            for (const uuid of this.recentlyHiddenMeshes) {
                const mesh = this.meshes.get(uuid);
                if (mesh === undefined)
                    continue;
                mesh.visible = false;
            }
            this.viewUpdated.trigger();
        };
        this.renderer = new THREE.WebGLRenderer();
        const planes = this.components.renderer.clippingPlanes;
        this.renderer.clippingPlanes = planes;
        this.renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
        this.bufferSize = rtWidth * rtHeight * 4;
        this._buffer = new Uint8Array(this.bufferSize);
        this.materialCache = new Map();
        const code = `
      addEventListener("message", (event) => {
        const { buffer } = event.data;
        const colors = new Set();
        for (let i = 0; i < buffer.length; i += 4) {
            const r = buffer[i];
            const g = buffer[i + 1];
            const b = buffer[i + 2];
            const code = "" + r + "-" + g + "-" + b;
            colors.add(code);
        }
        postMessage({ colors });
      });
    `;
        const blob = new Blob([code], { type: "application/javascript" });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.addEventListener("message", this.handleWorkerMessage);
        if (autoUpdate)
            window.setInterval(this.updateVisibility, updateInterval);
    }
    get() {
        return null;
    }
    dispose() {
        this.enabled = false;
        this.currentVisibleMeshes.clear();
        this.recentlyHiddenMeshes.clear();
        this._scene.children.length = 0;
        this.viewUpdated.reset();
        this.worker.terminate();
        this.renderer.dispose();
        this.renderTarget.dispose();
        this._buffer = null;
        this._transparentMat.dispose();
        this.meshColorMap.clear();
        this.visibleMeshes = [];
        for (const id in this.materialCache) {
            const material = this.materialCache.get(id);
            if (material) {
                material.dispose();
            }
        }
        for (const id in this.colorMeshes) {
            const mesh = this.colorMeshes.get(id);
            if (mesh) {
                this._disposer.dispose(mesh);
            }
        }
        this.colorMeshes.clear();
        this.meshes.clear();
    }
    add(mesh) {
        if (!this.enabled)
            return;
        const isInstanced = mesh instanceof THREE.InstancedMesh;
        const { geometry, material } = mesh;
        const { r, g, b, code } = this.getNextColor();
        const colorMaterial = this.getMaterial(r, g, b);
        let newMaterial;
        if (Array.isArray(material)) {
            let transparentOnly = true;
            const matArray = [];
            for (const mat of material) {
                if (this.isTransparent(mat)) {
                    matArray.push(this._transparentMat);
                }
                else {
                    transparentOnly = false;
                    matArray.push(colorMaterial);
                }
            }
            // If we find that all the materials are transparent then we must remove this from analysis
            if (transparentOnly) {
                colorMaterial.dispose();
                return;
            }
            newMaterial = matArray;
        }
        else if (this.isTransparent(material)) {
            // This material is transparent, so we must remove it from analysis
            colorMaterial.dispose();
            return;
        }
        else {
            newMaterial = colorMaterial;
        }
        this.meshColorMap.set(code, mesh);
        const count = isInstanced ? mesh.count : 1;
        const colorMesh = new THREE.InstancedMesh(geometry, newMaterial, count);
        if (isInstanced) {
            colorMesh.instanceMatrix = mesh.instanceMatrix;
        }
        else {
            colorMesh.setMatrixAt(0, new THREE.Matrix4());
        }
        mesh.visible = false;
        colorMesh.applyMatrix4(mesh.matrix);
        colorMesh.updateMatrix();
        this._scene.add(colorMesh);
        this.colorMeshes.set(mesh.uuid, colorMesh);
        this.meshes.set(mesh.uuid, mesh);
    }
    getMaterial(r, g, b) {
        const colorEnabled = THREE.ColorManagement.enabled;
        THREE.ColorManagement.enabled = false;
        const code = `rgb(${r}, ${g}, ${b})`;
        const color = new THREE.Color(code);
        let material = this.materialCache.get(code);
        const clippingPlanes = this.components.renderer.clippingPlanes;
        if (!material) {
            material = new THREE.MeshBasicMaterial({
                color,
                clippingPlanes,
                side: THREE.DoubleSide,
            });
            this.materialCache.set(code, material);
        }
        THREE.ColorManagement.enabled = colorEnabled;
        return material;
    }
    isTransparent(material) {
        return material.transparent && material.opacity < 1;
    }
    getNextColor() {
        if (this._colors.i === 0) {
            this._colors.b++;
            if (this._colors.b === 256) {
                this._colors.b = 0;
                this._colors.i = 1;
            }
        }
        if (this._colors.i === 1) {
            this._colors.g++;
            this._colors.i = 0;
            if (this._colors.g === 256) {
                this._colors.g = 0;
                this._colors.i = 2;
            }
        }
        if (this._colors.i === 2) {
            this._colors.r++;
            this._colors.i = 1;
            if (this._colors.r === 256) {
                this._colors.r = 0;
                this._colors.i = 0;
            }
        }
        return {
            r: this._colors.r,
            g: this._colors.g,
            b: this._colors.b,
            code: `${this._colors.r}-${this._colors.g}-${this._colors.b}`,
        };
    }
}
//# sourceMappingURL=index.js.map