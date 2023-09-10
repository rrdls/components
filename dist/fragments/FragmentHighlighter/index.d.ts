import * as THREE from "three";
import { Fragment } from "bim-fragment";
import { Component, Disposable, Event, FragmentIdMap } from "../../base-types";
import { FragmentManager } from "../FragmentManager";
import { Components } from "../../core";
interface HighlightEvents {
    [highlighterName: string]: {
        onHighlight: Event<FragmentIdMap>;
        onClear: Event<null>;
    };
}
interface HighlightMaterials {
    [name: string]: THREE.Material[] | undefined;
}
export declare class FragmentHighlighter extends Component<HighlightMaterials> implements Disposable {
    name: string;
    enabled: boolean;
    highlightMats: HighlightMaterials;
    events: HighlightEvents;
    multiple: "none" | "shiftKey" | "ctrlKey";
    zoomFactor: number;
    zoomToSelection: boolean;
    selection: {
        [selectionID: string]: FragmentIdMap;
    };
    excludeOutline: Set<string>;
    outlineMaterial: THREE.MeshBasicMaterial;
    private _eventsActive;
    private _fillEnabled;
    private _outlineEnabled;
    private _outlinedMeshes;
    private _invisibleMaterial;
    private _tempMatrix;
    private _components;
    private _fragments;
    private _bbox;
    private _default;
    get fillEnabled(): boolean;
    set fillEnabled(value: boolean);
    get outlineEnabled(): boolean;
    set outlineEnabled(value: boolean);
    private get _postproduction();
    constructor(components: Components, fragments: FragmentManager);
    get(): HighlightMaterials;
    dispose(): void;
    add(name: string, material?: THREE.Material[]): void;
    update(): void;
    highlight(name: string, removePrevious?: boolean, zoomToSelection?: boolean): {
        id: string;
        fragments: Fragment[];
    } | null;
    highlightByID(name: string, ids: FragmentIdMap, removePrevious?: boolean, zoomToSelection?: boolean): void;
    /**
     * Clears any selection previously made by calling {@link highlight}.
     */
    clear(name?: string): void;
    setup(): void;
    private regenerate;
    private zoomSelection;
    private addComposites;
    private clearStyle;
    private updateFragmentFill;
    private checkSelection;
    private addHighlightToFragment;
    private clearFills;
    private clearOutlines;
    private updateFragmentOutline;
    private setupEvents;
    private onMouseDown;
    private onMouseUp;
    private onMouseMove;
}
export {};
