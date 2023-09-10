import * as THREE from "three";
import { Components, SimpleClipper } from "../../core";
import { EdgesPlane } from "./src/edges-plane";
import { EdgesStyles } from "./src/edges-styles";
export * from "./src/edges-plane";
/**
 * A more advanced version of {@link SimpleClipper} that also supports
 * {@link ClippingEdges} with customizable lines.
 */
export declare class EdgesClipper extends SimpleClipper<EdgesPlane> {
    /** The list of defined {@link LineStyle} instances. */
    styles: EdgesStyles;
    /** {@link Component.name} */
    name: string;
    constructor(components: Components, PlaneType: new (...args: any) => EdgesPlane);
    /** {@link Component.get} */
    dispose(): void;
    /**
     * Updates all the lines of the {@link ClippingEdges}.
     */
    updateEdges(updateFills?: boolean): void;
    protected newPlaneInstance(point: THREE.Vector3, normal: THREE.Vector3): EdgesPlane;
}
