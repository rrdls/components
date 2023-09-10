import { BaseSVGAnnotation } from "../../base-types";
import { Components } from "../../core";
import { Button } from "../../ui";
import { DrawManager } from "../DrawManager";
import { SVGCircle } from "../SVGCircle";
export declare class CircleAnnotation extends BaseSVGAnnotation {
    name: string;
    canvas: HTMLCanvasElement | null;
    uiElement: {
        main: Button;
    };
    private _previewElement;
    private _cursorPosition;
    constructor(components: Components, drawManager?: DrawManager);
    dispose(): void;
    start: (e: MouseEvent) => SVGCircle | undefined;
    cancel: () => void;
    draw: (e: MouseEvent) => void;
}
