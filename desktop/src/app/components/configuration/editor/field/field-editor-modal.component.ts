import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { clone, equal, intersection, isEmpty, Map, set, to } from 'tsfun';
import { ConfigurationDocument, CustomFormDefinition, Field, I18N, OVERRIDE_VISIBLE_FIELDS,
    CustomLanguageConfigurations, ProjectConfiguration, CategoryForm, Named, Relation, Labels } from 'idai-field-core';
import { InputType, ConfigurationUtil } from '../../configuration-util';
import { ConfigurationEditorModalComponent } from '../configuration-editor-modal.component';
import { Menus } from '../../../../services/menus';
import { Messages } from '../../../messages/messages';
import { Modals } from '../../../../services/modals';
import { M } from '../../../messages/m';


@Component({
    templateUrl: './field-editor-modal.html',
    host: {
        '(window:keydown)': 'onKeyDown($event)',
        '(window:keyup)': 'onKeyUp($event)',
    }
})
/**
 * @author Thomas Kleinke
 */
export class FieldEditorModalComponent extends ConfigurationEditorModalComponent {

    public field: Field|undefined;
    public groupName: string;
    public availableInputTypes: Array<InputType>;
    public permanentlyHiddenFields: string[];
    public clonedProjectConfiguration: ProjectConfiguration;

    public clonedField: Field|undefined;
    public hideable: boolean;
    public hidden: boolean;
    public i18nCompatible: boolean;
    public subfieldI18nStrings: Map<{ label?: I18N.String, description?: I18N.String }>;
    public dragging: boolean;
    public topLevelCategoriesArray: Array<CategoryForm>;
    public selectedTargetCategoryNames: string[];
    public availableInverseRelations: string[];

    protected changeMessage = $localize `:@@configuration.fieldChanged:Das Feld wurde geändert.`;


    constructor(activeModal: NgbActiveModal,
                modals: Modals,
                menuService: Menus,
                messages: Messages,
                private labels: Labels) {

        super(activeModal, modals, menuService, messages);
    }


    public getCustomFieldDefinition = () => this.getCustomFormDefinition().fields[this.field.name];

    public getClonedFieldDefinition = () => this.getClonedFormDefinition().fields[this.field.name];

    public getRelationLabel = (relationName: string) => this.labels.getRelationLabel(
        relationName, this.clonedProjectConfiguration.getRelations()
    );

    public isValuelistSectionVisible = () => Field.InputType.VALUELIST_INPUT_TYPES.includes(
        this.getClonedFieldDefinition()?.inputType as Field.InputType ?? this.field.inputType
    ) && !this.field.valuelistFromProjectField;

    public isSubfieldsSectionVisible = () => this.getInputType() === Field.InputType.COMPOSITE;

    public isRelationSectionVisible = () => this.isCustomField() && this.getInputType() === Field.InputType.RELATION;

    public isCustomField = () => this.field.source === 'custom';


    public initialize() {

        super.initialize();

        this.topLevelCategoriesArray = this.clonedProjectConfiguration.getTopLevelCategories();

        if (this.new) {
            this.getClonedFormDefinition().fields[this.field.name] = {
                inputType: 'input',
                constraintIndexed: false
            };
            this.clonedConfigurationDocument = ConfigurationDocument.addField(
                this.clonedConfigurationDocument, this.category, this.permanentlyHiddenFields,
                this.groupName, this.field.name
            );
        } else if (!this.getClonedFieldDefinition()) {
            this.getClonedFormDefinition().fields[this.field.name] = {};
        }

        if (!this.getClonedFieldDefinition().references) this.getClonedFieldDefinition().references = [];
        if (!this.getClonedFieldDefinition().subfields) this.getClonedFieldDefinition().subfields = [];

        this.clonedField = clone(this.field);

        this.hideable = this.isHideable();
        this.hidden = this.isHidden();

        this.subfieldI18nStrings = this.field.subfields?.reduce((result, subfield) => {
            result[subfield.name] = { label: subfield.label, description: subfield.description };
            return result;
        }, {}) ?? {};

        this.initializeSelectedTargetCategories();
        this.updateAvailableInverseRelations();
    }


