import { BaseSVGAnnotation } from "../../base-types";
import { Components } from "../../core";
import { Button } from "../../ui";
import { DrawManager } from "../DrawManager";
import { SVGRectangle } from "../SVGRectangle";
export declare class RectangleAnnotation extends BaseSVGAnnotation {
    name: string;
    canvas: HTMLCanvasElement | null;
    uiElement: {
        main: Button;
    };
    private _previewElement;
    private _startPoint;
    constructor(components: Components, drawManager?: DrawManager);
    dispose(): void;
    start: (e: MouseEvent) => SVGRectangle | undefined;
    cancel: () => void;
    draw: (e: MouseEvent) => void;
}
