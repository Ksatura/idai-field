import { Map } from 'tsfun';
import { TransientFormDefinition } from '..';
import { Relation } from '../../model/configuration/relation';
import { I18N } from '../../tools/i18n';
import { TransientCategoryDefinition } from '../model/category/transient-category-definition';
import { TransientFieldDefinition, TransientSubfieldDefinition } from '../model/field/transient-field-definition';
import { LanguageConfiguration } from '../model/language/language-configuration';
import { LanguageConfigurations } from '../model/language/language-configurations';
import { Field } from '../../model/configuration/field';


export function applyLanguagesToCategory(languageConfigurations: LanguageConfigurations,
                                         categoryDefinition: TransientCategoryDefinition) {

    applyLanguagesToFormOrCategory(languageConfigurations, categoryDefinition, 'categories', categoryDefinition.name);
    applyLanguagesToCategoryFields(languageConfigurations, categoryDefinition.fields, categoryDefinition.name,
        categoryDefinition.parent);
}


export function applyLanguagesToForm(languageConfigurations: LanguageConfigurations,
                                     formDefinition: TransientFormDefinition, parentCategoryName?: string,
                                     parentFormName?: string) {

    applyLanguagesToFormOrCategory(languageConfigurations, formDefinition, 'categories', formDefinition.categoryName);
    applyLanguagesToFormOrCategory(languageConfigurations, formDefinition, 'forms', formDefinition.name);
    applyLanguagesToFormOrCategory(languageConfigurations, formDefinition, 'categories', formDefinition.categoryName,
        true);
    applyLanguagesToCategoryFields(languageConfigurations, formDefinition.fields, formDefinition.categoryName,
        parentCategoryName);
    applyLanguagesToFormFields(languageConfigurations, formDefinition.fields, formDefinition.name, parentFormName);
    applyLanguagesToCategoryFields(languageConfigurations, formDefinition.fields, formDefinition.categoryName,
        parentCategoryName, true);
}


export function applyLanguagesToFields(languageConfigurations: LanguageConfigurations,
                                       fields: Map<TransientFieldDefinition>, section: 'fields'|'commons') {

    for (const fieldName of Object.keys(fields)) {
        const field = fields[fieldName];

        field.label = I18N.mergeI18nStrings(field.label, LanguageConfiguration.getI18nString(
            languageConfigurations.complete, section, fieldName, false, 'label'
        ));
        field.description = I18N.mergeI18nStrings(field.description, LanguageConfiguration.getI18nString(
            languageConfigurations.complete, section, fieldName, false, 'description'
        ));
        field.defaultLabel = I18N.mergeI18nStrings(field.defaultLabel, LanguageConfiguration.getI18nString(
            languageConfigurations.default, section, fieldName, false, 'label'
        ));
        field.defaultDescription = I18N.mergeI18nStrings(field.defaultDescription, LanguageConfiguration.getI18nString(
            languageConfigurations.default, section, fieldName, false, 'description'
        ));
    }
}


export function applyLanguagesToRelations(languageConfigurations: LanguageConfigurations, relations: Array<Relation>) {

    for (const relation of relations) {
        relation.label = LanguageConfiguration.getI18nString(
            languageConfigurations.complete, 'relations', relation.name, false, 'label'
        );
        relation.defaultLabel = LanguageConfiguration.getI18nString(
            languageConfigurations.default, 'relations', relation.name, false, 'label'
        );
        relation.description = LanguageConfiguration.getI18nString(
            languageConfigurations.complete, 'relations', relation.name, false, 'description'
        );
        relation.defaultDescription = LanguageConfiguration.getI18nString(
            languageConfigurations.default, 'relations', relation.name, false, 'description'
        );
    }
}


function applyLanguagesToCategoryFields(languageConfigurations: LanguageConfigurations,
                                        fields: Map<TransientFieldDefinition>, categoryName: string,
                                        parentCategoryName?: string, onlyCustom?: boolean) {

    applyLanguagesToFormOrCategoryFields(
        languageConfigurations, fields, categoryName, 'categories', parentCategoryName, onlyCustom
    );                           
}


function applyLanguagesToFormFields(languageConfigurations: LanguageConfigurations,
                                    fields: Map<TransientFieldDefinition>, formName: string,
                                    parentFormName?: string, onlyCustom?: boolean) {

    applyLanguagesToFormOrCategoryFields(
        languageConfigurations, fields, formName, 'forms', parentFormName, onlyCustom
    );
}