    public async confirm() {

        if (!this.field.valuelist && this.isValuelistSectionVisible()
                && !this.getClonedFormDefinition().valuelists?.[this.field.name]) {
            return this.messages.add([M.CONFIGURATION_ERROR_NO_VALUELIST]);
        }

        if (this.getClonedFieldDefinition().subfields?.length < 2 && this.isSubfieldsSectionVisible()) {
            return this.messages.add([M.CONFIGURATION_ERROR_NO_SUBFIELDS]);
        }

        try {
            ConfigurationUtil.cleanUpAndValidateReferences(this.getClonedFieldDefinition());
        } catch (errWithParams) {
            return this.messages.add(errWithParams);
        }

        if (!this.isValuelistSectionVisible() && this.getInputType() !== Field.InputType.COMPOSITE
                && this.getClonedFormDefinition().valuelists) {
            delete this.getClonedFormDefinition().valuelists[this.field.name];
        }

        if (isEmpty(this.getClonedFieldDefinition())) {
            delete this.getClonedFormDefinition().fields[this.field.name];
        }

        if (!this.isSubfieldsSectionVisible()) {
            delete this.getClonedFieldDefinition().subfields;
            Object.keys(this.subfieldI18nStrings).forEach(subfieldName => {
                this.subfieldI18nStrings[subfieldName] = {};
            });
        }

        if (this.isRelationSectionVisible()) {
            this.getClonedFieldDefinition().range = this.getRange();
        } else {
            delete this.getClonedFieldDefinition().range;
        }

        await super.confirm(this.isValuelistChanged());
    }


    public getInputType(): Field.InputType {

        return this.getClonedFieldDefinition()?.inputType as Field.InputType
            ?? this.field.inputType as Field.InputType;
    }


    public setInputType(newInputType: Field.InputType) {

        if (!this.availableInputTypes.find(inputType => inputType.name === newInputType).searchable) {
            delete this.getClonedFieldDefinition().constraintIndexed;
        }
        if (newInputType === this.field.inputType && !this.getCustomFieldDefinition()?.inputType) {
            delete this.getClonedFieldDefinition().inputType;
            this.clonedField.inputType = this.field.inputType;
            if (this.getCustomFieldDefinition()?.constraintIndexed) {
                this.getClonedFieldDefinition().constraintIndexed = this.field.constraintIndexed;
            }
        } else {
            this.getClonedFieldDefinition().inputType = newInputType;
            this.clonedField.inputType = newInputType;
        }
    }


    public toggleHidden() {

        const customFormDefinition: CustomFormDefinition = this.getClonedFormDefinition();

        if (this.hidden) {
            customFormDefinition.hidden
                = customFormDefinition.hidden.filter(name => name !== this.field.name);
        } else {
            if (!customFormDefinition.hidden) customFormDefinition.hidden = [];
            customFormDefinition.hidden.push(this.field.name);
        }

        this.hidden = this.isHidden();
    }


    public toggleConstraintIndexed() {

        if (this.field.defaultConstraintIndexed === undefined) {
            this.getClonedFieldDefinition().constraintIndexed = !this.getClonedFieldDefinition().constraintIndexed;
        } else if (this.getClonedFieldDefinition().constraintIndexed === undefined) {
            this.getClonedFieldDefinition().constraintIndexed = !this.field.defaultConstraintIndexed;
        } else {
            delete this.getClonedFieldDefinition().constraintIndexed;
        }
    }


    public isConstraintIndexed() {

        return this.getClonedFieldDefinition()?.constraintIndexed
            || (this.getClonedFieldDefinition()?.constraintIndexed !== false && this.field.constraintIndexed);
    }


    public isConstraintIndexOptionEnabled(): boolean {

        return this.category.name !== 'Project'
            && this.availableInputTypes.find(inputType => inputType.name === this.getInputType()).searchable;
    }


    public getConstraintIndexedTooltip(): string {

       if (this.category.name === 'Project') {
            return $localize `:@@configuration.fieldSpecificSearch.notAllowedForProjectFields:Eine feldspezifische Suche ist für Felder der Projekt-Kategorie nicht möglich.`;
        } else if (!this.availableInputTypes.find(inputType => inputType.name === this.getInputType()).searchable) {
            return $localize `:@@configuration.fieldSpecificSearch.notAllowedForInputType:Eine feldspezifische Suche ist für Felder dieses Eingabetyps nicht möglich.`;
        } else {
            return '';
        }
    }


    public isI18nCompatible(): boolean {

        return Field.InputType.I18N_COMPATIBLE_INPUT_TYPES.includes(this.getInputType())
            && !['staff', 'campaigns'].includes(this.field.name);
    }


    public toggleTargetCategory(category: CategoryForm) {
        
        if (this.selectedTargetCategoryNames.includes(category.name)) {
            this.selectedTargetCategoryNames = this.selectedTargetCategoryNames.filter(categoryName => {
                return categoryName != category.name
                    && this.clonedProjectConfiguration.getCategory(categoryName).parentCategory?.name !== category.name
                    && category.parentCategory?.name !== categoryName;
            });
        } else {
            const categoryNames: string[] = [category].concat(category.children).map(to(Named.NAME));
            this.selectedTargetCategoryNames = set(this.selectedTargetCategoryNames.concat(categoryNames));
        }

        this.updateAvailableInverseRelations();
    }


    public setInverseRelation(relationName) {

        this.getClonedFieldDefinition().inverse = relationName;
    }


    public isSelectedInverseRelation(relationName) {

        return this.getClonedFieldDefinition().inverse === relationName;
    }


