import { Component, Event } from "../../../base-types";
import { TreeView } from "../../../ui/TreeView";
import { Button } from "../../../ui/ButtonComponent";
export class FragmentTreeItem extends Component {
    get children() {
        return this._children;
    }
    set children(children) {
        this._children = children;
        children.forEach((child) => this.uiElement.tree.addChild(child.uiElement.tree));
    }
    constructor(components, classifier, content) {
        super();
        this.name = "FragmentTreeItem";
        this.enabled = true;
        this.filter = {};
        this.selected = new Event();
        this.hovered = new Event();
        this._children = [];
        this._components = components;
        this.uiElement = {
            main: new Button(components),
            tree: new TreeView(components, content),
        };
        this.uiElement.tree.onclick = () => {
            const found = classifier.find(this.filter);
            this.selected.trigger(found);
        };
        this.uiElement.tree.get().onmouseenter = () => {
            const found = classifier.find(this.filter);
            this.hovered.trigger(found);
        };
    }
    dispose() {
        this.uiElement.main.dispose();
        this.uiElement.tree.dispose();
        this.selected.reset();
        this.hovered.reset();
        for (const child of this.children) {
            child.dispose();
        }
        this._components = null;
    }
    get() {
        return { name: this.name, filter: this.filter, children: this.children };
    }
}
//# sourceMappingURL=tree-item.js.map