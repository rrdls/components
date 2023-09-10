import * as THREE from "three";
import { SimplePlane, Components } from "../../../core";
import { ClippingEdges } from "./clipping-edges";
import { EdgesStyles } from "./edges-styles";
/**
 * A more advanced version of {@link SimpleClipper} that also includes
 * {@link ClippingEdges} with customizable lines.
 */
export declare class EdgesPlane extends SimplePlane {
    readonly edges: ClippingEdges;
    /**
     * The max rate in milliseconds at which edges can be regenerated.
     * To disable this behaviour set this to 0.
     */
    edgesMaxUpdateRate: number;
    private lastUpdate;
    private updateTimeout;
    constructor(components: Components, origin: THREE.Vector3, normal: THREE.Vector3, material: THREE.Material, styles: EdgesStyles);
    /** {@link Hideable.visible} */
    set visible(state: boolean);
    /** {@link Component.enabled} */
    get enabled(): boolean;
    /** {@link Component.enabled} */
    set enabled(state: boolean);
    /** {@link Disposable.dispose} */
    dispose(): void;
    updateFill: () => void;
    /** {@link Updateable.update} */
    update: () => void;
    private hideFills;
}
