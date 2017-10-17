import {Injectable} from '@angular/core';
import {MainTypeManager} from './main-type-manager';
import {ViewManager} from './view-manager';
import {DocumentsManager} from './documents-manager';
@Injectable()
/**
 *
 */
export class ViewFacade {

    constructor(
        private documentsManager: DocumentsManager,
        private viewManager: ViewManager,
        private mainTypeManager: MainTypeManager
    ) { }

    public init() {

        return this.mainTypeManager.init();
    }

    public getView() {

        return this.viewManager.getView();
    }

    public getMainTypeDocumentLabel(document) {

        return this.viewManager.getMainTypeDocumentLabel(document);
    }

    public getMainTypeLabel() {

        return this.viewManager.getMainTypeLabel();
    }

    public deselect() {

        return this.documentsManager.deselect();
    }

    public getMode() {

        return this.viewManager.getMode();
    }

    public getQuery() {

        return this.documentsManager.getQuery();
    }

    public getProjectDocument() {

        return this.documentsManager.projectDocument;
    }

    public getSelectedMainTypeDocument() {

        return this.mainTypeManager.selectedMainTypeDocument;
    }

    public getMainTypeDocuments() {

        return this.mainTypeManager.mainTypeDocuments;
    }

    public getFilterTypes() {

        return this.viewManager.getFilterTypes();
    }

    public getQueryString() {

        return this.viewManager.getQueryString();
    }

    public setMode(mode) {

        this.viewManager.setMode(mode);
    }

    public setSelectedDocumentById(id) {

        return this.documentsManager.setSelectedById(id);
    }

    public getDocuments() {

        return this.documentsManager.documents;
    }

    public setQueryString(q) {

        return this.documentsManager.setQueryString(q);
    }

    public setQueryTypes(types) {

        return this.documentsManager.setQueryTypes(types);
    }


    public getSelectedDocument() {

        return this.documentsManager.selected();
    }

    public selectMainTypeDocument(mainTypeDoc, selectedDocument, cb) {

        return this.mainTypeManager.selectMainTypeDocument(
            mainTypeDoc, selectedDocument, cb);
    }

    public populateProjectDocument() {

        return this.documentsManager.populateProjectDocument();
    }

    public populateDocumentList() {

        return this.documentsManager.populateDocumentList();
    }

    public populateMainTypeDocuments(selectedDocument) {

        return this.mainTypeManager.populateMainTypeDocuments(selectedDocument);
    }
}