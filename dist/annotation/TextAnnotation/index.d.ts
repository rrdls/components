import { BaseSVGAnnotation, UI } from "../../base-types";
import { Components } from "../../core";
import { Button } from "../../ui";
import { DrawManager } from "../DrawManager";
import { SVGText } from "../SVGText";
export declare class TextAnnotation extends BaseSVGAnnotation implements UI {
    name: string;
    uiElement: {
        main: Button;
    };
    canvas: HTMLCanvasElement | null;
    private _previewElement;
    constructor(components: Components, drawManager?: DrawManager);
    dispose(): void;
    cancel: () => void;
    start: (e: MouseEvent) => SVGText | undefined;
    draw: (e: MouseEvent) => void;
}
