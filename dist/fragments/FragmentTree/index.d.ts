import { Component, Disposable, Event, FragmentIdMap, UI } from "../../base-types";
import { FragmentTreeItem } from "./src/tree-item";
import { Components } from "../../core";
import { FragmentClassifier } from "../FragmentClassifier";
import { Button, FloatingWindow } from "../../ui";
export declare class FragmentTree extends Component<FragmentTreeItem> implements UI, Disposable {
    name: string;
    title: string;
    enabled: boolean;
    selected: Event<FragmentIdMap>;
    hovered: Event<FragmentIdMap>;
    private _components;
    private _classifier;
    private _tree;
    uiElement: {
        main: Button;
        window: FloatingWindow;
    };
    constructor(components: Components, classifier: FragmentClassifier);
    get(): FragmentTreeItem;
    dispose(): void;
    update(groupSystems: string[]): FragmentTreeItem;
    private regenerate;
}
