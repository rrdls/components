import { Component } from "./component";
import { tooeenRandomId } from "../utils";
export class BaseSVGAnnotation extends Component {
    constructor() {
        super(...arguments);
        this.id = tooeenRandomId();
        this._enabled = false;
        this._isDrawing = false;
        this._svgViewport = null;
        this.start = (_event) => { };
        this.draw = (_event) => { };
        this.end = (_event) => { };
        this.cancel = (event) => {
            if (event) {
                event.stopImmediatePropagation();
                if (event.key === "Escape") {
                    this.cancel(event);
                }
            }
        };
    }
    set svgViewport(value) {
        this._svgViewport = value;
    }
    get svgViewport() {
        var _a;
        return (_a = this._svgViewport) !== null && _a !== void 0 ? _a : undefined;
    }
    set enabled(value) {
        if (!this._svgViewport) {
            this.uiElement.main.active = false;
            this._enabled = false;
            return;
        }
        if (value === this._enabled)
            return;
        this._enabled = value;
        this.uiElement.main.active = value;
        this.setupEvents(value);
    }
    get enabled() {
        return this._enabled;
    }
    get canDraw() {
        return this.enabled && this._svgViewport;
    }
    set drawManager(manager) {
        this._drawManager = manager;
        if (manager) {
            manager.addDrawingTool(this.name, this);
            manager.uiElement.drawingTools.addChild(this.uiElement.main);
            this.svgViewport = manager.viewport.get();
        }
        else {
            this.svgViewport = null;
        }
    }
    get drawManager() {
        return this._drawManager;
    }
    get() {
        return null;
    }
    dispose() {
        if (this._drawManager) {
            this._drawManager.dispose();
        }
        if (this._svgViewport) {
            this._svgViewport.remove();
        }
        this.setupEvents(false);
        this.uiElement.main.dispose();
        if (this.svgViewport) {
            this.svgViewport.remove();
        }
    }
    setupEvents(active) {
        if (active) {
            document.addEventListener("keydown", this.cancel);
            if (!this._svgViewport)
                return;
            this._svgViewport.addEventListener("mousemove", this.draw);
            this._svgViewport.addEventListener("mousedown", this.start);
            this._svgViewport.addEventListener("mouseup", this.end);
        }
        else {
            document.removeEventListener("keydown", this.cancel);
            if (!this._svgViewport)
                return;
            this._svgViewport.removeEventListener("mousemove", this.draw);
            this._svgViewport.removeEventListener("mousedown", this.start);
            this._svgViewport.removeEventListener("mouseup", this.end);
        }
    }
}
//# sourceMappingURL=base-svg-annotation.js.map