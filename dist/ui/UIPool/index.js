import { Component } from "../../base-types/component";
export class UIPool extends Component {
    constructor(components, uiClass) {
        super();
        this.name = "UIPool";
        this.enabled = true;
        this.list = [];
        this._components = components;
        this._uiClass = uiClass;
    }
    return(element) {
        if (element.parent) {
            element.parent.removeChild(element);
        }
        this.list.push(element);
    }
    get() {
        if (this.list.length > 0) {
            return this.list.pop();
        }
        return new this._uiClass(this._components);
    }
}
//# sourceMappingURL=index.js.map