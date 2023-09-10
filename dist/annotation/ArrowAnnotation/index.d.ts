import { BaseSVGAnnotation } from "../../base-types";
import { Components } from "../../core";
import { Button } from "../../ui";
import { SVGArrow } from "../SVGArrow";
import { DrawManager } from "../DrawManager";
export declare class ArrowAnnotation extends BaseSVGAnnotation {
    name: string;
    canvas: HTMLCanvasElement | null;
    uiElement: {
        main: Button;
    };
    private _previewElement;
    constructor(components: Components, drawManager?: DrawManager);
    dispose(): void;
    cancel: () => void;
    start: (event: MouseEvent) => SVGArrow | undefined;
    draw: (e: MouseEvent) => void;
}
