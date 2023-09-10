import * as THREE from "three";
import { Edge } from "./types";
import { EdgesStyles } from "./edges-styles";
import { Component, Disposable, Hideable, Updateable, Event } from "../../../base-types";
import { Components, Disposer } from "../../../core";
export type Edges = {
    [name: string]: Edge;
};
/**
 * The edges that are drawn when the {@link EdgesPlane} sections a mesh.
 */
export declare class ClippingEdges extends Component<Edges> implements Hideable, Disposable, Updateable {
    /** {@link Component.name} */
    name: string;
    /** {@link Component.enabled}. */
    enabled: boolean;
    fillNeedsUpdate: boolean;
    protected blockByIndex: {
        [index: number]: number;
    };
    protected _edges: Edges;
    protected _styles: EdgesStyles;
    protected _disposer: Disposer;
    protected _visible: boolean;
    protected _inverseMatrix: THREE.Matrix4;
    protected _localPlane: THREE.Plane;
    protected _tempLine: THREE.Line3;
    protected _tempVector: THREE.Vector3;
    protected _components: Components;
    protected _plane: THREE.Plane;
    /** {@link Hideable.visible} */
    get visible(): boolean;
    /** {@link Hideable.visible} */
    set visible(visible: boolean);
    set fillVisible(visible: boolean);
    constructor(components: Components, plane: THREE.Plane, styles: EdgesStyles);
    /** {@link Updateable.afterUpdate} */
    afterUpdate: Event<Edge[]>;
    /** {@link Updateable.beforeUpdate} */
    beforeUpdate: Event<Edge[]>;
    /** {@link Updateable.update} */
    update(): void;
    /** {@link Component.get} */
    get(): Edges;
    /** {@link Disposable.dispose} */
    dispose(): void;
    private newEdgesMesh;
    private newFillMesh;
    private newFillOutline;
    private drawEdges;
    private initializeStyle;
    private shapecast;
    private updateEdgesVisibility;
    private updateDeletedEdges;
    private disposeOutline;
    private disposeEdge;
}
