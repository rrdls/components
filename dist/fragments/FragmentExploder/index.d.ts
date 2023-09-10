import { Component, Disposable, UI } from "../../base-types";
import { FragmentClassifier, FragmentManager } from "../index";
import { Button } from "../../ui";
import { Components } from "../../core";
export declare class FragmentExploder extends Component<Set<string>> implements Disposable, UI {
    name: string;
    height: number;
    groupName: string;
    enabled: boolean;
    uiElement: {
        main: Button;
    };
    private _explodedFragments;
    private _fragments;
    private _groups;
    get(): Set<string>;
    constructor(components: Components, fragments: FragmentManager, groups: FragmentClassifier);
    dispose(): void;
    explode(): void;
    reset(): void;
    update(): void;
}
