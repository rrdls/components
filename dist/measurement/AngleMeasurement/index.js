import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Event, Component } from "../../base-types";
import { Button } from "../../ui";
import { VertexPicker } from "../../utils";
import { AngleMeasureElement } from "../AngleMeasureElement";
export class AngleMeasurement extends Component {
    set lineMaterial(material) {
        this._lineMaterial.dispose();
        this._lineMaterial = material;
        this._lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    }
    get lineMaterial() {
        return this._lineMaterial;
    }
    set enabled(value) {
        this._enabled = value;
        this.setupEvents(value);
        this._vertexPicker.enabled = value;
        this.uiElement.main.active = value;
        if (!value)
            this.cancelCreation();
    }
    get enabled() {
        return this._enabled;
    }
    set workingPlane(plane) {
        this._vertexPicker.workingPlane = plane;
    }
    get workingPlane() {
        return this._vertexPicker.workingPlane;
    }
    constructor(components) {
        super();
        this.name = "AngleMeasurement";
        this._enabled = false;
        this._currentAngleElement = null;
        this._clickCount = 0;
        this._measurements = [];
        this.beforeCreate = new Event();
        this.afterCreate = new Event();
        this.beforeCancel = new Event();
        this.afterCancel = new Event();
        this.beforeDelete = new Event();
        this.afterDelete = new Event();
        this.create = () => {
            if (!this.enabled)
                return;
            const point = this._vertexPicker.get();
            if (!point)
                return;
            if (!this._currentAngleElement) {
                const angleElement = new AngleMeasureElement(this._components);
                angleElement.lineMaterial = this.lineMaterial;
                // angleElement.onPointRemoved.on(() => this._clickCount--);
                this._currentAngleElement = angleElement;
            }
            this._currentAngleElement.setPoint(point, this._clickCount);
            this._currentAngleElement.setPoint(point, (this._clickCount + 1));
            this._currentAngleElement.setPoint(point, (this._clickCount + 2));
            this._currentAngleElement.computeAngle();
            this._clickCount++;
            if (this._clickCount === 3)
                this.endCreation();
        };
        this.onMouseMove = () => {
            const point = this._vertexPicker.get();
            if (!(point && this._currentAngleElement))
                return;
            this._currentAngleElement.setPoint(point, this._clickCount);
            this._currentAngleElement.computeAngle();
        };
        this.onKeyDown = (e) => {
            if (!this.enabled)
                return;
            if (e.key === "z" && e.ctrlKey && this._currentAngleElement) {
                // this._currentAngleElement.removePoint(this._clickCount - 1);
            }
            if (e.key === "Escape") {
                if (this._clickCount === 0 && !this._currentAngleElement) {
                    this.enabled = false;
                }
                else {
                    this.cancelCreation();
                }
            }
        };
        this._components = components;
        this._lineMaterial = new LineMaterial({
            color: 0x6528d7,
            linewidth: 2,
        });
        this._vertexPicker = new VertexPicker(components);
        this.uiElement = { main: new Button(components) };
        this.uiElement.main.materialIcon = "square_foot";
        this.enabled = false;
        this.setUI();
    }
    dispose() {
        this.setupEvents(false);
        this.beforeCreate.reset();
        this.afterCreate.reset();
        this.beforeCancel.reset();
        this.afterCancel.reset();
        this.beforeDelete.reset();
        this.afterDelete.reset();
        this.uiElement.main.dispose();
        this._lineMaterial.dispose();
        this._vertexPicker.dispose();
        for (const measure of this._measurements) {
            measure.dispose();
        }
        if (this._currentAngleElement) {
            this._currentAngleElement.dispose();
        }
        this._components = null;
    }
    setUI() {
        this.uiElement.main.onclick = () => {
            if (!this.enabled) {
                this.uiElement.main.active = true;
                this.enabled = true;
            }
            else {
                this.enabled = false;
                this.uiElement.main.active = false;
            }
        };
    }
    delete() { }
    endCreation() {
        if (this._currentAngleElement) {
            this._measurements.push(this._currentAngleElement);
            this._currentAngleElement.computeAngle();
            this._currentAngleElement = null;
        }
        this._clickCount = 0;
    }
    cancelCreation() {
        if (this._currentAngleElement) {
            this._currentAngleElement.dispose();
            this._currentAngleElement = null;
        }
        this._clickCount = 0;
    }
    get() {
        return this._measurements;
    }
    setupEvents(active) {
        const viewerContainer = this._components.ui.viewerContainer;
        if (active) {
            viewerContainer.addEventListener("click", this.create);
            viewerContainer.addEventListener("mousemove", this.onMouseMove);
            window.addEventListener("keydown", this.onKeyDown);
        }
        else {
            this.uiElement.main.active = false;
            viewerContainer.removeEventListener("click", this.create);
            viewerContainer.removeEventListener("mousemove", this.onMouseMove);
            window.removeEventListener("keydown", this.onKeyDown);
        }
    }
}
//# sourceMappingURL=index.js.map