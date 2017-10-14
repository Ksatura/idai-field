import {AfterViewChecked, Component, Renderer} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {IdaiFieldDocument, IdaiFieldGeometry} from 'idai-components-2/idai-field-model';
import {DocumentChange, Query} from 'idai-components-2/datastore';
import {Action, Document} from 'idai-components-2/core';
import {Messages} from 'idai-components-2/messages';
import {IdaiFieldDatastore} from '../datastore/idai-field-datastore';
import {SettingsService} from '../settings/settings-service';
import {Loading} from '../widgets/loading';
import {M} from '../m';
import {ViewManager} from './service/view-manager';
import {RoutingHelper} from './service/routing-helper';
import {DoceditProxy} from './service/docedit-proxy';
import {SelectedManager} from "./service/selected-manager";


@Component({
    moduleId: module.id,
    templateUrl: './resources.html'
})
/**
 * @author Sebastian Cuy
 * @author Daniel de Oliveira
 * @author Jan G. Wieners
 * @author Thomas Kleinke
 */
export class ResourcesComponent implements AfterViewChecked {

    public editGeometry: boolean = false;

    public documents: Array<Document>;

    public projectDocument: IdaiFieldDocument;
    
    

    public ready: boolean = false;

    private newDocumentsFromRemote: Array<Document> = [];
    private scrollTarget: IdaiFieldDocument;

    private clickEventObservers: Array<any> = [];

    private subscription;

    private activeDocumentViewTab: string;

    constructor(route: ActivatedRoute,
                private viewManager: ViewManager,
                private routingHelper: RoutingHelper,
                private doceditProxy: DoceditProxy,
                private renderer: Renderer,
                private datastore: IdaiFieldDatastore,
                private settingsService: SettingsService,
                private messages: Messages,
                private loading: Loading,
                private selectedManager: SelectedManager
    ) {
        routingHelper.routeParams(route).subscribe(params => {

            this.ready = false;

            this.selectedManager.init();
            this.editGeometry = false;

            return this.initialize()
                .then(() => {
                    if (params['id']) {
                        // TODO Remove timeout (it is currently used to prevent buggy map behavior after following a relation link from image component to resources component)
                        setTimeout(() => {
                            this.selectDocumentFromParams(params['id'], params['menu'], params['tab']);
                        }, 100);
                    }
                })
                .catch(msgWithParams => {
                    if (msgWithParams) this.messages.add(msgWithParams);
                });
        });

        this.subscription = datastore.documentChangesNotifications().subscribe(documentChange => {
            this.handleChange(documentChange);
        });

        this.initializeClickEventListener();
    }


    ngOnDestroy() {

        this.subscription.unsubscribe();
    }


    ngAfterViewChecked() {

        if (this.scrollTarget) {
            if (this.scrollToDocument(this.scrollTarget)) {
                this.scrollTarget = undefined;
            }
        }
    }


    public jumpToRelationTarget(documentToSelect: Document, tab?: string) {

        this.routingHelper.jumpToRelationTarget(this.selectedManager.selectedDocument, documentToSelect,
            docToSelect => this.select(docToSelect), tab);
    }


    public stop() {

        this.ready = false;
    }


    public initialize(): Promise<any> {

        this.loading.start();
        return Promise.resolve()
            .then(() => this.populateProjectDocument())
            .then(() => this.selectedManager.populateMainTypeDocuments())
            .then(() => this.populateDocumentList())
            .then(() => (this.ready = true) && this.loading.stop());
    }


    public chooseMainTypeDocumentOption(document: IdaiFieldDocument) {

        this.selectedManager.selectMainTypeDocument(document,()=>{this.selectDocumentAndAdjustContext(undefined);});
        this.populateDocumentList();
    }


    private selectDocumentFromParams(id: string, menu?: string, tab?: string) {

        this.datastore.get(id).then(
            document => menu == 'edit' ? this.editDocument(document, tab) : this.selectDocumentAndAdjustContext(document, tab),
            () => this.messages.add([M.DATASTORE_NOT_FOUND])
        );
    }


    /**
     * TODO since there are to many methods with 'select' in their names, try to get rid of this method or move it to MapWrapper. It is called only from there.
     * @param documentToSelect the object that should get selected
     */
    public select(documentToSelect: IdaiFieldDocument) {

        if (this.editGeometry && documentToSelect !=
            this.selectedManager.selectedDocument) this.endEditGeometry();

        if (this.isNewDocumentFromRemote(documentToSelect)) {
            this.removeFromListOfNewDocumentsFromRemote(documentToSelect);
        }

        this.selectDocumentAndAdjustContext(documentToSelect);
    }


