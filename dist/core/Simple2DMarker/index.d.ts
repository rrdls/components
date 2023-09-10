import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { Hideable, Disposable } from "../../base-types";
import { Component } from "../../base-types/component";
import { Components } from "../Components";
export declare class Simple2DMarker extends Component<CSS2DObject> implements Hideable, Disposable {
    name: string;
    enabled: boolean;
    private _visible;
    private _components;
    private _marker;
    set visible(value: boolean);
    get visible(): boolean;
    constructor(components: Components, marker?: HTMLElement);
    toggleVisibility(): void;
    dispose(): void;
    get(): CSS2DObject;
}
