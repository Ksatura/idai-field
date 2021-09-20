import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Document, Datastore } from 'idai-field-core';
import { AngularUtility } from '../../angular/angular-utility';
import { reload } from '../../services/reload';
import { ProjectNameValidation } from '../../model/project-name-validation';
import { DoceditComponent } from '../docedit/docedit.component';
import { MenuContext } from '../../services/menu-context';
import { Menus } from '../../services/menus';
import { M } from '../messages/m';
import { Messages } from '../messages/messages';
import {MsgWithParams} from '../messages/msg-with-params';
import { ProjectNameValidatorMsgConversion } from '../messages/project-name-validator-msg-conversion';
import { ViewModalLauncher } from '../resources/service/view-modal-launcher';
import {SettingsService} from '../../services/settings/settings-service';
import {StateSerializer} from '../../services/state-serializer';
import {Settings, SyncTarget} from '../../services/settings/settings';
import {SettingsProvider} from '../../services/settings/settings-provider';

const remote = typeof window !== 'undefined' ? window.require('@electron/remote') : undefined;


type NewType=Settings;

@Component({
    selector: 'projects-modal',
    templateUrl: './projects-modal.html',
    host: {
        '(document:click)': 'handleClick($event)',
        '(window:keydown)': 'onKeyDown($event)'
    }
})
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class ProjectsModalComponent implements OnInit, AfterViewChecked {

    public selectedProject: string;
    public newProject: string = '';
    public projectToDelete: string = '';
    public openConflictResolver: boolean = false;
    public settings: NewType;
    public syncTarget: SyncTarget;

    private focusInput: boolean = false;

    @ViewChild('createPopover', { static: false }) private createPopover: NgbPopover;
    @ViewChild('deletePopover', { static: false }) private deletePopover: NgbPopover;


    constructor(public activeModal: NgbActiveModal,
                private settingsProvider: SettingsProvider,
                private settingsService: SettingsService,
                private modalService: NgbModal,
                private messages: Messages,
                private stateSerializer: StateSerializer,
                private datastore: Datastore,
                private menuService: Menus,
                private viewModalLauncher: ViewModalLauncher) {
    }


    async ngOnInit() {

        this.settings = this.settingsProvider.getSettings();

        if (!this.settings.syncTargets[this.settings.selectedProject]) {
            this.settings.syncTargets[this.settings.selectedProject] = {
                address: '', password: '', isSyncActive: false
            };
        }
        this.syncTarget = this.settings.syncTargets[this.settings.selectedProject];
    }


    ngAfterViewChecked() {

        if (this.focusInput) {
            AngularUtility.focusElementInNgTemplate('new-project-input');
            AngularUtility.focusElementInNgTemplate('delete-project-input');
            this.focusInput = false;
        }
    }


    public getProjects = () => this.settings.dbs;


    public onKeyDown(event: KeyboardEvent) {

        if (this.menuService.getContext() === MenuContext.PROJECTS && event.key === 'Escape') {
            if (this.createPopover.isOpen()) {
                this.createPopover.close();
            } else if (this.deletePopover.isOpen()) {
                this.deletePopover.close();
            } else {
                this.activeModal.close();
            }
        }
    }


    public reset() {

        this.projectToDelete = '';
        this.newProject = '';
    }


    public openMenu(popover: any) {

        this.reset();
        popover.toggle();
        this.focusInput = true;
    }


    public async editProjectImages() {

        this.viewModalLauncher.openImageViewModal(await this.datastore.get('project'), 'edit');
    }


    public handleClick(event: Event) {

        let target: any = event.target;
        let insideCreatePopover = false;
        let insideDeletePopover = false;

        do {
            if (target.id === 'new-project-menu' || target.id === 'new-project-button') {
                insideCreatePopover = true;
            }
            if (target.id === 'delete-project-menu' || target.id === 'delete-project-button') {
                insideDeletePopover = true;
            }
            target = target.parentNode;
        } while (target);

        if (!insideCreatePopover && this.createPopover.isOpen()) this.createPopover.close();
        if (!insideDeletePopover && this.deletePopover.isOpen()) this.deletePopover.close();
    }


    public async toggleSync() {

        this.syncTarget.isSyncActive = !this.syncTarget.isSyncActive;
        try {
        this.settings = await this.settingsService.updateSettings(this.settings);
        } catch (err) {
            console.error(err);
        }

        this.syncTarget = this.settings.syncTargets[this.settings.selectedProject];
        await this.settingsService.setupSync();
    }


    private canDeleteProject() {

        if (!this.projectToDelete || (this.projectToDelete === '')) {
            return false;
        }
        if (this.projectToDelete !== this.selectedProject) {
            this.messages.add([M.RESOURCES_WARNING_PROJECT_NAME_NOT_SAME]);
            return false;
        }
        if (this.getProjects().length < 2) {
            this.messages.add([M.RESOURCES_ERROR_ONE_PROJECT_MUST_EXIST]);
            return false;
        }
        return true;
    }
}
