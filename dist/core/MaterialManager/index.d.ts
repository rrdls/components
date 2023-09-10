import * as THREE from "three";
import { Component, Disposable } from "../../base-types";
import { Components } from "../Components";
export declare class MaterialManager extends Component<string[]> implements Disposable {
    private _components;
    private _originalBackground;
    enabled: boolean;
    name: string;
    private _originals;
    private _list;
    constructor(components: Components);
    get(): string[];
    set(active: boolean, ids?: string[]): void;
    dispose(): void;
    setBackgroundColor(color: THREE.Color): void;
    resetBackgroundColor(): void;
    addMaterial(id: string, material: THREE.Material): void;
    addMeshes(id: string, meshes: THREE.Mesh[]): void;
}
