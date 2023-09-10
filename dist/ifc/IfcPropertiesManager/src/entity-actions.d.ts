import { FragmentsGroup } from "bim-fragment";
import { Components } from "../../../core/Components";
import { SimpleUIComponent } from "../../../ui/SimpleUIComponent";
import { Button } from "../../../ui/ButtonComponent";
import { Modal } from "../../../ui/Modal";
import { Event } from "../../../base-types";
export declare class EntityActionsUI extends SimpleUIComponent<HTMLDivElement> {
    addPsetBtn: Button;
    modal: Modal;
    private _nameInput;
    private _descriptionInput;
    readonly onNewPset: Event<{
        model: FragmentsGroup;
        elementIDs?: number[] | Set<number> | undefined;
        name: string;
        description: string;
    }>;
    data: {
        model?: FragmentsGroup;
        elementIDs?: number[] | Set<number>;
    };
    constructor(components: Components);
    dispose(onlyChildren?: boolean): void;
}
