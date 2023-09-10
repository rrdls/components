import { Component, Disposable, Event } from "../../base-types";
type ToolsList = Map<symbol | string, Component<any>>;
/**
 * An object to easily handle all the tools used (e.g. updating them, retrieving
 * them, performing batch operations, etc). A tool is a feature that achieves
 * something through user interaction (e.g. clipping planes, dimensions, etc).
 */
export declare class ToolComponent extends Component<ToolsList | Component<any> | null> implements Disposable {
    list: ToolsList;
    onToolAdded: Event<Component<any>>;
    onToolRemoved: Event<null>;
    private _reader;
    /** {@link Component.name} */
    name: string;
    /** {@link Component.enabled} */
    enabled: boolean;
    private _urls;
    /**
     * Registers a new tool component in the application instance.
     * @param id - Unique ID to register the tool in the application.
     * @param tool - The tool to register.
     */
    add(id: symbol | string, tool: Component<any>): void;
    /**
     * Deletes a previously registered tool component.
     * @param id - The registered ID of the tool to be delete.
     */
    remove(id: symbol | string): void;
    /**
     * Retrieves a tool component by its registered id.
     * @param id - The id of the registered tool.
     */
    get<T extends Component<any>>(id: symbol | string): T;
    /**
     * Gets one of your tools of That Open Platform. You can pass the type of
     * component as the generic parameter T to get the types and intellisense
     * for the component.
     * @param token The authentication token to authorise this request.
     * @param id The ID of the tool you want to get
     * @param OBC The whole components library (import * as OBC from "openbim-components")
     */
    use<T>(token: string, id: string, OBC: any): Promise<new (...args: any) => T>;
    /**
     * Updates all the registered tool components. Only the components where the
     * property {@link Component.enabled} is true will be updated.
     * @param delta - The
     * [delta time](https://threejs.org/docs/#api/en/core/Clock) of the loop.
     */
    update(delta: number): void;
    /**
     * Disposes all the memory used by all the tools.
     */
    dispose(): void;
}
export {};
