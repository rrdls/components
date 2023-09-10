import * as THREE from "three";
import { Createable, Disposable, Event, UI } from "../../base-types/base-types";
import { Component } from "../../base-types/component";
import { Components } from "../../core/Components";
import { Button } from "../../ui/ButtonComponent";
import { AreaMeasureElement } from "../AreaMeasureElement";
export declare class AreaMeasurement extends Component<AreaMeasureElement[]> implements Createable, UI, Disposable {
    name: string;
    uiElement: {
        main: Button;
    };
    private _components;
    private _enabled;
    private _vertexPicker;
    private _currentAreaElement;
    private _clickCount;
    private _measurements;
    readonly beforeCreate: Event<any>;
    readonly afterCreate: Event<AreaMeasureElement>;
    readonly beforeCancel: Event<any>;
    readonly afterCancel: Event<any>;
    readonly beforeDelete: Event<any>;
    readonly afterDelete: Event<any>;
    set enabled(value: boolean);
    get enabled(): boolean;
    set workingPlane(plane: THREE.Plane | null);
    get workingPlane(): THREE.Plane | null;
    constructor(components: Components);
    dispose(): void;
    private setUI;
    create: () => void;
    delete(): void;
    endCreation(): void;
    cancelCreation(): void;
    get(): AreaMeasureElement[];
    private setupEvents;
    private onMouseMove;
    private onKeydown;
}
