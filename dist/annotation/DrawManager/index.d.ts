import { Component, UI, BaseSVGAnnotation, Disposable } from "../../base-types";
import { Components, SimpleSVGViewport } from "../../core";
import { Button, Toolbar } from "../../ui";
export declare class DrawManager extends Component<string> implements UI, Disposable {
    name: string;
    uiElement: {
        main: Button;
        drawingTools: Toolbar;
    };
    viewport: SimpleSVGViewport;
    drawingTools: {
        [name: string]: BaseSVGAnnotation;
    };
    drawings: {
        [name: string]: SVGGElement;
    };
    private _enabled;
    private _isDrawing;
    private _components;
    get isDrawing(): boolean;
    set isDrawing(value: boolean);
    get enabled(): boolean;
    set enabled(value: boolean);
    constructor(components: Components);
    dispose(): void;
    saveDrawing(name: string): SVGGElement;
    addDrawingTool(name: string, tool: BaseSVGAnnotation): void;
    activateTool(tool: BaseSVGAnnotation): void;
    get activeTool(): BaseSVGAnnotation | undefined;
    private setUI;
    get(): string;
}
