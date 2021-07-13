import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { InPlace } from 'idai-field-core';
import { MenuContext } from '../services/menu-context';
import { Menus } from '../services/menus';
import { LanguagePickerModalComponent } from './language-picker-modal.component';
import { Language, LanguagesUtil } from '../../core/util/languages-util';


@Component({
    selector: 'language-settings',
    templateUrl: './language-settings.html'
})
/**
 * @author Thomas Kleinke
 */
export class LanguageSettingsComponent {

    @Input() selectedLanguages: string[];

    public readonly languages: { [languageCode: string]: Language };
    public dragging: boolean = false;


    constructor(private modalService: NgbModal,
                private menuService: Menus,
                private i18n: I18n) {

        this.languages = this.getAvailableLanguages();
    }


    public removeLanguage(language: string) {

        this.selectedLanguages.splice(this.selectedLanguages.indexOf(language), 1);
    }


    public onDrop(event: CdkDragDrop<string[], any>) {

        InPlace.moveInArray(this.selectedLanguages, event.previousIndex, event.currentIndex);
    }


    public async addLanguage() {

        this.menuService.setContext(MenuContext.MODAL);

        const modalReference: NgbModalRef = this.modalService.open(LanguagePickerModalComponent);
        modalReference.componentInstance.languages = LanguagesUtil.getUnselectedLanguages(
            this.languages, this.selectedLanguages
        );

        try {
            this.selectedLanguages.push(await modalReference.result);
        } catch (err) {
            // Modal has been canceled
        } finally {
            this.menuService.setContext(MenuContext.DEFAULT);
        }
    }


    private getAvailableLanguages(): { [languageCode: string]: Language } {

        const availableLanguages: { [languageCode: string]: Language } = LanguagesUtil.getAvailableLanguages();

        availableLanguages['it'].info = this.i18n({
            id: 'settings.languageInfo.it',
            value: 'Die italienische Übersetzung wird bereitgestellt vom DAI Rom. Bei Fragen und Anmerkungen zur Übersetzung wenden Sie sich bitte an: idai.field-italiano@dainst.de'
        });

        return availableLanguages;
    }
}
