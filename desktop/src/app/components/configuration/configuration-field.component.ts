import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CategoryForm, ConfigurationDocument, CustomFieldDefinition, Field, Valuelist,
    Labels } from 'idai-field-core';
import { ConfigurationUtil, InputType } from '../../components/configuration/configuration-util';
import { ConfigurationContextMenu } from './context-menu/configuration-context-menu';


@Component({
    selector: 'configuration-field',
    templateUrl: './configuration-field.html'
})
/**
* @author Sebastian Cuy
* @author Thomas Kleinke
 */
export class ConfigurationFieldComponent implements OnChanges {

    @Input() category: CategoryForm;
    @Input() field: Field;
    @Input() configurationDocument: ConfigurationDocument;
    @Input() hidden: boolean;
    @Input() availableInputTypes: Array<InputType>;
    @Input() contextMenu: ConfigurationContextMenu;
    @Input() opened: boolean = false;

    @Output() onEdit: EventEmitter<void> = new EventEmitter<void>();
    @Output() onOpen: EventEmitter<void> = new EventEmitter<void>();

    public parentField: boolean = false;
    public customFieldDefinitionClone: CustomFieldDefinition | undefined;
    public editable: boolean = false;

    public label: string;
    public description: string;


    constructor(private labels: Labels) {}


    ngOnChanges() {

        if (!this.category || !this.field) return;

        this.parentField = ConfigurationUtil.isParentField(this.category, this.field);
        this.updateLabelAndDescription();
    }

    public getCustomLanguageConfigurations = () => this.configurationDocument.resource.languages;

    public isCustomField = () => this.category.customFields?.includes(this.field.name) && !this.parentField;

    public isContextMenuOpen = () => this.contextMenu.isOpen() && this.contextMenu.field === this.field;

    public getInputTypeLabel = () => ConfigurationUtil.getInputTypeLabel(
        this.field.inputType, this.availableInputTypes
    );


    public getCustomFieldDefinition(): CustomFieldDefinition|undefined {

        return this.configurationDocument.resource
            .forms[this.category.libraryId ?? this.category.name]
            .fields[this.field.name];
    }


    private updateLabelAndDescription() {

        const { label, description } = this.labels.getLabelAndDescription(this.field);
        this.label = label;
        this.description = description;
    }
}
