import { Component, UI, Event, FragmentIdMap } from "../../../base-types";
import { TreeView } from "../../../ui/TreeView";
import { Components } from "../../../core";
import { FragmentClassifier } from "../../FragmentClassifier";
import { Button } from "../../../ui/ButtonComponent";
interface TreeItem {
    name: string;
    filter: {
        [groupSystemName: string]: string[];
    };
    children: TreeItem[];
}
export declare class FragmentTreeItem extends Component<TreeItem> implements UI {
    name: string;
    enabled: boolean;
    filter: {
        [name: string]: string[];
    };
    uiElement: {
        main: Button;
        tree: TreeView;
    };
    selected: Event<FragmentIdMap>;
    hovered: Event<FragmentIdMap>;
    private _components;
    private _children;
    get children(): FragmentTreeItem[];
    set children(children: FragmentTreeItem[]);
    constructor(components: Components, classifier: FragmentClassifier, content: string);
    dispose(): void;
    get(): TreeItem;
}
export {};
