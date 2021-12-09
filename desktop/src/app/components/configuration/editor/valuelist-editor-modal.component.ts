import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { equal, nop } from 'tsfun';
import { I18N, Labels, SortUtil, Valuelist } from 'idai-field-core';
import { ConfigurationEditorModalComponent } from './configuration-editor-modal.component';
import { Menus } from '../../../services/menus';
import { Messages } from '../../messages/messages';
import { SettingsProvider } from '../../../services/settings/settings-provider';
import { Modals } from '../../../services/modals';
import { MenuContext } from '../../../services/menu-context';
import { ValueEditorModalComponent } from './value-editor-modal.component';


@Component({
    templateUrl: './valuelist-editor-modal.html',
    host: {
        '(window:keydown)': 'onKeyDown($event)',
        '(window:keyup)': 'onKeyUp($event)',
    }
})
/**
 * @author Thomas Kleinke
 */
export class ValuelistEditorModalComponent extends ConfigurationEditorModalComponent {

    public valuelist: Valuelist;

    protected changeMessage = this.i18n({
        id: 'docedit.saveModal.valuelistChanged', value: 'Die Werteliste wurde geändert.'
    });


    constructor(activeModal: NgbActiveModal,
                modalService: NgbModal,
                menuService: Menus,
                messages: Messages,
                private settingsProvider: SettingsProvider,
                private labels: Labels,
                private modals: Modals,
                private i18n: I18n) {

        super(activeModal, modalService, menuService, messages);
    }


    public getCustomValuelistDefinition = () => this.configurationDocument.resource.valuelists?.[this.valuelist.id];

    public getClonedValuelistDefinition = () =>
        this.clonedConfigurationDocument.resource.valuelists?.[this.valuelist.id];

    public getSortedValueIds = () => this.getClonedValuelistDefinition().order
        ??  Object.keys(this.getClonedValuelistDefinition().values).sort(SortUtil.alnumCompare);

    public getValueLabel = (valueId: string) =>
        this.labels.getValueLabel(this.getClonedValuelistDefinition(), valueId);


    public initialize() {

        super.initialize();

        if (this.new) {
            if (!this.clonedConfigurationDocument.resource.valuelists) {
                this.clonedConfigurationDocument.resource.valuelists = {};
            }
            this.clonedConfigurationDocument.resource.valuelists[this.valuelist.id] = {
                values: { defaultValue: {} },
                createdBy: this.settingsProvider.getSettings().username,
                creationDate: new Date().toISOString().split('T')[0]
            }
        }
    }


    public async save() {

        this.getClonedValuelistDefinition().description = this.clonedDescription;

        await super.save();
    }


    public isChanged(): boolean {
        
        return this.new
            || !equal(this.getCustomValuelistDefinition())(this.getClonedValuelistDefinition())
            || !equal(this.description)(this.clonedDescription);
    }


    public editValue(valueId: string) {

        const [result, componentInstance] = this.modals.make<ValueEditorModalComponent>(
            ValueEditorModalComponent,
            MenuContext.CONFIGURATION_MODAL
        );

        componentInstance.value = this.getClonedValuelistDefinition().values[valueId];
        componentInstance.valueId = valueId;
        componentInstance.initialize();

        this.modals.awaitResult(
            result,
            editedValue => this.getClonedValuelistDefinition().values[valueId] = editedValue,
            nop
        );
    }


    protected getLabel(): I18N.String {

        return undefined;
    }


    protected getDescription(): I18N.String {

        return this.valuelist.description;
    }


    protected updateCustomLanguageConfigurations() {}
}