    public isChanged(): boolean {

        return this.new
            || this.getCustomFieldDefinition()?.inputType !== this.getClonedFieldDefinition()?.inputType
            || !equal(this.getCustomFormDefinition().hidden)(this.getClonedFormDefinition().hidden)
            || this.isValuelistChanged()
            || this.isConstraintIndexedChanged()
            || this.isSubfieldsChanged()
            || !equal(this.getCustomFieldDefinition()?.range ?? [], this.getRange())
            || this.getCustomFieldDefinition()?.inverse !== this.getClonedFieldDefinition().inverse
            || !equal(this.label)(I18N.removeEmpty(this.clonedLabel))
            || !equal(this.description ?? {})(I18N.removeEmpty(this.clonedDescription))
            || (this.isCustomField() && ConfigurationUtil.isReferencesArrayChanged(this.getCustomFieldDefinition(),
                    this.getClonedFieldDefinition()));
    }


    private isValuelistChanged(): boolean {

        return !equal(this.getCustomFormDefinition().valuelists ?? {})(this.getClonedFormDefinition().valuelists ?? {})
            && this.field.valuelist?.id !== this.getClonedFormDefinition().valuelists[this.field.name];
    }


    private isConstraintIndexedChanged(): boolean {

        return this.getCustomFieldDefinition()?.constraintIndexed !== this.getClonedFieldDefinition()?.constraintIndexed
            || (this.getCustomFieldDefinition()?.constraintIndexed === undefined
                && this.getClonedFieldDefinition()?.constraintIndexed === false)
            || (this.getCustomFieldDefinition()?.constraintIndexed === false
                && this.getClonedFieldDefinition()?.constraintIndexed === undefined);
    }


    private isSubfieldsChanged(): boolean {

        return !equal(this.getCustomFieldDefinition()?.subfields ?? [],
                      this.getClonedFieldDefinition()?.subfields ?? [])
            || this.isSubfieldsI18nChanged();
    }


    private isSubfieldsI18nChanged(): boolean {

        return this.field.subfields?.filter(subfield => {
            return !equal(subfield.label ?? {})(I18N.removeEmpty(this.subfieldI18nStrings[subfield.name]?.label ?? {}))
                || !equal(subfield.description ?? {})(I18N.removeEmpty(this.subfieldI18nStrings[subfield.name]
                    ?.description ?? {}));
        }).length > 0;
    }


    private initializeSelectedTargetCategories() {

        const range: string[] = this.getClonedFieldDefinition().range ?? [];

        this.selectedTargetCategoryNames = range.reduce((result, categoryName) => {
            const category: CategoryForm = this.clonedProjectConfiguration.getCategory(categoryName);
            return result.concat([categoryName])
                .concat(category.children.map(to(Named.NAME)));
        }, []);
    }


    private getRange(): string[] {

        const result: string[] = this.selectedTargetCategoryNames.filter(categoryName => {
            const parentCategory: CategoryForm 
                = this.clonedProjectConfiguration.getCategory(categoryName).parentCategory;
            return !parentCategory || !this.selectedTargetCategoryNames.includes(parentCategory.name);
        });

        result.sort();

        return result;
    }


    private updateAvailableInverseRelations() {

        const relationNames: string[][] = this.selectedTargetCategoryNames
            .map(categoryName => this.clonedProjectConfiguration.getCategory(categoryName))
            .map(category => {
                return CategoryForm.getFields(category)
                    .filter(field => {
                        return field.inputType === Field.InputType.RELATION
                            && ((field as Relation).range.includes(this.category.name)
                                || !(field as Relation).range.length)
                    }).map(to(Named.NAME));
            });
        
        this.availableInverseRelations = intersection(relationNames);
        
        if (!this.availableInverseRelations.includes(this.getClonedFieldDefinition().inverse)) {
            delete this.getClonedFieldDefinition().inverse;
        }
    }


    protected getLabel(): I18N.String {

        return this.field.label;
    }


    protected getDescription(): I18N.String {

        return this.field.description;
    }


    protected updateCustomLanguageConfigurations() {

        CustomLanguageConfigurations.update(
            this.getClonedLanguageConfigurations(), this.clonedLabel, this.clonedDescription,
            this.category, this.clonedField
        );

        Object.keys(this.subfieldI18nStrings).forEach(subfieldName => {
            CustomLanguageConfigurations.update(
                this.getClonedLanguageConfigurations(),
                this.subfieldI18nStrings[subfieldName].label ?? {},
                this.subfieldI18nStrings[subfieldName].description ?? {},
                this.category,
                this.clonedField,
                this.clonedField.subfields.find(subfield => subfield.name === subfieldName)
            );
        });
    }


    private isHideable(): boolean {

        return !OVERRIDE_VISIBLE_FIELDS.includes(this.field.name)
            && this.field.source !== 'custom';
    }


    private isHidden(): boolean {

        return ConfigurationDocument.isHidden(this.getClonedFormDefinition())(this.field);
    }
}
