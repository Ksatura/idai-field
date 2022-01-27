import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { equal } from 'tsfun';
import { ConfigurationDocument, I18N, CustomLanguageConfigurations, CategoryForm } from 'idai-field-core';
import { Menus } from '../../../services/menus';
import { Messages } from '../../messages/messages';
import { ConfigurationEditorModalComponent } from './configuration-editor-modal.component';
import { ConfigurationUtil } from '../../../components/configuration/configuration-util';


@Component({
    templateUrl: './category-editor-modal.html',
    host: {
        '(window:keydown)': 'onKeyDown($event)',
        '(window:keyup)': 'onKeyUp($event)',
    }
})
/**
 * @author Thomas Kleinke
 */
export class CategoryEditorModalComponent extends ConfigurationEditorModalComponent {

    private currentColor: string;

    protected changeMessage = this.i18n({
        id: 'configuration.categoryChanged', value: 'Die Kategorie wurde geändert.'
    });


    constructor(activeModal: NgbActiveModal,
                modalService: NgbModal,
                menuService: Menus,
                messages: Messages,
                private i18n: I18n) {

        super(activeModal, modalService, menuService, messages);
    }


    public isCustomCategory = () => this.category.source === 'custom';


    public initialize() {

        super.initialize();

        this.currentColor = this.category.color
            ? CategoryEditorModalComponent.getHexColor(this.category.color)
            : '#000000';

        if (this.new) {
            this.clonedConfigurationDocument.resource.forms[this.category.name] = {
                color: this.category.color,
                parent: this.category.parentCategory.name,
                fields: {},
                groups: CategoryForm.getGroupsConfiguration(
                    this.category,
                    ConfigurationDocument.getPermanentlyHiddenFields(this.configurationDocument, this.category)
                )
            }
        } else {
            if (!this.getClonedFormDefinition().color) {
                this.getClonedFormDefinition().color = this.currentColor;
            }
        }
    }


    public async save() {

        if (this.getClonedFormDefinition().color ===
                CategoryEditorModalComponent.getHexColor(this.category.defaultColor)
                && this.category.libraryId) {
            delete this.getClonedFormDefinition().color;
        }

        if (this.new) {
            this.clonedConfigurationDocument = ConfigurationDocument.addToCategoriesOrder(
                this.clonedConfigurationDocument,
                this.category.name,
                this.category.parentCategory?.name
            );
        }

        await super.save(this.new);
    }


    public isChanged(): boolean {

        return this.new
            || !equal(this.label)(this.clonedLabel)
            || !equal(this.description)(this.clonedDescription)
            || this.getClonedFormDefinition().color !== this.currentColor;
    }


    public isRestoreColorButtonVisible(): boolean {

        return this.getClonedFormDefinition().color
            && this.getClonedFormDefinition().color
                !== CategoryEditorModalComponent.getHexColor(this.category.defaultColor)
            && this.category.libraryId !== undefined;
    }


    public restoreDefaultColor() {

        this.getClonedFormDefinition().color = CategoryEditorModalComponent.getHexColor(
            this.category.defaultColor
        );
    }


    protected getLabel(): I18N.String {

        return this.category.label;
    }


    protected getDescription(): I18N.String {

        return this.category.description;
    }


    protected updateCustomLanguageConfigurations() {

        CustomLanguageConfigurations.update(
            this.getClonedLanguageConfigurations(), this.clonedLabel, this.clonedDescription, this.category
        );
    }


    private static getHexColor(color: string): string {

        const canvasContext = document.createElement('canvas').getContext('2d');
        canvasContext.fillStyle = color;

        return canvasContext.fillStyle;
    }
}
