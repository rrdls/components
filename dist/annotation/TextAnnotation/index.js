import { BaseSVGAnnotation } from "../../base-types";
import { Button } from "../../ui";
import { SVGText } from "../SVGText";
export class TextAnnotation extends BaseSVGAnnotation {
    constructor(components, drawManager) {
        super();
        this.name = "TextAnnotation";
        this.canvas = null;
        this.cancel = () => {
            if (!this._isDrawing) {
                return;
            }
            this._isDrawing = false;
            this._previewElement.reset();
            this._previewElement.get().remove();
        };
        this.start = (e) => {
            var _a, _b, _c, _d;
            if (!this.canDraw) {
                return undefined;
            }
            if (!this._isDrawing) {
                this._isDrawing = true;
                const text = prompt("Enter your text", this._previewElement.text);
                if (!text) {
                    this.cancel();
                    return undefined;
                }
                this._previewElement.setStyle((_a = this.drawManager) === null || _a === void 0 ? void 0 : _a.viewport.config);
                this._previewElement.text = text;
                this._previewElement.x = e.clientX;
                this._previewElement.y = e.clientY;
                (_b = this.svgViewport) === null || _b === void 0 ? void 0 : _b.append(this._previewElement.get());
            }
            else {
                const text = this._previewElement.clone();
                text.setStyle((_c = this.drawManager) === null || _c === void 0 ? void 0 : _c.viewport.config);
                (_d = this.svgViewport) === null || _d === void 0 ? void 0 : _d.append(text.get());
                this.cancel();
                return text;
            }
            return undefined;
        };
        this.draw = (e) => {
            if (!this.canDraw || !this._isDrawing) {
                return;
            }
            this._previewElement.x = e.clientX;
            this._previewElement.y = e.clientY;
        };
        this._previewElement = new SVGText(components);
        this.drawManager = drawManager;
        this.uiElement = { main: new Button(components) };
        this.uiElement.main.label = "Text";
        this.uiElement.main.materialIcon = "title";
        this.uiElement.main.onclick = () => {
            if (this.drawManager) {
                this.drawManager.activateTool(this);
            }
            else {
                this.enabled = !this.enabled;
            }
        };
    }
    dispose() {
        super.dispose();
        this._previewElement.dispose();
    }
}
//# sourceMappingURL=index.js.map