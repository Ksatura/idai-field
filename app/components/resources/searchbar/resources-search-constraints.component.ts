import {Component, Renderer2} from '@angular/core';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {SearchConstraintsComponent} from '../../../widgets/search-constraints.component';
import {ResourcesSearchBarComponent} from './resources-search-bar.component';
import {ViewFacade} from '../view/view-facade';
import {FieldDefinition} from '../../../core/configuration/model/field-definition';
import {ProjectConfiguration} from '../../../core/configuration/project-configuration';
import {SettingsService} from '../../../core/settings/settings-service';


@Component({
    moduleId: module.id,
    selector: 'resources-search-constraints',
    templateUrl: '../../../widgets/search-constraints.html',
    host: {
        '(document:click)': 'handleClick($event)',
    }
})
/**
 * @author Thomas Kleinke
 */
export class ResourcesSearchConstraintsComponent extends SearchConstraintsComponent {

    protected defaultFields: Array<FieldDefinition> = [
        {
            name: 'geometry',
            label: this.i18n({ id: 'resources.searchBar.constraints.geometry', value: 'Geometrie' }),
            inputType: 'default',
            constraintIndexed: true,
            group: ''
        },
        {
            name: 'isDepictedIn',
            label: this.i18n({
                id: 'resources.searchBar.constraints.linkedImages',
                value: 'Verknüpfte Bilder'
            }),
            inputType: 'default',
            constraintIndexed: true,
            group: ''
        }
    ];

    constructor(resourcesSearchBarComponent: ResourcesSearchBarComponent,
                projectConfiguration: ProjectConfiguration,
                settingsService: SettingsService,
                renderer: Renderer2,
                i18n: I18n,
                private viewFacade: ViewFacade) {

        super(resourcesSearchBarComponent, projectConfiguration, settingsService, renderer, i18n);

        this.viewFacade.navigationPathNotifications().subscribe(() => {
            if (this.type) this.reset();
        });
    }


    protected getCustomConstraints(): { [name: string]: string } {

        return this.viewFacade.getCustomConstraints();
    }


    protected async setCustomConstraints(constraints: { [name: string]: string }): Promise<void> {

        return this.viewFacade.setCustomConstraints(constraints);
    }
}