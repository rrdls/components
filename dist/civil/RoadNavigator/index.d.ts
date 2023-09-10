import { Components } from "../../core";
export declare class RoadNavigator {
    private _components;
    private _lines;
    private _defaultID;
    constructor(components: Components);
    drawPoint(): void;
    select(): void;
    delete(): void;
    cache(id?: string): void;
    loadCached(id?: string): void;
}
