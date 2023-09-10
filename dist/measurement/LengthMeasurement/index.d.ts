import * as THREE from "three";
import { SimpleDimensionLine } from "./simple-dimension-line";
import { Component, Createable, Disposable, Hideable, Updateable, Event, UI } from "../../base-types";
import { Components } from "../../core";
import { Button } from "../../ui";
/**
 * A basic dimension tool to measure distances between 2 points in 3D and
 * display a 3D symbol displaying the numeric value.
 */
export declare class LengthMeasurement extends Component<SimpleDimensionLine[]> implements Createable, Hideable, Disposable, Updateable, UI {
    private _components;
    /** {@link Component.name} */
    readonly name = "LengthMeasurement";
    /** {@link Updateable.beforeUpdate} */
    readonly beforeUpdate: Event<LengthMeasurement>;
    /** {@link Updateable.afterUpdate} */
    readonly afterUpdate: Event<LengthMeasurement>;
    /** {@link Createable.afterCreate} */
    readonly afterCreate: Event<SimpleDimensionLine>;
    /** {@link Createable.beforeCreate} */
    readonly beforeCreate: Event<LengthMeasurement>;
    /** {@link Createable.afterDelete} */
    readonly afterDelete: Event<LengthMeasurement>;
    /** {@link Createable.beforeDelete} */
    readonly beforeDelete: Event<SimpleDimensionLine>;
    /** {@link Createable.beforeCancel} */
    readonly beforeCancel: Event<LengthMeasurement>;
    /** {@link Createable.afterCancel} */
    readonly afterCancel: Event<SimpleDimensionLine>;
    uiElement: {
        main: Button;
    };
    /** The minimum distance to force the dimension cursor to a vertex. */
    snapDistance: number;
    /** The [symbol](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer)
     * that is displayed where the dimension will be drawn. */
    previewElement?: HTMLElement;
    private _vertexPicker;
    private _lineMaterial;
    private _measurements;
    private _visible;
    private _enabled;
    private _raycaster;
    /** Temporary variables for internal operations */
    private _temp;
    /** {@link Component.enabled} */
    get enabled(): boolean;
    /** {@link Component.enabled} */
    set enabled(value: boolean);
    /** {@link Hideable.visible} */
    get visible(): boolean;
    /** {@link Hideable.visible} */
    set visible(value: boolean);
    /**
     * The [Color](https://threejs.org/docs/#api/en/math/Color)
     * of the geometry of the dimensions.
     */
    set color(color: THREE.Color);
    constructor(_components: Components);
    private setUI;
    /** {@link Component.get} */
    get(): SimpleDimensionLine[];
    /** {@link Disposable.dispose} */
    dispose(): void;
    /** {@link Updateable.update} */
    update(_delta: number): void;
    /**
     * Starts or finishes drawing a new dimension line.
     *
     * @param data - forces the dimension to be drawn on a plane. Use this if you are drawing
     * dimensions in floor plan navigation.
     */
    create: (data?: any) => void;
    /** Deletes the dimension that the user is hovering over with the mouse or touch event. */
    delete(): void;
    /** Deletes all the dimensions that have been previously created. */
    deleteAll(): void;
    /** Cancels the drawing of the current dimension. */
    cancelCreation(): void;
    private drawStart;
    private drawInProcess;
    endCreation(): void;
    private drawDimension;
    private newEndpoint;
    private getBoundingBoxes;
    private setupEvents;
    private onKeyDown;
}
export * from "./simple-dimension-line";
export * from "./types";
