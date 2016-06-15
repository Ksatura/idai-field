import {Component, OnInit, Inject, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Datastore} from 'idai-components-2/idai-components-2';
import {IdaiFieldObject} from '../model/idai-field-object';
import {DocumentEditComponent} from "idai-components-2/idai-components-2";
import {AppComponent} from "../components/app.component";
import {PersistenceManager} from "idai-components-2/idai-components-2";
import {Project} from "../model/project";
import {Messages} from "idai-components-2/idai-components-2";
import {ConfigLoader} from "idai-components-2/idai-components-2";
import {LoadAndSaveService} from "idai-components-2/idai-components-2";
import {MODAL_DIRECTIVES, ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    templateUrl: 'templates/overview.html',
    directives: [DocumentEditComponent, MODAL_DIRECTIVES],
})

/**
 * @author Sebastian Cuy
 * @author Daniel de Oliveira
 * @author Jan G. Wieners
 * @author Thomas Kleinke
 */
export class OverviewComponent implements OnInit {

    @ViewChild('modal')
    modal: ModalComponent;

    /**
     * The object currently selected in the list and shown in the edit component.
     */
    private selectedDocument: IdaiFieldObject;

    constructor(private datastore: Datastore,
        @Inject('app.config') private config,
        private persistenceManager: PersistenceManager,
        private project: Project,
        private configLoader: ConfigLoader,
        private messages: Messages,
        private loadAndSaveService:LoadAndSaveService) {
    }

    /**
     * Function to call if preconditions to change are met.
     */
    private changeSelectionAllowedCallback;

    /**
     * Checks if the preconditions are given to change the focus from
     * <code>currentlySelectedObject</code> to another object.
     *
     * @param currentlySelectedObject
     * @returns {any}
     */
    private checkChangeSelectionAllowed(currentlySelectedObject) {
        this.messages.clear();
        if (!currentlySelectedObject
            || !this.persistenceManager.isLoaded() // why this line?
        ) return this.changeSelectionAllowedCallback();

        // Remove object from list if it is new and no data has been entered
        if (currentlySelectedObject && (!currentlySelectedObject['resource'].type || (!this.selectedDocument.id && !this.persistenceManager.isLoaded()))) {
            this.persistenceManager.load(currentlySelectedObject['resource']);
            return this.discardChanges();
        }

        this.modal.open();
    }

    public save(object) {
        this.loadAndSaveService.save(object).then(()=>true);
    }

    public discardChanges() {

        this.project.restore(this.selectedDocument).then(() => {
            this.persistenceManager.unload();
            this.changeSelectionAllowedCallback();
        }, (err) => {
            this.messages.add(err);
        });
    }

    private setConfigs() {
        this.configLoader.setProjectConfiguration(AppComponent.PROJECT_CONFIGURATION_PATH);
        this.configLoader.setRelationsConfiguration(AppComponent.RELATIONS_CONFIGURATION_PATH);
    }

    private createSelectExistingCallback(documentToSelect) {
        return function() {
            this.selectedDocument=documentToSelect;
        }.bind(this);
    }

    private createNewObjectCallback() {
        return function() {
            var newDocument = {"resource":{}};
            this.project.getDocuments().unshift(newDocument);
            this.selectedDocument = <IdaiFieldObject> newDocument;
        }.bind(this);
    }

    /**
     * @param objectToSelect the object that should get selected if the precondtions
     *   to change the selection are met.
     *   undefined if a new object is to be created if the preconditions
     *   to change the selection are met.
     */
    public select(objectToSelect: IdaiFieldObject) {

        if (objectToSelect) {
            if (objectToSelect == this.selectedDocument) return;
            this.changeSelectionAllowedCallback=this.createSelectExistingCallback(objectToSelect);
        }
        else this.changeSelectionAllowedCallback=this.createNewObjectCallback();

        this.checkChangeSelectionAllowed(this.selectedDocument);
    }

    public ngOnInit() {
        this.setConfigs();
        if (this.config.environment == "test") {
            setTimeout(() => this.fetchDocuments(), 500);
        } else {
            this.fetchDocuments();
        }
    }

    onKey(event:any) {

        if (event.target.value == "") {
            this.datastore.all({}).then(documents => {
                this.project.setDocuments(documents);
            }).catch(err => console.error(err));
        } else {
            this.datastore.find(event.target.value, {}).then(documents => {
                this.project.setDocuments(documents);
            }).catch(err => console.error(err));
        }
    }

    private fetchDocuments() {

        this.datastore.all({}).then(documents => {
            this.project.setDocuments(documents);
        }).catch(err => console.error(err));
    }
}