    /**
     * Sets the this.selectedManager.selectedDocument (and this.activeTabName)
     * and if necessary, also
     * a) selects the operation type document,
     * this.selectedManager.selectedDocument is recorded in, accordingly and
     * b) invalidates query settings in order to make sure
     * this.selectedManager.selectedDocument is part of the search hits of the document list
     * on the left hand side in the map view.
     *
     * The method also creates records relations (as inverse relations
     * of isRecordedIn) for operation type resources if we are in project view.
     *
     * @param documentToSelect
     * @param activeTabName
     * @returns {Document}
     */
    public selectDocumentAndAdjustContext(
            documentToSelect: Document,
            activeTabName?: string): Document {

        this.selectedManager.selectedDocument = documentToSelect;
        this.activeDocumentViewTab = activeTabName;
        this.adjustContext();
        return this.selectedManager.selectedDocument;
    }


    private adjustContext() {

        if (!this.selectedManager.selectedDocument) return;

        const res1 = this.selectedManager.selectLinkedMainTypeDocumentForSelectedDocument();
        const res2 = this.selectedManager.invalidateQuerySettingsIfNecessary();

        let promise = Promise.resolve();
        if (res1 || res2) promise = this.populateDocumentList();

        promise.then(() => this.selectedManager.insertRecordsRelation());
    }


    public getSelected(): Document {

        return this.selectedManager.selectedDocument;
    }


    public deselect() {

        this.selectedManager.selectedDocument = undefined;
    }


    private handleChange(documentChange: DocumentChange) {

        if (documentChange.type == 'deleted') {
            console.debug('unhandled deleted document');
            return;
        }

        let changedDocument: Document = documentChange.document;

        if (!this.documents || !this.isRemoteChange(changedDocument)) return;
        if (ResourcesComponent.isExistingDoc(changedDocument, this.documents)) return;

        if (changedDocument.resource.type == this.viewManager.getView().mainType) return this.selectedManager.populateMainTypeDocuments();

        let oldDocuments = this.documents;
        this.populateDocumentList().then(() => {
            for (let doc of this.documents) {
                if (oldDocuments.indexOf(doc) == -1 && this.isRemoteChange(doc)) {
                    this.newDocumentsFromRemote.push(doc);
                }
            }
        });
    }


    private initializeClickEventListener() {

        this.renderer.listenGlobal('document', 'click', event => {
            for (let clickEventObserver of this.clickEventObservers) {
                clickEventObserver.next(event);
            }
        });
    }


    public listenToClickEvents(): Observable<Event> {

        return Observable.create(observer => {
            this.clickEventObservers.push(observer);
        });
    }


    public setQueryString(q: string) {

        this.viewManager.setQueryString(q);

        if (!this.viewManager.isSelectedDocumentMatchedByQueryString(this.selectedManager.selectedDocument)) {
            this.editGeometry = false;
            this.deselect();
        }

        this.populateDocumentList();
    }


    public setQueryTypes(types: string[]) {

        this.viewManager.setFilterTypes(types);

        if (!this.viewManager.isSelectedDocumentTypeInTypeFilters(this.selectedManager.selectedDocument)) {
            this.editGeometry = false;
            this.deselect();
        }

        this.populateDocumentList();
    }


    public remove(document: Document) {

        this.documents.splice(this.documents.indexOf(document), 1);
    }


    public getQuery() {

        return {
            q: this.viewManager.getQueryString(),
            types: this.viewManager.getQueryTypes()
        }
    }


    private populateProjectDocument(): Promise<any> {

        return this.datastore.get(this.settingsService.getSelectedProject())
            .then(document => this.projectDocument = document as IdaiFieldDocument)
            .catch(err => Promise.reject([M.DATASTORE_NOT_FOUND]));
    }


    /**
     * Populates the document list with all documents from
     * the datastore which match a <code>query</code>
     */
    private populateDocumentList() {

        this.newDocumentsFromRemote = [];

        if (!this.selectedManager.selectedMainTypeDocument) {
            this.documents = [];
            return Promise.resolve();
        }

        return this.fetchDocuments(ResourcesComponent.makeDocsQuery(
            {q: this.viewManager.getQueryString(), types: this.viewManager.getQueryTypes()},
                    this.selectedManager.selectedMainTypeDocument.resource.id))
            .then(documents => this.documents = documents);
    }


    private fetchDocuments(query: Query): Promise<any> {

        this.loading.start();
        return this.datastore.find(query)
            .catch(errWithParams => this.handleFindErr(errWithParams, query))
            .then(documents => {
                this.loading.stop(); return documents;
            });
    }


    public startEditNewDocument(newDocument: IdaiFieldDocument, geometryType: string) {

        this.removeEmptyDocuments();
        this.selectedManager.selectedDocument = newDocument;

        if (geometryType == 'none') {
            this.editDocument();
        } else {
            newDocument.resource['geometry'] = <IdaiFieldGeometry> { 'type': geometryType };
            this.editGeometry = true;
            this.viewManager.setMode('map', false); // TODO store option was introduced only because of this line because before refactoring the mode was not set to resources state. so the exact behaviour has to be kept. review later
        }

        if (newDocument.resource.type != this.viewManager.getView().mainType) {
            this.documents.unshift(<Document> newDocument);
        }
    }


