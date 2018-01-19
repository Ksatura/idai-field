import {Component, Input} from '@angular/core';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {Validator} from 'idai-components-2/persist';
import {Messages} from 'idai-components-2/messages';
import {IdaiType} from 'idai-components-2/configuration';
import {M} from '../../../m';
import {SettingsService} from '../../../core/settings/settings-service';
import {ResourcesComponent} from '../resources.component';
import {StateFacade} from '../state/state-facade';
import {PersistenceManager} from '../../../core/persist/persistence-manager';
import {IdaiFieldDocumentReadDatastore} from '../../../core/datastore/idai-field-document-read-datastore';
import {NavigationService} from '../navigation-service';


@Component({
    selector: 'row',
    moduleId: module.id,
    templateUrl: './row.html'
})
/**
 * @author Fabian Z.
 * @autor Thomas Kleinke
 */
export class RowComponent {

    @Input() document: IdaiFieldDocument;
    @Input() typesMap: { [type: string]: IdaiType };

    private initialValueOfCurrentlyEditedField: string|undefined;


    constructor(
        public resourcesComponent: ResourcesComponent,
        public viewFacade: StateFacade,
        private messages: Messages,
        private persistenceManager: PersistenceManager,
        private settingsService: SettingsService,
        private validator: Validator,
        private datastore: IdaiFieldDocumentReadDatastore,
        private navigationService: NavigationService
    ) {  }


    // TODO consider factoring out component for moveInto button, and put this and showMoveIntoOption into it
    public moveInto = (document: IdaiFieldDocument) => this.navigationService.moveInto(document);


    public showMoveIntoOption = (document: IdaiFieldDocument) => this.navigationService.showMoveIntoOption(document);


    public startEditing(fieldValue: string) {

        this.initialValueOfCurrentlyEditedField = fieldValue;
    }


    public stopEditing(document: IdaiFieldDocument, fieldValue: string) {

        if (this.initialValueOfCurrentlyEditedField != fieldValue) this.save(document);
        this.initialValueOfCurrentlyEditedField = fieldValue;
    }


    public onKeyup(event: KeyboardEvent, document: IdaiFieldDocument, fieldValue: string) {

        if (event.keyCode == 13) { // Return key
            this.stopEditing(document, fieldValue);
        }
    }


    public async save(document: IdaiFieldDocument) {

        const oldVersion = JSON.parse(JSON.stringify(document));

        try {
            await this.validator.validate(document);
        } catch(msgWithParams) {
            this.messages.add(msgWithParams);
            return this.restoreIdentifier(document);
        }

        try {
            await this.persistenceManager.persist(document, this.settingsService.getUsername(),
                [oldVersion]);
            this.messages.add([M.DOCEDIT_SAVE_SUCCESS]);
        } catch(msgWithParams) {
            return this.messages.add(msgWithParams);
        }

        if (!oldVersion.resource.id) await this.viewFacade.populateDocumentList();
    }


    private async restoreIdentifier(document: IdaiFieldDocument): Promise<any> {

        try {
            document.resource.identifier =
                (await this.datastore.get(document.resource.id as any, {skip_cache: true})
                ).resource.identifier;
        } catch(_) {
            return [M.DATASTORE_NOT_FOUND];
        }
    }
}