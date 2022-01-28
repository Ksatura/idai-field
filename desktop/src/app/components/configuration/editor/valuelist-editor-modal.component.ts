import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { equal, isEmpty, nop, not, set } from 'tsfun';
import { I18N, InPlace, Labels, SortUtil, Valuelist } from 'idai-field-core';
import { ConfigurationEditorModalComponent } from './configuration-editor-modal.component';
import { Menus } from '../../../services/menus';
import { Messages } from '../../messages/messages';
import { SettingsProvider } from '../../../services/settings/settings-provider';
import { Modals } from '../../../services/modals';
import { MenuContext } from '../../../services/menu-context';
import { ValueEditorModalComponent } from './value-editor-modal.component';
import { M } from '../../messages/m';
import { ConfigurationUtil } from '../configuration-util';


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
    public extendedValuelist?: Valuelist;

    public newValueId: string = '';
    public order: string[];
    public sortAlphanumerically: boolean;
    public dragging: boolean;

    public inputPlaceholder: string = this.i18n({
        id: 'configuration.newValue', value: 'Neuer Wert'
    });

    protected changeMessage = this.i18n({
        id: 'configuration.valuelistChanged', value: 'Die Werteliste wurde geändert.'
    });

    protected menuContext: MenuContext = MenuContext.CONFIGURATION_VALUELIST_EDIT;


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

    public getValueLabel = (valueId: string) =>
        this.labels.getValueLabel(this.getClonedValuelistDefinition(), valueId);

    public getValueIds = () => this.sortAlphanumerically ? this.getSortedValueIds() : this.order;

    public isInherited = (valueId: string) => this.extendedValuelist?.values[valueId] !== undefined;

    public isHidden = (valueId: string) => this.getClonedValuelistDefinition().hidden?.includes(valueId);


    public initialize() {

        super.initialize();

        if (this.new) {
            if (!this.clonedConfigurationDocument.resource.valuelists) {
                this.clonedConfigurationDocument.resource.valuelists = {};
            }
            this.clonedConfigurationDocument.resource.valuelists[this.valuelist.id] = {
                values: {},
                createdBy: this.settingsProvider.getSettings().username,
                creationDate: new Date().toISOString().split('T')[0]
            }

            if (this.extendedValuelist) {
                this.getClonedValuelistDefinition().extendedValuelist = this.extendedValuelist.id;
                if (this.extendedValuelist.order) {
                    this.getClonedValuelistDefinition().order = this.extendedValuelist.order;
                }
            }
        }

        if (!this.getClonedValuelistDefinition().references) this.getClonedValuelistDefinition().references = [];
        this.sortAlphanumerically = this.getClonedValuelistDefinition().order === undefined;
        this.order = this.getClonedValuelistDefinition().order ?? this.getSortedValueIds();
    }


    public async save() {

        if (isEmpty(this.getClonedValuelistDefinition().values) && !this.extendedValuelist) {
            return this.messages.add([M.CONFIGURATION_ERROR_NO_VALUES_IN_VALUELIST]);
        }

        try {
            ConfigurationUtil.cleanUpAndValidateReferences(this.getClonedValuelistDefinition());
        } catch (errWithParams) {
            return this.messages.add(errWithParams);
        }

        this.getClonedValuelistDefinition().description = this.clonedDescription;
        
        if (this.sortAlphanumerically) {
            delete this.getClonedValuelistDefinition().order;
        } else {
            this.getClonedValuelistDefinition().order = this.order;
        }

        await super.save(undefined, true);
    }


    public isChanged(): boolean {
        
        return this.new
            || !equal(this.getCustomValuelistDefinition())(this.getClonedValuelistDefinition())
            || !equal(this.description)(this.clonedDescription)
            || (this.sortAlphanumerically && this.getClonedValuelistDefinition().order !== undefined)
            || !this.sortAlphanumerically && (!this.getClonedValuelistDefinition().order
                || !equal(this.order, this.getClonedValuelistDefinition().order))
        || ConfigurationUtil.isReferencesArrayChanged(this.getCustomValuelistDefinition(),
                this.getClonedValuelistDefinition());
    }


    public async editValue(valueId: string, isNewValue: boolean = false) {

        const [result, componentInstance] = this.modals.make<ValueEditorModalComponent>(
            ValueEditorModalComponent,
            MenuContext.CONFIGURATION_MODAL
        );

        componentInstance.value = this.getClonedValuelistDefinition().values[valueId]
            ?? this.extendedValuelist?.values[valueId]
            ?? {};

        componentInstance.valueId = valueId;
        componentInstance.new = isNewValue;
        componentInstance.initialize();

        await this.modals.awaitResult(
            result,
            editedValue => this.getClonedValuelistDefinition().values[valueId] = editedValue,
            nop
        );
    }


    public async addValue(valueId: string) {

        this.newValueId = '';
        await this.editValue(valueId, true);
        this.order.push(valueId);
    }


    public deleteValue(valueId: string) {

        delete this.getClonedValuelistDefinition().values[valueId];
    }


    public isValidValue(valueId: string): boolean {

        return valueId && !Object.keys(this.getClonedValuelistDefinition().values).includes(valueId);
    }


    public toggleSort() {

        this.sortAlphanumerically = !this.sortAlphanumerically;
    }

    
    public toggleHidden(valueId: string) {

        const valuelistDefinition = this.getClonedValuelistDefinition();

        if (valuelistDefinition.hidden?.includes(valueId)) {
            valuelistDefinition.hidden.splice(valuelistDefinition.hidden.indexOf(valueId), 1);
            if (valuelistDefinition.hidden.length === 0) delete valuelistDefinition.hidden;
        } else {
            if (!valuelistDefinition.hidden) valuelistDefinition.hidden = [];
            valuelistDefinition.hidden.push(valueId);
            valuelistDefinition.hidden.sort(SortUtil.alnumCompare);
        }
    }


    public onDrop(event: CdkDragDrop<any>) {

        InPlace.moveInArray(this.order, event.previousIndex, event.currentIndex);
    }


    private getSortedValueIds(): string[] {

        const valueIds: string[] = set(
            Object.keys(this.getClonedValuelistDefinition().values)
                .concat(this.extendedValuelist ? Object.keys(this.extendedValuelist.values) : [])
        );

        return valueIds.sort((valueId1: string, valueId2: string) => {
            return SortUtil.alnumCompare(this.getValueLabel(valueId1), this.getValueLabel(valueId2));
        });
    }


    protected getLabel(): I18N.String {

        return undefined;
    }


    protected getDescription(): I18N.String {

        return this.valuelist.description;
    }


    protected updateCustomLanguageConfigurations() {}
}
