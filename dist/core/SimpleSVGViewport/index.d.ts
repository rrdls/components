import { Vector2 } from "three";
import { Component, SVGAnnotationStyle } from "../../base-types";
import { FloatingWindow } from "../../ui/FloatingWindow";
import { Toolbar } from "../../ui/ToolbarComponent";
import { Components } from "../Components";
export interface SVGViewportConfig extends SVGAnnotationStyle {
}
export declare class SimpleSVGViewport extends Component<SVGElement> {
    name: string;
    uiElement: {
        toolbar: Toolbar;
        settingsWindow: FloatingWindow;
    };
    id: string;
    private _config;
    private _enabled;
    private _viewport;
    private _components;
    private _size;
    private _undoList;
    get enabled(): boolean;
    set enabled(value: boolean);
    set config(value: Partial<SVGViewportConfig>);
    get config(): Partial<SVGViewportConfig>;
    constructor(components: Components, config?: SVGViewportConfig);
    dispose(): void;
    get(): SVGElement;
    clear(): void;
    getDrawing(): NodeListOf<ChildNode>;
    /** {@link Resizeable.resize}. */
    resize(): void;
    /** {@link Resizeable.getSize}. */
    getSize(): Vector2;
    private setupEvents;
    private onResize;
    private setUI;
}
