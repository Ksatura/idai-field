import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { isSuccess } from 'tsfun';
import {Datastore, FieldDocument, ImageDocument} from 'idai-field-core';
import {ImageGridComponent} from '../../image/grid/image-grid.component';
import {M} from '../../messages/m';
import {Messages} from '../../messages/messages';
import {ProjectConfiguration} from '../../../core/configuration/project-configuration';
import { getImageSuggestions, QueryId } from '../../../core/docedit/widgets/get-image-suggestions';
import { ProjectCategories } from '../../../core/configuration/project-categories';


@Component({
    selector: 'image-picker',
    templateUrl: './image-picker.html',
    host: {
        '(window:keydown)': 'onKeyDown($event)'
    }
})
/**
 * @author Fabian Z.
 * @author Thomas Kleinke
 */
export class ImagePickerComponent implements OnInit {

    private static documentLimit = 24;

    @ViewChild('imageGrid', { static: false }) public imageGrid: ImageGridComponent;
    @ViewChild('modalBody') public modalBody: ElementRef;

    public mode: 'depicts'|'layers';
    public documents: Array<ImageDocument>;
    public document: FieldDocument;
    public selectedDocuments: Array<ImageDocument> = [];

    private currentQueryId: QueryId;
    private queryString = '';
    private currentOffset = 0;
    private totalDocumentCount = 0;


    constructor(public activeModal: NgbActiveModal,
                private messages: Messages,
                private datastore: Datastore,
                private el: ElementRef,
                private projectConfiguration: ProjectConfiguration) {}


    public getCurrentPage = () => this.currentOffset / ImagePickerComponent.documentLimit + 1;

    public getPageCount = () => Math.max(1, Math.ceil(this.totalDocumentCount / ImagePickerComponent.documentLimit));

    public canTurnPage = () => (this.currentOffset + ImagePickerComponent.documentLimit) < this.totalDocumentCount;

    public canTurnPageBack = () => this.currentOffset > 0;


    public ngOnInit() {

        // Listen for transformation of modal to capture finished
        // resizing and invoke recalculation of imageGrid
        const modalEl = this.el.nativeElement.parentElement.parentElement;
        modalEl.addEventListener('transitionend', (event: any) => {
            if (event.propertyName === 'transform') this.onResize();
        });
    }


    public async onKeyDown(event: KeyboardEvent) {

        if (event.key === 'Escape') {
            this.activeModal.dismiss('cancel');
        } else if (event.key === 'Enter') {
            this.applySelection();
        }
    }


    public async setDocument(document: FieldDocument) {

        this.document = document;
        await this.fetchDocuments();
    }


    public async setQueryString(q: string) {

        this.queryString = q;
        this.currentOffset = 0;
        await this.fetchDocuments();
    }


    public onResize() {

        this.imageGrid.calcGrid();
    }


    public select(document: ImageDocument) {

        if (!this.selectedDocuments.includes(document)) {
            this.selectedDocuments.push(document);
        } else {
            this.selectedDocuments.splice(this.selectedDocuments.indexOf(document), 1);
        }
    }


    public applySelection() {

        if (this.selectedDocuments.length > 0) this.activeModal.close(this.selectedDocuments);
    }


    public turnPage() {

        if (this.canTurnPage()) {
            this.currentOffset += ImagePickerComponent.documentLimit;
            this.fetchDocuments();
        }
    }


    public turnPageBack() {

        if (this.canTurnPageBack()) {
            this.currentOffset -= ImagePickerComponent.documentLimit;
            this.fetchDocuments();
        }
    }


    private async fetchDocuments() {

        if (this.modalBody) this.modalBody.nativeElement.scrollTop = 0;

        this.currentQueryId = new Date().toISOString();

        const result =
            await getImageSuggestions(
                this.datastore,
                ProjectCategories.getImageCategoryNames(this.projectConfiguration.getCategoryForest()),
                this.document,
                this.mode,
                this.currentQueryId,
                this.queryString,
                ImagePickerComponent.documentLimit,
                this.currentOffset);

        if (isSuccess(result)) {
            const [,[suggestions, totalCount, queryId]] = result;
            if (queryId === this.currentQueryId) {
                this.documents = suggestions;
                this.totalDocumentCount = totalCount;
            }
        } else {
            const [msgs,] = result;
            for (const msg of msgs) console.error(...msg);
            this.messages.add([M.ALL_ERROR_FIND]);
        }
    }
}
