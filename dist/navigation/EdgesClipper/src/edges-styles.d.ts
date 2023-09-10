import * as THREE from "three";
import { ClipStyle } from "./types";
import { Component, Disposable, Event, Updateable } from "../../../base-types";
import { Components } from "../../../core";
export type LineStyles = {
    [name: string]: ClipStyle;
};
export declare class EdgesStyles extends Component<LineStyles> implements Disposable, Updateable {
    components: Components;
    name: string;
    enabled: boolean;
    protected _styles: LineStyles;
    protected _defaultLineMaterial: THREE.LineBasicMaterial;
    constructor(components: Components);
    afterUpdate: Event<LineStyles>;
    beforeUpdate: Event<LineStyles>;
    get(): LineStyles;
    update(_delta: number): void;
    create(name: string, meshes: Set<THREE.Mesh>, lineMaterial?: THREE.LineBasicMaterial, fillMaterial?: THREE.Material, outlineMaterial?: THREE.MeshBasicMaterial): ClipStyle;
    dispose(): void;
    deleteStyle(id: string, disposeMaterials?: boolean): void;
}
