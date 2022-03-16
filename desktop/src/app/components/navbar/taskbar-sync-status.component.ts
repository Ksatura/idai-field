import { ChangeDetectorRef, Component } from '@angular/core';
import { SyncService, SyncStatus, ImageSyncService } from 'idai-field-core';
import { ProjectModalLauncher } from '../../services/project-modal-launcher';


@Component({
    selector: 'taskbar-sync-status',
    templateUrl: './taskbar-sync-status.html'
})
/**
 * @author Sebastian Cuy
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class TaskbarSyncStatusComponent {

    constructor(private pouchSyncService: SyncService,
                private imageSyncService: ImageSyncService,
                private changeDetectorRef: ChangeDetectorRef,
                private projectModalLauncher: ProjectModalLauncher) {

        this.pouchSyncService.statusNotifications().subscribe(() => {
            this.changeDetectorRef.detectChanges();
        });
    }

    
    public printStatus() {

        console.log('Current status: ', this.getStatus());
        console.log('Pouchdb status: ', this.pouchSyncService.getStatus());
        console.log('Image status:', JSON.stringify(this.imageSyncService.getStatus()));
    }


    public getStatus = (): SyncStatus => {

        const status: SyncStatus = this.pouchSyncService.getStatus();

        // If pouch DB is still syncing, do not evaluate image syncing status.
        if (status !== SyncStatus.InSync) return status;

        const imageStatus = this.imageSyncService.getStatus();

        // If any image variant status is anything else than offline or in sync, use that one as
        // overall status.
        for (const variant in imageStatus) {
            if (![SyncStatus.InSync, SyncStatus.Offline].includes(imageStatus[variant])) {
                return imageStatus[variant];
            }
        }

        return SyncStatus.InSync;
    }

    public openSynchronizationModal = () => this.projectModalLauncher.openSynchronizationModal();
}
