import * as THREE from "three";
import { FragmentsGroup } from "bim-fragment";
import { Component, Disposable } from "../../base-types";
/**
 * A simple implementation of bounding box that works for fragments. The resulting bbox is not 100% precise, but
 * it's fast, and should suffice for general use cases such as camera zooming.
 */
export declare class FragmentBoundingBox extends Component<void> implements Disposable {
    name: string;
    enabled: boolean;
    private _disposer;
    private _absoluteMin;
    private _absoluteMax;
    private _meshes;
    constructor();
    static getDimensions(bbox: THREE.Box3): {
        width: number;
        height: number;
        depth: number;
        center: THREE.Vector3;
    };
    static newBound(positive: boolean): THREE.Vector3;
    static getBounds(points: THREE.Vector3[], min?: THREE.Vector3, max?: THREE.Vector3): THREE.Box3;
    dispose(): void;
    get(): THREE.Box3;
    getSphere(): THREE.Sphere;
    getMesh(): THREE.Mesh<THREE.BoxGeometry, THREE.Material | THREE.Material[]>;
    reset(): void;
    add(group: FragmentsGroup): void;
    addFragment(fragment: any): void;
    private static getFragmentBounds;
}
