import { FragmentManager } from "../FragmentManager";
import { Components, ScreenCuller } from "../../core";
import { Component, Disposable, FragmentIdMap, UI } from "../../base-types";
import { Button, FloatingWindow } from "../../ui";
export declare class FragmentHider extends Component<void> implements Disposable, UI {
    name: string;
    enabled: boolean;
    uiElement: {
        main: Button;
        window: FloatingWindow;
    };
    private _localStorageID;
    private _components;
    private _fragments;
    private _culler?;
    private _updateVisibilityOnFound;
    private _filterCards;
    constructor(components: Components, fragments: FragmentManager, culler?: ScreenCuller, loadCached?: boolean);
    dispose(): void;
    set(visible: boolean, items?: FragmentIdMap): void;
    isolate(items: FragmentIdMap): void;
    get(): void;
    update(): void;
    private updateCulledVisibility;
    private createStyleCard;
    private updateQueries;
    private deleteStyleCard;
    private hideAllFinders;
    private loadCached;
    private cache;
}