    public editDocument(document: Document = this.selectedManager.selectedDocument,
                        activeTabName?: string) {

        this.editGeometry = false;

        // TODO find out what this is code for. this.selectedManager.selectedDocumentAndAdjustContext was called selectDocument before, and also did not create the records relation
        if (document != this.selectedManager.selectedDocument &&
                document != this.selectedManager.selectedMainTypeDocument) {

            this.selectDocumentAndAdjustContext(document);
        }
        // -

        ResourcesComponent.removeRecordsRelation(document);
        this.doceditProxy.editDocument(document, result => {

                if (result['tab']) this.activeDocumentViewTab = result['tab'];
                return this.selectedManager.populateMainTypeDocuments().then(() => {
                        this.selectedManager.invalidateQuerySettingsIfNecessary();
                        this.handleDocumentSelectionOnSaved(result.document);
                    });

            }, closeReason => {
                this.removeEmptyDocuments();
                if (closeReason == 'deleted') {
                    this.selectedManager.selectedDocument = undefined;
                    if (document == this.selectedManager.selectedMainTypeDocument) {
                        return this.selectedManager.handleMainTypeDocumentOnDeleted();
                    }
                }
            },
            activeTabName)

            .then(() => this.populateDocumentList()) // do this in every case, since this is also the trigger for the map to get repainted with updated documents
            .then(() => this.selectedManager.insertRecordsRelation());
    }


    private static removeRecordsRelation(document) {

        if (!document) return;
        delete document.resource.relations['records'];
    }


    public startEditGeometry() {

        this.editGeometry = true;
    }


    public endEditGeometry() {

        this.editGeometry = false;
        this.populateDocumentList();
    }


    public createGeometry(geometryType: string) {

        this.selectedManager.selectedDocument.resource['geometry'] = { 'type': geometryType };
        this.startEditGeometry();
    }


    public isNewDocumentFromRemote(document: Document): boolean {

        return this.newDocumentsFromRemote.indexOf(document) > -1;
    }


    public removeFromListOfNewDocumentsFromRemote(document: Document) {

        let index = this.newDocumentsFromRemote.indexOf(document);
        if (index > -1) this.newDocumentsFromRemote.splice(index, 1);
    }


    public isRemoteChange(changedDocument: Document): boolean {

        const latestAction: Action =
            (changedDocument.modified && changedDocument.modified.length > 0)
            ? changedDocument.modified[changedDocument.modified.length - 1]
            : changedDocument.created;

        return latestAction && latestAction.user != this.settingsService.getUsername();
    }


    public solveConflicts(doc: IdaiFieldDocument) {

        this.editDocument(doc, 'conflicts');
    }


    public startEdit(doc: IdaiFieldDocument, activeTabName?: string) {

        this.editDocument(doc, activeTabName);
    }


    public setScrollTarget(doc: IdaiFieldDocument) {

        this.scrollTarget = doc;
    }


    private handleDocumentSelectionOnSaved(document: IdaiFieldDocument) {

        if (document.resource.type == this.viewManager.getView().mainType) {

            this.selectedManager.selectMainTypeDocument(document,()=>{this.selectDocumentAndAdjustContext(undefined);});
        } else {

            this.selectedManager.selectedDocument = document;
            this.scrollTarget = document;
        }
    }


    private scrollToDocument(doc: IdaiFieldDocument): boolean {

        let element = document.getElementById('resource-' + doc.resource.identifier);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            return true;
        }
        return false;  
    }


    public setMode(mode: string) {

        this.loading.start();
        // The timeout is necessary to make the loading icon appear
        setTimeout(() => {
            this.removeEmptyDocuments();
            this.selectedManager.selectedDocument = undefined;
            this.viewManager.setMode(mode);
            this.editGeometry = false;
            this.loading.stop();
        }, 1);
    }


    public getCurrentFilterType()  {

        return (this.viewManager.getFilterTypes() &&
            this.viewManager.getFilterTypes().length > 0 ?
            this.viewManager.getFilterTypes()[0] : undefined);
    }


    private removeEmptyDocuments() {

        if (!this.documents) return;

        for (let document of this.documents) {
            if (!document.resource.id) this.remove(document);
        }
    }


    private handleFindErr(errWithParams: Array<string>, query: Query) {

        console.error('Error with find. Query:', query);
        if (errWithParams.length == 2) console.error('Error with find. Cause:', errWithParams[1]);
        this.messages.add([M.ALL_FIND_ERROR]);
    }


    private static isExistingDoc(changedDocument: Document, documents: Array<Document>): boolean {

        for (let doc of documents) {
            if (!doc.resource || !changedDocument.resource) continue;
            if (!doc.resource.id || !changedDocument.resource.id) continue;
            if (doc.resource.id == changedDocument.resource.id) return true;
        }
    }


    private static makeDocsQuery(query: Query, mainTypeDocumentResourceId: string): Query {

        const clonedQuery = JSON.parse(JSON.stringify(query));
        clonedQuery.constraints = { 'resource.relations.isRecordedIn': mainTypeDocumentResourceId };
        return clonedQuery;
    }
}
