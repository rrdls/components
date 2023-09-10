import { EdgesClipper } from "../../navigation";
import { FragmentManager } from "../FragmentManager";
import { Component, Disposable, UI } from "../../base-types";
import { Button, ColorInput, FloatingWindow, RangeInput, SimpleUIComponent, TextInput } from "../../ui";
import { Components } from "../../core";
import { FragmentClassifier } from "../FragmentClassifier";
export interface ClipStyleCardData {
    name: string;
    fillColor: string;
    lineColor: string;
    lineThickness: number;
    categories: string;
}
export declare class FragmentClipStyler extends Component<ClipStyleCardData[]> implements UI, Disposable {
    name: string;
    enabled: boolean;
    _fragments: FragmentManager;
    _clipper: EdgesClipper;
    _components: Components;
    _classifier: FragmentClassifier;
    _localStorageID: string;
    _styleCards: {
        [id: string]: {
            styleCard: SimpleUIComponent<any>;
            name: TextInput;
            lineThickness: RangeInput;
            categories: TextInput;
            deleteButton: Button;
            lineColor: ColorInput;
            fillColor: ColorInput;
        };
    };
    uiElement: {
        mainButton: Button;
        mainWindow: FloatingWindow;
    };
    private _defaultStyles;
    constructor(components: Components, fragments: FragmentManager, classifier: FragmentClassifier, clipper: EdgesClipper);
    setup(force?: boolean): void;
    get(): ClipStyleCardData[];
    dispose(): void;
    update(ids?: string[]): void;
    private loadCachedStyles;
    private cacheStyles;
    private deleteStyleCard;
    private createStyleCard;
}
