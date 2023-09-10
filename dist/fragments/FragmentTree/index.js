import { Component, Event, } from "../../base-types";
import { FragmentTreeItem } from "./src/tree-item";
import { Button, FloatingWindow } from "../../ui";
export class FragmentTree extends Component {
    constructor(components, classifier) {
        super();
        this.name = "FragmentTree";
        this.title = "Model Tree";
        this.enabled = true;
        this.selected = new Event();
        this.hovered = new Event();
        this._components = components;
        this._classifier = classifier;
        this._tree = new FragmentTreeItem(this._components, classifier, this.title);
        const window = new FloatingWindow(components);
        window.addChild(this._tree.uiElement.tree);
        window.title = "Model tree";
        components.ui.add(window);
        window.visible = false;
        const main = new Button(components);
        main.materialIcon = "account_tree";
        main.tooltip = "Model tree";
        main.onclick = () => {
            window.visible = !window.visible;
        };
        this.uiElement = { main, window };
    }
    get() {
        return this._tree;
    }
    dispose() {
        this.selected.reset();
        this.hovered.reset();
        this._tree.dispose();
        this._components = null;
        this._classifier = null;
    }
    update(groupSystems) {
        if (this._tree.children.length) {
            this._tree.dispose();
            this._tree = new FragmentTreeItem(this._components, this._classifier, this.title);
        }
        this._tree.children = this.regenerate(groupSystems);
        return this.get();
    }
    regenerate(groupSystemNames, result = {}) {
        const groups = [];
        const currentSystemName = groupSystemNames[0]; // storeys
        const systems = this._classifier.get();
        const systemGroups = systems[currentSystemName];
        if (!currentSystemName || !systemGroups) {
            return groups;
        }
        for (const name in systemGroups) {
            // name is N00, N01, N02...
            // { storeys: "N00" }, { storeys: "N01" }...
            const filter = { ...result, [currentSystemName]: [name] };
            const found = this._classifier.find(filter);
            const hasElements = Object.keys(found).length > 0;
            if (hasElements) {
                const firstLetter = currentSystemName[0].toUpperCase();
                const treeItemName = firstLetter + currentSystemName.slice(1); // Storeys
                const treeItem = new FragmentTreeItem(this._components, this._classifier, `${treeItemName}: ${name}`);
                treeItem.hovered.on((result) => this.hovered.trigger(result));
                treeItem.selected.on((result) => this.selected.trigger(result));
                treeItem.filter = filter;
                groups.push(treeItem);
                treeItem.children = this.regenerate(groupSystemNames.slice(1), filter);
            }
        }
        return groups;
    }
}
//# sourceMappingURL=index.js.map