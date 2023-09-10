import { Component, Disposable, UI, Event } from "../../base-types";
import { Button, FloatingWindow, SimpleUICard } from "../../ui";
import { Components } from "../Components";
export declare class LocalCacher extends Component<any> implements UI, Disposable {
    name: string;
    enabled: boolean;
    fileLoaded: Event<{
        id: string;
    }>;
    itemSaved: Event<{
        id: string;
    }>;
    protected _components: Components;
    protected _cards: SimpleUICard[];
    private _db;
    private readonly _storedModels;
    uiElement: {
        main: Button;
        saveButton: Button;
        loadButton: Button;
    };
    floatingMenu: FloatingWindow;
    get ids(): string[];
    constructor(components: Components);
    get(id: string): Promise<Blob | null>;
    save(id: string, url: string): Promise<void>;
    exists(id: string): boolean;
    delete(ids: string[]): Promise<void>;
    deleteAll(): Promise<void>;
    dispose(): void;
    private getModelFromLocalCache;
    private clearStoredIDs;
    private removeStoredID;
    private addStoredID;
    private setStoredIDs;
}
