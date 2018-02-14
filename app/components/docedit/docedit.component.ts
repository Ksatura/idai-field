import {Component} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DocumentEditChangeMonitor} from 'idai-components-2/documents';
import {Document} from 'idai-components-2/core';
import {Messages} from 'idai-components-2/messages';
import {DatastoreErrors} from 'idai-components-2/datastore';
import {ProjectConfiguration} from 'idai-components-2/configuration';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {ConflictDeletedModalComponent} from './conflict-deleted-modal.component';
import {SettingsService} from '../../core/settings/settings-service';
import {ImageTypeUtility} from '../../common/image-type-utility';
import {Imagestore} from '../../core/imagestore/imagestore';
import {ObjectUtil} from '../../util/object-util';
import {M} from '../../m';
import {DoceditActiveTabService} from './docedit-active-tab-service';
import {PersistenceManager} from '../../core/persist/persistence-manager';
import {Validator} from '../../core/model/validator';
import {DeleteModalComponent} from './delete-modal.component';
import {EditSaveDialogComponent} from './edit-save-dialog.component';
import {DocumentDatastore} from '../../core/datastore/document-datastore';


@Component({
    selector: 'detail-modal',
    moduleId: module.id,
    templateUrl: './docedit.html'
})
/**
 * Uses the document edit forms of idai-components-2 and adds styling
 * and navigation items like save and back buttons and modals
 * including the relevant functionality like validation,
 * persistence handling, conflict resolution etc.
 *
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class DoceditComponent {

    /**
     * Holds a cloned version of the <code>document</code> set via {@link DoceditComponent#setDocument}.
     * On clonedDocument changes can be made which can be either saved or discarded later.
     */
    private clonedDocument: Document;


    /**
     * These are the revisions (of the cloned document as long as not saved)
     * that are conflict resolved. They will be be removed from document
     * as soon as it gets saved.
     */
    private inspectedRevisionsIds: string[];

    private parentLabel: string|undefined = undefined;

    private showDoceditImagesTab: boolean = false;


    constructor(
        public activeModal: NgbActiveModal,
        public documentEditChangeMonitor: DocumentEditChangeMonitor,
        private messages: Messages,
        private persistenceManager: PersistenceManager,
        private validator: Validator,
        private settingsService: SettingsService,
        private modalService: NgbModal,
        private datastore: DocumentDatastore,
        private imagestore: Imagestore,
        private imageTypeUtility: ImageTypeUtility,
        private activeTabService: DoceditActiveTabService,
        private projectConfiguration: ProjectConfiguration) {
    }


    public getFieldDefinitionLabel: (_: string) => string;


    public getRelationDefinitions = () => this.projectConfiguration.getRelationDefinitions(
        this.clonedDocument.resource.type, false, 'editable');


    public async setDocument(document: IdaiFieldDocument) {

        this.inspectedRevisionsIds = [];
        this.clonedDocument = ObjectUtil.cloneObject(document);

        this.showDoceditImagesTab = (!
            (this.imageTypeUtility.getProjectImageTypes())[this.clonedDocument.resource.type]
        );

        this.getFieldDefinitionLabel = (fieldName: string) =>
            this.projectConfiguration.getFieldDefinitionLabel(document.resource.type, fieldName);

        this.persistenceManager.setOldVersions([document]);

        this.parentLabel = await this.fetchParentLabel(document);
    }


    public changeActiveTab(event: any) {

        this.activeTabService.setActiveTab(event.nextId.replace('docedit-','').replace('-tab',''));
    };


    public changeType(newType: string) {

        this.clonedDocument.resource.type = newType;
        this.documentEditChangeMonitor.setChanged();
        this.showTypeChangeFieldsWarning();
        this.showTypeChangeRelationsWarning();
    }


    public cancel() {

        if (this.documentEditChangeMonitor.isChanged()) {
            this.showModal();
        } else {
            this.activeModal.dismiss('cancel');
        }
    }


    public async openDeleteModal() {

        const ref = this.modalService.open(DeleteModalComponent);
        ref.componentInstance.setDocument(this.clonedDocument);
        ref.componentInstance.setCount(await this.fetchIsRecordedInCount(this.clonedDocument));
        const decision = await ref.result;
        if (decision == 'delete') this.deleteDoc();
    }


    /**
     * @param viaSaveButton if true, it is assumed the call for save came directly
     *   via a user interaction.
     */
    public async save(viaSaveButton: boolean = false) {

        this.removeInvalidFields();
        this.removeInvalidRelations();

        const documentBeforeSave: Document = ObjectUtil.cloneObject(this.clonedDocument);

        try {
            await this.validator.validate(this.clonedDocument);

            try {
                await this.persistenceManager.persist(this.clonedDocument, this.settingsService.getUsername());
                await this.handleSaveSuccess(documentBeforeSave, viaSaveButton);
            } catch (errorWithParams) {
                await this.handleSaveError(errorWithParams)
            }

        } catch (msgWithParams) {
            this.messages.add(msgWithParams)
        }
    }


    private async fetchParentLabel(document: IdaiFieldDocument) {

        return document.resource.id
                ? undefined
                : (await this.datastore.get(
                        document.resource.relations.liesWithin
                            ? document.resource.relations.liesWithin[0]
                            : document.resource.relations.isRecordedIn[0])
                ).resource.identifier;
    }


    private async showModal() {

        try {
            if ((await this.modalService.open(EditSaveDialogComponent).result) === 'save') this.save();
        } catch (_) {
            this.activeModal.dismiss('discard');
        }
    }


    private async fetchIsRecordedInCount(document: Document): Promise<number> {

        return !document.resource.id
            ? 0
            : (await this.datastore.find(
                    { q: '', constraints: { 'isRecordedIn:contain': document.resource.id }} as any)
            ).documents.length;
    }


    private showTypeChangeFieldsWarning() {

        if (this.validateFields().length > 0) {
            this.messages.add([
                M.DOCEDIT_TYPE_CHANGE_FIELDS_WARNING,
                this.validateFields()
                    .map(this.getFieldDefinitionLabel)
                    .reduce((acc, fieldLabel) => acc + ', ' + fieldLabel)
            ]);
        }
    }


    private showTypeChangeRelationsWarning() {

        if (this.validateRelationFields().length > 0) {
            this.messages.add([
                M.DOCEDIT_TYPE_CHANGE_RELATIONS_WARNING,
                this.validateRelationFields()
                    .map((relationName: string) => this.projectConfiguration.getRelationDefinitionLabel(relationName))
                    .reduce((acc, relationLabel) => acc + ', ' + relationLabel)
            ]);
        }
    }


    private removeInvalidFields() {

        if (this.validateFields().length > 0) {
            for (let fieldName of this.validateFields()) {
                delete this.clonedDocument.resource[fieldName];
            }
        }
    }


    private removeInvalidRelations() {

        if (this.validateRelationFields().length > 0) {
            for (let relationFieldName of this.validateRelationFields()) {
                delete this.clonedDocument.resource.relations[relationFieldName]; 
            }
        }
    }


    private validateFields: () => Array<string> = () =>
        Validator.validateFields(this.clonedDocument.resource, this.projectConfiguration);


    private validateRelationFields: () => Array<string> = () =>
        Validator.validateRelations(this.clonedDocument.resource, this.projectConfiguration);


    private async handleSaveSuccess(documentBeforeSave: Document, viaSaveButton: boolean) {

        try {
            await this.removeInspectedRevisions(this.clonedDocument.resource.id as any);
            const latestRevision =  await this.getLatestRevision(this.clonedDocument.resource.id as any);

            this.clonedDocument = latestRevision;
            this.documentEditChangeMonitor.reset();

            if (DoceditComponent.detectSaveConflicts(documentBeforeSave, latestRevision)) {
                this.activeTabService.setActiveTab('conflicts');
                this.messages.add([M.DOCEDIT_SAVE_CONFLICT]);
            } else {
                await this.closeModalAfterSave(latestRevision.resource.id as any, viaSaveButton);
            }
        } catch (msgWithParams) {

            this.messages.add(msgWithParams);
        }
    }


    private async handleSaveError(errorWithParams: any) {

        if (errorWithParams[0] == DatastoreErrors.DOCUMENT_NOT_FOUND) {
            this.handleDeletedConflict();
            return undefined;
        } else {
            console.error(errorWithParams);
            return [M.DOCEDIT_SAVE_ERROR];
        }
    }


    private async closeModalAfterSave(resourceId: string, viaSaveButton: boolean): Promise<any> {

        this.activeModal.close({
            document: (await this.datastore.get(resourceId)),
            viaSaveButton: viaSaveButton
        });
        this.messages.add([M.DOCEDIT_SAVE_SUCCESS]);
    }


    private async getLatestRevision(resourceId: string) {

        try {
            return await this.datastore.get(resourceId, {skip_cache: true});
        } catch (e) {
            throw [M.DATASTORE_NOT_FOUND];
        }
    }


    /**
     * @param resourceId
     * @return {Promise<IdaiFieldDocument>} latest revision
     */
    private removeInspectedRevisions(resourceId: string): Promise<any> {

        let promises = [] as any;
        for (let revisionId of this.inspectedRevisionsIds) {
            promises.push(this.datastore.removeRevision(resourceId, revisionId) as never);
        }
        this.inspectedRevisionsIds = [];

        return Promise.all(promises)
            .catch(() => Promise.reject([M.DATASTORE_GENERIC_ERROR]));
    }


    private handleDeletedConflict() {

        this.modalService.open(
            ConflictDeletedModalComponent, {size: 'lg', windowClass: 'conflict-deleted-modal'}
        ).result.then(() => {
            this.makeClonedDocAppearNew();
        }).catch(() => {});
    }


    private makeClonedDocAppearNew() {

        // make the doc appear 'new' ...
        delete this.clonedDocument.resource.id; // ... for persistenceManager
        delete (this.clonedDocument as any)['_id'];      // ... for pouchdbdatastore
        delete (this.clonedDocument as any)['_rev'];
    }


    private async deleteDoc() {

        try {
            await this.removeImageWithImageStore(this.clonedDocument);
            await this.removeWithPersistenceManager(this.clonedDocument);
            this.activeModal.dismiss('deleted');
            this.messages.add([M.DOCEDIT_DELETE_SUCCESS]);
        } catch(err) {
            this.messages.add(err);
        }
    }


    private async removeImageWithImageStore(document: any): Promise<any> {

        if (!this.imageTypeUtility.isImageType(document.resource.type)) return undefined;

        if (!this.imagestore.getPath()) throw [M.IMAGESTORE_ERROR_INVALID_PATH_DELETE];
        try {
            await this.imagestore.remove(document.resource.id);
        } catch (_) {
            return [M.IMAGESTORE_ERROR_DELETE, document.resource.id];
        }
    }


    private async removeWithPersistenceManager(document: any): Promise<any> {

        try {
            await this.persistenceManager.remove(document, this.settingsService.getUsername())
        } catch(removeError) {
            if (removeError != DatastoreErrors.DOCUMENT_NOT_FOUND) {
                throw [M.DOCEDIT_DELETE_ERROR];
            }
        }
    }


    private static detectSaveConflicts(documentBeforeSave: Document,
                                       documentAfterSave: Document): boolean {

        const conflictsBeforeSave: string[] = (documentBeforeSave as any)['_conflicts'];
        const conflictsAfterSave: string[] =  (documentAfterSave as any)['_conflicts'];

        if (!conflictsBeforeSave && conflictsAfterSave && conflictsAfterSave.length >= 1) return true;
        if (!conflictsAfterSave) return false;

        for (let conflict of conflictsAfterSave) {
            if (conflictsBeforeSave.indexOf(conflict) == -1) {
                return true;
            }
        }

        return false;
    }
}