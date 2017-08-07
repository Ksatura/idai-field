import {Component, Input, ElementRef, ViewChild, OnChanges, Renderer} from '@angular/core';
import {ConfigLoader, IdaiType, ProjectConfiguration} from 'idai-components-2/configuration';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {Relations} from 'idai-components-2/core';
import {ResourcesComponent} from './resources.component';
import {Messages} from 'idai-components-2/messages';
import {M} from '../m';


@Component({
    selector: 'plus-button',
    moduleId: module.id,
    templateUrl: './plus-button.html'
})

/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class PlusButtonComponent implements OnChanges {

    @Input() placement: string = 'bottom'; // top | bottom | left | right
    @Input() isRecordedIn: IdaiFieldDocument;
    @Input() liesWithin: IdaiFieldDocument;
    @Input() preselectedType: string;
    @Input() preselectedGeometryType: string;

    @ViewChild('popover') private popover;

    private typesTreeList: Array<IdaiType>;
    private type: string;

    private clickEventListener: Function;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer,
        private resourcesComponent: ResourcesComponent,
        private configLoader: ConfigLoader,
        private messages: Messages) {}

    ngOnChanges() {

        this.configLoader.getProjectConfiguration()
            .then(projectConfiguration => this.initializeTypesTreeList(projectConfiguration))
            .then(() => this.setClickEventListener())
            .catch(() => {});
    }

    public startDocumentCreation(geometryType: string = this.preselectedGeometryType) {

        if (this.popover) this.popover.close();

        const newDocument: IdaiFieldDocument = <IdaiFieldDocument> {
            'resource': {
                'relations': this.createRelations(),
                'type': this.type
            }
        };

        this.resourcesComponent.startEditNewDocument(newDocument, geometryType);
    }

    public reset() {

        this.type = this.preselectedType;
    }

    public chooseType(type: IdaiType) {

        if (type.isAbstract) return;

        this.type = type.name;
        if (this.preselectedGeometryType) this.startDocumentCreation();
    }

    private setClickEventListener() {

        // Remove existing listener
        if (this.clickEventListener) {
            this.clickEventListener();
            this.clickEventListener = undefined;
        }

        if (this.typesTreeList.length > 1 || !this.preselectedGeometryType) {
            this.clickEventListener = this.renderer.listenGlobal('document', 'click', event => {
                this.handleClick(event);
            });
        }
    }

    private handleClick(event) {

        if (!this.popover) return;

        let target = event.target;
        let inside = false;

        do {
            if (target === this.elementRef.nativeElement
                || target.id === 'new-object-menu'
                || target.id === 'geometry-type-selection') {
                inside = true;
                break;
            }
            target = target.parentNode;
        } while (target);

        if (!inside) {
            this.popover.close();
        }
    }

    private initializeTypesTreeList(projectConfiguration: ProjectConfiguration) {

        this.typesTreeList = [];

        if (this.preselectedType) {
            const type = projectConfiguration.getTypesMap()[this.preselectedType];
            if (type) this.typesTreeList.push(type);
            else this.messages.add([M.RESOURCES_ERROR_TYPE_NOT_FOUND, this.preselectedType]);
        } else {
            for (let type of projectConfiguration.getTypesList()) {
                if (this.isAllowedType(type, projectConfiguration)) {
                    this.typesTreeList.push(type);
                }
            }
        }
    }

    private createRelations(): Relations {

        let relations: Relations = {};

        if (this.isRecordedIn) relations['isRecordedIn'] = [this.isRecordedIn.resource.id];
        if (this.liesWithin) relations['liesWithin'] = [this.liesWithin.resource.id];

        return relations;
    }

    private isAllowedType(type: IdaiType, projectConfiguration: ProjectConfiguration): boolean {

        if (type.name == 'image') return false;

        if (this.isRecordedIn && !projectConfiguration.isAllowedRelationDomainType(type.name,
                this.isRecordedIn.resource.type, 'isRecordedIn')) {
            return false;
        }

        if (this.liesWithin && !projectConfiguration.isAllowedRelationDomainType(type.name,
                this.liesWithin.resource.type, 'liesWithin')) {
            return false;
        }

        return true;
    }


}
