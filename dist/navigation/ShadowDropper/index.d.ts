import * as THREE from "three";
import { Component, Disposable } from "../../base-types";
import { Components } from "../../core";
export interface Shadow {
    root: THREE.Group;
    rt: THREE.WebGLRenderTarget;
    rtBlur: THREE.WebGLRenderTarget;
    blurPlane: THREE.Mesh;
    camera: THREE.Camera;
}
export interface Shadows {
    [id: string]: Shadow;
}
export declare class ShadowDropper extends Component<Shadows> implements Disposable {
    private components;
    name: string;
    enabled: boolean;
    cameraHeight: number;
    darkness: number;
    opacity: number;
    resolution: number;
    amount: number;
    planeColor: number;
    shadowOffset: number;
    shadowExtraScaleFactor: number;
    private shadows;
    private disposer;
    private tempMaterial;
    private depthMaterial;
    constructor(components: Components);
    /** {@link Component.get} */
    get(): Shadows;
    /** {@link Disposable.dispose} */
    dispose(): void;
    /**
     * Creates a blurred dropped shadow of the given mesh.
     *
     * @param model - the mesh whose shadow to generate.
     * @param id - the name of this shadow.
     */
    renderShadow(model: THREE.Mesh[], id: string): THREE.Group;
    /**
     * Deletes the specified shadow (if it exists).
     *
     * @param id - the name of this shadow.
     */
    deleteShadow(id: string): void;
    private createPlanes;
    private initializeShadow;
    private bakeShadow;
    private static initializeCamera;
    private static initializeRenderTargets;
    private initializeRoot;
    private createBasePlane;
    private static createBlurPlane;
    private createPlaneMaterial;
    private initializeDepthMaterial;
    private createShadow;
    private createCamera;
    private getSizeCenterMin;
    private blurShadow;
}
