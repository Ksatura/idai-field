import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { isUndefinedOrEmpty, clone, Map } from 'tsfun';
import { Document, Field, Group, Labels, ProjectConfiguration } from 'idai-field-core';
import { Language, Languages } from '../../../services/languages';
import { SettingsProvider } from '../../../services/settings/settings-provider';


@Component({
    selector: 'edit-form',
    templateUrl: './edit-form.html'
})
/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class EditFormComponent implements AfterViewInit, OnChanges {

    @ViewChild('editor', { static: false }) rootElement: ElementRef;

    @Input() document: Document;
    @Input() originalDocument: Document;
    @Input() fieldDefinitions: Array<Field>;
    @Input() originalGroups: Array<Group>;
    @Input() inspectedRevisions: Document[];
    @Input() activeGroup: string;

    public categories: string[];
    public extraGroups: Array<Group> = [{ name: 'conflicts', fields: [] }];
    public groups: Array<Group> = [];
    public languages: Array<Language>;


    constructor(private elementRef: ElementRef,
                private i18n: I18n,
                private labels: Labels,
                private settingsProvider: SettingsProvider,
                private projectConfiguration: ProjectConfiguration) {

        this.languages = this.getConfiguredLanguages();
    }


    public activateGroup = (name: string) => this.activeGroup = name;

    public getGroupId = (group: Group) => 'edit-form-goto-' + group.name.replace(':', '-');


    ngAfterViewInit() {

        this.focusFirstInputElement();
    }


    ngOnChanges() {

        if (isUndefinedOrEmpty(this.originalGroups)) return;

        this.groups = [];
        for (const originalGroup of this.originalGroups) {
            const group = clone(originalGroup);
            this.groups.push(group);
        }
        this.groups = this.groups.concat(this.extraGroups);
    }


    public getLabel(group: Group): string {

        return group.name === 'conflicts'
            ? this.i18n({ id: 'docedit.group.conflicts', value: 'Konflikte' })
            : this.labels.get(group);
    }


    public shouldShow(groupName: string) {

        return (groupName === 'conflicts' && this.document._conflicts)
            || this.getFields(groupName).filter(field => field.editable).length > 0;
    }


    public getFields(groupName: string): Array<Field> {

        return this.groups.find((group: Group) => group.name === groupName).fields;
    }


    private getConfiguredLanguages(): Array<Language> {

        const configuredLanguages: string[] = clone(this.projectConfiguration.getProjectLanguages());
        const settingsLanguages: string[] = this.settingsProvider.getSettings().languages;

        const languages: Map<Language> = Languages.getAvailableLanguages();

        return configuredLanguages.sort((language1, language2) => {
            return this.getIndexForSorting(settingsLanguages, language1)
                - this.getIndexForSorting(settingsLanguages, language2);
        }).map(languageCode => languages[languageCode]);
    }


    private getIndexForSorting(settingsLanguages: string[], language: string): number {

        const index: number = settingsLanguages.indexOf(language);
        return index === -1 ? 10000000 : index; 
    }


    private focusFirstInputElement() {

        const inputElements: Array<HTMLElement> = this.elementRef.nativeElement
            .getElementsByTagName('input');
        if (inputElements.length > 0) inputElements[0].focus();
    }
}