function applyLanguagesToFormOrCategory(languageConfigurations: LanguageConfigurations,
                                        definition: TransientFormDefinition|TransientCategoryDefinition,
                                        section: 'categories'|'forms', name: string, onlyCustom: boolean = false) {

    definition.label = I18N.mergeI18nStrings(
        definition.label,
        LanguageConfiguration.getI18nString(
            onlyCustom ? languageConfigurations.custom : languageConfigurations.complete,
            section, name, false, 'label'
        )
    );
    if (!onlyCustom) {
        definition.defaultLabel = I18N.mergeI18nStrings(definition.defaultLabel, LanguageConfiguration.getI18nString(
            languageConfigurations.default, section, name, false, 'label'
        ));
    }

    if (!definition.description) {
        definition.description = LanguageConfiguration.getI18nString(
            onlyCustom ? languageConfigurations.custom : languageConfigurations.complete, section, name, false,
            'description'
        );
        if (!onlyCustom) {
            definition.defaultDescription = LanguageConfiguration.getI18nString(
                languageConfigurations.default, section, name, false, 'description'
            );
        }
    }
}


function applyLanguagesToFormOrCategoryFields(languageConfigurations: LanguageConfigurations,
                                              fields: Map<TransientFieldDefinition>, formOrCategoryName: string,
                                              section: 'categories'|'forms', parentName?: string,
                                              onlyCustom?: boolean) {

    for (const fieldName of Object.keys(fields)) {
        const field: TransientFieldDefinition = fields[fieldName];
        applyLanguagesToFormOrCategoryField(
            languageConfigurations, field, fieldName, formOrCategoryName, section, parentName, onlyCustom
        );
        
        if (field.subfields) {
            for (const subfield of field.subfields) {
                applyLanguagesToFormOrCategoryField(
                    languageConfigurations, subfield, fieldName, formOrCategoryName, section, parentName, onlyCustom,
                    subfield.name
                );
            }
        }
    }
}


function applyLanguagesToFormOrCategoryField(languageConfigurations: LanguageConfigurations,
                                             field: TransientSubfieldDefinition, fieldName: string,
                                             formOrCategoryName: string, section: 'categories'|'forms',
                                             parentName?: string, onlyCustom?: boolean, subfieldName?: string) {
            
    if (section === 'categories' && field.inputType === Field.InputType.RELATION) {
        field.label = I18N.mergeI18nStrings(field.label, LanguageConfiguration.getI18nString(
            languageConfigurations.complete, 'relations', fieldName, false, 'label'
        ));
        field.defaultLabel = I18N.mergeI18nStrings(field.defaultLabel, LanguageConfiguration.getI18nString(
            languageConfigurations.default, 'relations', fieldName, false, 'label'
        ));
        field.description = I18N.mergeI18nStrings(field.description, LanguageConfiguration.getI18nString(
            languageConfigurations.complete, 'relations', fieldName, false, 'description'
        ));
        field.defaultDescription = I18N.mergeI18nStrings(field.defaultDescription, LanguageConfiguration.getI18nString(
            languageConfigurations.default, 'relations', fieldName, false, 'description'
        ));
    }


    applyLanguagesToField(
        languageConfigurations, field, fieldName, formOrCategoryName, section, onlyCustom, subfieldName
    );

    if (parentName) {
        applyLanguagesToField(
            languageConfigurations, field, fieldName, parentName, section, onlyCustom, subfieldName
        );
    }
}


function applyLanguagesToField(languageConfigurations: LanguageConfigurations, field: TransientSubfieldDefinition,
                               fieldName: string, formOrCategoryName: string, section: 'categories'|'forms',
                               onlyCustom: boolean = false, subfieldName?: string) {

    field.label = I18N.mergeI18nStrings(field.label, LanguageConfiguration.getI18nString(
        onlyCustom ? languageConfigurations.custom : languageConfigurations.complete,
        section, fieldName, true, 'label', formOrCategoryName, subfieldName
    ));
    field.description = I18N.mergeI18nStrings(field.description, LanguageConfiguration.getI18nString(
        onlyCustom ? languageConfigurations.custom : languageConfigurations.complete,
        section, fieldName, true, 'description', formOrCategoryName, subfieldName
    ));

    if (!onlyCustom) {
        field.defaultLabel = I18N.mergeI18nStrings(field.defaultLabel, LanguageConfiguration.getI18nString(
            languageConfigurations.default, section, fieldName, true, 'label', formOrCategoryName, subfieldName
        ));
        field.defaultDescription = I18N.mergeI18nStrings(field.defaultDescription, LanguageConfiguration.getI18nString(
            languageConfigurations.default, section, fieldName, true, 'description', formOrCategoryName, subfieldName
        ));
    }
}
