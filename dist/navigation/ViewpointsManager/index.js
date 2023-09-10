import { Vector3 } from "three";
import { generateUUID } from "three/src/math/MathUtils";
import { SimpleDimensionLine, } from "../../measurement/LengthMeasurement";
import { Component, Event } from "../../base-types";
import { Button, SimpleUICard, FloatingWindow } from "../../ui";
export class ViewpointsManager extends Component {
    constructor(components, config) {
        super();
        this.name = "ViewpointsManager";
        this.enabled = true;
        this.list = [];
        this.onViewpointViewed = new Event();
        this.onViewpointAdded = new Event();
        this._components = components;
        this.selectionHighlighter = config.selectionHighlighter;
        // this._fragmentGrouper = config.fragmentGrouper;
        this._fragmentHighlighter = config.fragmentHighlighter;
        // this._fragmentManager = config.fragmentManager;
        this._drawManager = config.drawManager;
        this.uiElement = this.setUI();
    }
    setUI() {
        const viewerContainer = this._components.renderer.get().domElement
            .parentElement;
        const window = new FloatingWindow(this._components);
        window.title = "Viewpoints";
        viewerContainer.append(window.get());
        window.visible = false;
        const main = new Button(this._components, {
            materialIconName: "photo_camera",
        });
        const newButton = new Button(this._components, {
            materialIconName: "add",
            name: "New viewpoint",
        });
        const listButton = new Button(this._components, {
            materialIconName: "format_list_bulleted",
            name: "Viewpoints list",
        });
        listButton.onclick = () => {
            window.visible = !window.visible;
        };
        main.addChild(listButton, newButton);
        return { main, newButton, window };
    }
    get() {
        throw new Error("Method not implemented.");
    }
    add(data) {
        var _a;
        const { title, description } = data;
        if (!title) {
            return undefined;
        }
        const guid = generateUUID().toLowerCase();
        // #region Store dimensions
        const dimensions = [];
        const dimensionsComponent = this._components.tools.get("LengthMeasurement");
        if (dimensionsComponent) {
            dimensionsComponent.get().forEach((dimension) => {
                dimensions.push({ start: dimension.start, end: dimension.end });
            });
        }
        // #endregion
        // #redgion Store selection
        const selection = this._fragmentHighlighter.selection[this.selectionHighlighter];
        // #endregion
        // #region Store filter (WIP)
        // const filter = {entities: "IFCBEAM", storeys: "N07"}
        // #endregion
        // #region Store camera position and target
        const camera = this._components.camera;
        const controls = camera.controls;
        const target = new Vector3();
        const position = new Vector3();
        controls.getTarget(target);
        controls.getPosition(position);
        const projection = camera.getProjection();
        // #endregion
        // #region Store annotations
        const annotations = (_a = this._drawManager) === null || _a === void 0 ? void 0 : _a.saveDrawing(guid);
        // #endregion
        const viewpoint = {
            guid,
            title,
            target,
            position,
            selection,
            // filter,
            description,
            dimensions,
            annotations,
            projection,
        };
        // #region UI representation
        const card = new SimpleUICard(this._components, viewpoint.guid);
        card.title = title;
        card.description = description;
        card.domElement.onclick = () => this.view(viewpoint.guid);
        this.uiElement.window.addChild(card);
        // #endregion
        this.list.push(viewpoint);
        this.onViewpointAdded.trigger(guid);
        return viewpoint;
    }
    retrieve(guid) {
        return this.list.find((v) => v.guid === guid);
    }
    view(guid) {
        const viewpoint = this.retrieve(guid);
        if (!viewpoint) {
            return;
        }
        // #region Recover annotations
        if (this._drawManager && viewpoint.annotations) {
            this._drawManager.viewport.clear();
            this._drawManager.enabled = true;
            this._drawManager.viewport.get().append(viewpoint.annotations);
        }
        // #endregion
        // #region Recover dimensions
        const dimensionsComponent = this._components.tools.get("LengthMeasurement");
        if (dimensionsComponent) {
            viewpoint.dimensions.forEach((data) => {
                const dimension = new SimpleDimensionLine(this._components, {
                    start: data.start,
                    end: data.end,
                    // @ts-ignore
                    lineMaterial: dimensionsComponent._lineMaterial,
                    // @ts-ignore
                    endpoint: dimensionsComponent._endpointMesh,
                });
                dimension.createBoundingBox();
                // @ts-ignore
                dimensionsComponent._dimensions.push(dimension);
            });
        }
        // #endregion
        // #region Recover filtered elements
        // if (viewpoint.filter) {
        //     const filterData = fragments.groups.get(viewpoint.filter)
        //     for (const fragmentID in fragments.list) {
        //         const fragment = fragments.list[fragmentID]
        //         fragment.setVisibility(fragment.items, false)
        //     }
        //     for (const fragmentID in filterData) {
        //         const ids = filterData[fragmentID]
        //         fragments.list[fragmentID]?.setVisibility(ids, true)
        //     }
        // }
        // #endregion
        // Select elements in the viewpoint
        const selection = {};
        for (const fragmentID in viewpoint.selection) {
            selection[fragmentID] = viewpoint.selection[fragmentID];
        }
        this._fragmentHighlighter.highlightByID(this.selectionHighlighter, selection, true);
        // #region Recover camera position & target
        const camera = this._components.camera;
        const controls = camera.controls;
        controls.setLookAt(viewpoint.position.x, viewpoint.position.y, viewpoint.position.z, viewpoint.target.x, viewpoint.target.y, viewpoint.target.z, true);
        this.onViewpointViewed.trigger(guid);
        // #endregion
    }
}
//# sourceMappingURL=index.js.map