import { Vector3 } from "three";
import { Disposable, Event, Updateable } from "../../base-types/base-types";
import { Component } from "../../base-types/component";
import { Components } from "../../core/Components";
interface LineIntersectionPickerConfig {
    snapDistance: number;
}
export declare class LineIntersectionPicker extends Component<Vector3 | null> implements Updateable, Disposable {
    name: string;
    afterUpdate: Event<LineIntersectionPicker>;
    beforeUpdate: Event<LineIntersectionPicker>;
    private _pickedPoint;
    private _config;
    private _enabled;
    private _components;
    private _marker;
    private _raycaster;
    private _mouse;
    private _originVector;
    set enabled(value: boolean);
    get enabled(): boolean;
    get config(): Partial<LineIntersectionPickerConfig>;
    set config(value: Partial<LineIntersectionPickerConfig>);
    constructor(components: Components, config?: Partial<LineIntersectionPickerConfig>);
    dispose(): void;
    /** {@link Updateable.update} */
    update(): void;
    private findIntersection;
    private updateMarker;
    get(): Vector3 | null;
}
export {};
