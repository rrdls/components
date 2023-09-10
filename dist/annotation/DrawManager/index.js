import { Component } from "../../base-types";
import { SimpleSVGViewport } from "../../core";
import { Button, Toolbar } from "../../ui";
export class DrawManager extends Component {
    get isDrawing() {
        return this._isDrawing;
    }
    set isDrawing(value) {
        this._isDrawing = value;
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = value;
        this.uiElement.main.active = value;
        this.uiElement.drawingTools.visible = value;
        this.viewport.enabled = value;
    }
    constructor(components) {
        super();
        this.name = "DrawManager";
        this.drawingTools = {};
        this.drawings = {};
        this._enabled = false;
        this._isDrawing = false;
        this._components = components;
        this.viewport = new SimpleSVGViewport(components);
        this.setUI();
        this.enabled = false;
    }
    dispose() {
        this.uiElement.main.dispose();
        this.uiElement.drawingTools.dispose();
        this.viewport.dispose();
        for (const name in this.drawings) {
            this.drawings[name].remove();
        }
        this.drawings = {};
        this._components = null;
    }
    saveDrawing(name) {
        const currentDrawing = this.drawings[name];
        currentDrawing === null || currentDrawing === void 0 ? void 0 : currentDrawing.childNodes.forEach((child) => currentDrawing.removeChild(child));
        const drawing = this.viewport.getDrawing();
        const group = currentDrawing !== null && currentDrawing !== void 0 ? currentDrawing : document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = name;
        group.append(...drawing);
        this.viewport.get().append(group);
        this.drawings[name] = group;
        return group;
    }
    addDrawingTool(name, tool) {
        const existingTool = this.drawingTools[name];
        if (!existingTool) {
            this.uiElement.drawingTools.addChild(tool.uiElement.main);
            this.drawingTools[name] = tool;
        }
    }
    activateTool(tool) {
        const drawingTools = Object.values(this.drawingTools);
        drawingTools.forEach((tool) => (tool.enabled = false));
        tool.enabled = true;
    }
    get activeTool() {
        const drawingTools = Object.values(this.drawingTools);
        return drawingTools.find((tool) => tool.enabled === true);
    }
    setUI() {
        const drawingTools = new Toolbar(this._components, { position: "top" });
        this._components.ui.addToolbar(drawingTools);
        const main = new Button(this._components);
        main.materialIcon = "gesture";
        main.onclick = () => (this.enabled = !this.enabled);
        this.uiElement = { drawingTools, main };
    }
    get() {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=index.js.map