import * as THREE from "three";
import * as WEBIFC from "web-ifc";
import { Component, Event } from "../../base-types";
import { EdgesPlane, } from "../../navigation";
import { IfcPropertiesUtils } from "../../ifc/IfcPropertiesUtils";
import { PlanObjects } from "./src/plan-objects";
import { Button, FloatingWindow, SimpleUICard, SimpleUIComponent, Toolbar, CommandsMenu, } from "../../ui";
/**
 * Helper to control the camera and easily define and navigate 2D floor plans.
 */
export class FragmentPlans extends Component {
    get commands() {
        return this.uiElement.commandsMenu.commands;
    }
    set commands(commands) {
        this.uiElement.commandsMenu.commands = commands;
    }
    constructor(components, clipper, camera) {
        super();
        this.name = "PlanNavigator";
        /** {@link Component.enabled} */
        this.enabled = false;
        /** The floorplan that is currently selected. */
        this.currentPlan = null;
        /** The offset from the clipping planes to their respective floor plan elevation. */
        this.defaultSectionOffset = 1.5;
        /** The offset of the 2D camera to the floor plan elevation. */
        this.defaultCameraOffset = 30;
        this.navigated = new Event();
        this.exited = new Event();
        /** The created floor plans. */
        this.storeys = [];
        this._plans = [];
        this._floorPlanViewCached = false;
        this._previousCamera = new THREE.Vector3();
        this._previousTarget = new THREE.Vector3();
        this._previousProjection = "Perspective";
        this._components = components;
        this._clipper = clipper;
        this._camera = camera;
        this.objects = new PlanObjects(components);
        this.setupPlanObjectUI();
        const topButtonContainer = new SimpleUIComponent(this._components, `<div class="flex"></div>`);
        const exitButton = new Button(components);
        exitButton.materialIcon = "logout";
        topButtonContainer.addChild(exitButton);
        exitButton.enabled = false;
        exitButton.onclick = () => this.exitPlanView();
        const main = new Button(components, {
            tooltip: "Plans list",
        });
        main.materialIcon = "folder_copy";
        const floatingWindow = new FloatingWindow(components);
        floatingWindow.title = "Floor Plans";
        components.ui.add(floatingWindow);
        floatingWindow.visible = false;
        floatingWindow.addChild(topButtonContainer);
        const planList = new SimpleUIComponent(components, `<div class="flex flex-col"></div>`);
        floatingWindow.addChild(planList);
        const defaultText = new SimpleUIComponent(components, `<p>No plans yet.</p>`);
        floatingWindow.addChild(defaultText);
        const commandsMenu = new CommandsMenu(components);
        components.ui.add(commandsMenu);
        commandsMenu.visible = false;
        this.uiElement = {
            main,
            floatingWindow,
            planList,
            defaultText,
            exitButton,
            commandsMenu,
        };
        main.onclick = () => {
            floatingWindow.visible = !floatingWindow.visible;
        };
    }
    /** {@link Component.get} */
    get() {
        return this._plans;
    }
    /** {@link Disposable.dispose} */
    dispose() {
        this.exited.reset();
        this.navigated.reset();
        this.storeys = [];
        this._plans = [];
        this._clipper.dispose();
        this.objects.dispose();
        this.uiElement.floatingWindow.dispose();
        this.uiElement.main.dispose();
        this.uiElement.planList.dispose();
        this.uiElement.defaultText.dispose();
        this.uiElement.exitButton.dispose();
        this.uiElement.commandsMenu.dispose();
        this._components = null;
        this._clipper = null;
        this._camera = null;
    }
    // TODO: Compute georreference matrix when generating fragmentsgroup
    // so that we can correctly add floors in georreferenced models
    // where the IfcSite / IfcBuilding have location information
    async computeAllPlanViews(model) {
        if (!model.properties) {
            throw new Error("Properties are needed to compute plan views!");
        }
        const { properties } = model;
        const floorsProps = IfcPropertiesUtils.getAllItemsOfType(properties, WEBIFC.IFCBUILDINGSTOREY);
        const coordHeight = model.coordinationMatrix.elements[13];
        const units = IfcPropertiesUtils.getUnits(properties);
        for (const floor of floorsProps) {
            const floorHeight = { value: 0 };
            this.getAbsoluteFloorHeight(floor.ObjectPlacement.value, model.properties, floorHeight);
            const height = floorHeight.value * units + coordHeight;
            await this.create({
                name: floor.Name.value,
                id: floor.GlobalId.value,
                normal: new THREE.Vector3(0, -1, 0),
                point: new THREE.Vector3(0, height, 0),
                ortho: true,
                offset: this.defaultSectionOffset,
            });
        }
        const { min, max } = model.boundingBox;
        this.objects.setBounds([min, max]);
    }
    /**
     * Creates a new floor plan in the navigator.
     *
     * @param config - Necessary data to initialize the floor plan.
     */
    async create(config) {
        const previousPlan = this._plans.find((plan) => plan.id === config.id);
        if (previousPlan) {
            throw new Error(`There's already a plan with the id: ${config.id}`);
        }
        const plane = await this.createClippingPlane(config);
        plane.visible = false;
        const plan = { ...config, plane };
        this._plans.push(plan);
        this.objects.add(config);
    }
    /**
     * Make the navigator go to the specified floor plan.
     *
     * @param id - Floor plan to go to.
     * @param animate - Whether to animate the camera transition.
     */
    async goTo(id, animate = false) {
        var _a;
        if (((_a = this.currentPlan) === null || _a === void 0 ? void 0 : _a.id) === id) {
            return;
        }
        this.objects.visible = false;
        this.navigated.trigger({ id });
        this.storeCameraPosition();
        this.hidePreviousClippingPlane();
        this.updateCurrentPlan(id);
        this.activateCurrentPlan();
        if (!this.enabled) {
            await this.moveCameraTo2DPlanPosition(animate);
            this.enabled = true;
        }
        this.uiElement.exitButton.enabled = true;
    }
    /**
     * Deactivate navigator and go back to the previous view.
     *
     * @param animate - Whether to animate the camera transition.
     */
    async exitPlanView(animate = false) {
        if (!this.enabled)
            return;
        this.enabled = false;
        this.exited.trigger();
        this.cacheFloorplanView();
        this._camera.setNavigationMode("Orbit");
        await this._camera.setProjection(this._previousProjection);
        if (this.currentPlan && this.currentPlan.plane) {
            this.currentPlan.plane.enabled = false;
            if (this.currentPlan.plane instanceof EdgesPlane) {
                this.currentPlan.plane.edges.visible = false;
            }
        }
        this.currentPlan = null;
        await this._camera.controls.setLookAt(this._previousCamera.x, this._previousCamera.y, this._previousCamera.z, this._previousTarget.x, this._previousTarget.y, this._previousTarget.z, animate);
        this.uiElement.exitButton.enabled = false;
    }
    updatePlansList() {
        const { defaultText, planList, commandsMenu } = this.uiElement;
        planList.dispose(true);
        if (!this._plans.length) {
            defaultText.visible = true;
            return;
        }
        defaultText.visible = false;
        commandsMenu.update();
        const commandsExist = commandsMenu.hasCommands;
        for (const plan of this._plans) {
            const height = Math.trunc(plan.point.y * 10) / 10;
            const description = `Height: ${height}`;
            const simpleCard = new SimpleUICard(this._components);
            simpleCard.title = plan.name;
            simpleCard.description = description;
            const toolbar = new Toolbar(this._components);
            this._components.ui.addToolbar(toolbar);
            simpleCard.addChild(toolbar);
            toolbar.domElement.classList.remove("shadow-md", "backdrop-blur-xl", "bg-ifcjs-100");
            const planButton = new Button(this._components, {
                materialIconName: "arrow_outward",
            });
            planButton.onclick = () => {
                this.goTo(plan.id);
            };
            toolbar.addChild(planButton);
            const extraButton = new Button(this._components, {
                materialIconName: "expand_more",
            });
            extraButton.onclick = (event) => {
                if (event) {
                    commandsMenu.commandData = plan;
                    commandsMenu.popup(event.x, event.y);
                }
            };
            if (!commandsExist) {
                extraButton.enabled = false;
            }
            toolbar.addChild(extraButton);
            simpleCard.domElement.classList.remove("bg-ifcjs-120");
            simpleCard.domElement.classList.remove("border-transparent");
            simpleCard.domElement.className += ` min-w-[300px] my-2 border-1 border-solid border-[#3A444E] `;
            planList.addChild(simpleCard);
        }
    }
    storeCameraPosition() {
        if (this.enabled) {
            this.cacheFloorplanView();
        }
        else {
            this.store3dCameraPosition();
        }
    }
    async createClippingPlane(config) {
        const { normal, point } = config;
        const clippingPoint = point.clone();
        if (config.offset) {
            clippingPoint.y += config.offset;
        }
        const plane = this._clipper.createFromNormalAndCoplanarPoint(normal, clippingPoint);
        plane.enabled = false;
        await plane.edges.update();
        plane.edges.visible = false;
        return plane;
    }
    cacheFloorplanView() {
        this._floorPlanViewCached = true;
        this._camera.controls.saveState();
    }
    async moveCameraTo2DPlanPosition(animate) {
        if (this._floorPlanViewCached)
            await this._camera.controls.reset(animate);
        else
            await this._camera.controls.setLookAt(0, 100, 0, 0, 0, 0, animate);
    }
    activateCurrentPlan() {
        if (!this.currentPlan)
            throw new Error("Current plan is not defined.");
        if (this.currentPlan.plane) {
            this.currentPlan.plane.enabled = true;
            this.currentPlan.plane.edges.fillNeedsUpdate = true;
            this.currentPlan.plane.edges.visible = true;
        }
        this._camera.setNavigationMode("Plan");
        const projection = this.currentPlan.ortho ? "Orthographic" : "Perspective";
        this._camera.setProjection(projection);
    }
    store3dCameraPosition() {
        const camera = this._camera.get();
        camera.getWorldPosition(this._previousCamera);
        this._camera.controls.getTarget(this._previousTarget);
        this._previousProjection = this._camera.getProjection();
    }
    updateCurrentPlan(id) {
        const foundPlan = this._plans.find((plan) => plan.id === id);
        if (!foundPlan) {
            throw new Error("The specified plan is undefined!");
        }
        this.currentPlan = foundPlan;
    }
    hidePreviousClippingPlane() {
        if (this.currentPlan) {
            const plane = this.currentPlan.plane;
            if (plane)
                plane.enabled = false;
            if (this.currentPlan.plane instanceof EdgesPlane) {
                this.currentPlan.plane.edges.visible = false;
            }
        }
    }
    setupPlanObjectUI() {
        this.objects.planClicked.on(async ({ id }) => {
            const button = this.objects.uiElement.main;
            if (!this.enabled) {
                if (button.innerElements.icon && button.innerElements.tooltip) {
                    button.materialIcon = "logout";
                    button.tooltip = "Exit floorplans";
                }
                button.onclick = () => {
                    this.exitPlanView();
                    if (button.innerElements.icon && button.innerElements.tooltip) {
                        button.materialIcon = "layers";
                        button.tooltip = "3D plans";
                    }
                    button.onclick = () => (this.objects.visible = !this.objects.visible);
                };
            }
            this.goTo(id);
        });
    }
    getAbsoluteFloorHeight(placementID, properties, height) {
        const placementRef = properties[placementID];
        if (!placementRef)
            return;
        const placement = properties[placementRef.RelativePlacement.value];
        const location = properties[placement.Location.value];
        const currentHeight = location.Coordinates[2].value;
        height.value += currentHeight;
        const parentRef = placementRef.PlacementRelTo;
        if (parentRef && parentRef.value !== null) {
            this.getAbsoluteFloorHeight(parentRef.value, properties, height);
        }
    }
}
//# sourceMappingURL=index.js.map