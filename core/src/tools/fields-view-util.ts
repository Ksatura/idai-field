import {
    aFlow,
    aMap,
    and, assoc, compose,
    empty, equal, filter, Filter, flatten, flow, includedIn,
    is, isArray, isDefined, isNot, isObject, isString, L, lookup, map, Map, Mapping, on,
    or, pairWith, Predicate, R, to, undefinedOrEmpty
} from 'tsfun';
import { ProjectConfiguration } from '../configuration/project-configuration';
import { Datastore } from '../datastore/datastore';
import { Category } from '../model/category';
import { FieldDefinition } from '../model/field-definition';
import { FieldResource } from '../model/field-resource';
import { BaseGroup, Group, Groups } from '../model/group';
import { RelationDefinition } from '../model/relation-definition';
import { Relations } from '../model/relations';
import { Resource } from '../model/resource';
import { ValuelistDefinition } from '../model/valuelist-definition';
import { Labelled, Named } from './named';
import { ValuelistUtil } from './valuelist-util';


type FieldContent = any;


export interface FieldsViewGroup extends BaseGroup {

    shown: boolean;
    relations: Array<FieldsViewRelation>;
    fields: Array<FieldsViewField>;
}


export interface FieldsViewRelation extends Labelled {

    targets: Array<any>;
}


export interface FieldsViewField extends Labelled {

    value: string;
    type: 'default'|'array'|'object';
    valuelist?: ValuelistDefinition;
    positionValues?: ValuelistDefinition;
}


export module FieldsViewGroup {

    export const SHOWN = 'shown';
    export const RELATIONS = 'relations';
    export const FIELDS = 'fields';
}


/**
 * @author Thomas Kleinke
 * @author Sebastian Cuy
 * @author Daniel de Oliveira
 */
export module FieldsViewUtil {

    export function getValue(fieldContent: any, fieldName: string, projectConfiguration: ProjectConfiguration,
                             valuelist?: ValuelistDefinition): any {

        return fieldName === Resource.CATEGORY
            ? projectConfiguration.getLabelForCategory(fieldContent)
            : valuelist
                ? ValuelistUtil.getValueLabel(valuelist, fieldContent)
                : isString(fieldContent)
                    ? fieldContent
                        .replace(/^\s+|\s+$/g, '')
                        .replace(/\n/g, '<br>')
                    : fieldContent;
    }


    export function filterRelationsToShowFor(resource: Resource): Filter<Array<RelationDefinition>> {

        return filter(
            on(Named.NAME,
                and(
                    isNot(includedIn(Relations.Hierarchy.ALL)),
                    isNot(equal(Relations.Image.ISDEPICTEDIN)),
                    isNot(equal(Relations.Image.HASMAPLAYER)),
                    compose(lookup(resource.relations), isNot(undefinedOrEmpty))
                )
            )
        );
    }


    export const isVisibleField: Predicate<FieldDefinition> = or(
        on(FieldDefinition.VISIBLE, is(true)),
        on(Named.NAME, is(Resource.CATEGORY)),
        on(Named.NAME, is(FieldResource.SHORTDESCRIPTION))
    );


    export const shouldBeDisplayed: Predicate<FieldsViewGroup> = or(
        on(FieldsViewGroup.FIELDS, isNot(empty)),
        on(FieldsViewGroup.RELATIONS, isNot(empty))
    );


    export function getGroups(category: string, categories: Map<Category>) {

        return flow(category,
            lookup(categories),
            to(Category.GROUPS),
            map(group =>
                assoc<any>(
                    FieldsViewGroup.SHOWN,
                    group.name === Groups.STEM)(group)
            ));
    }


    export async function getGroupsForResource(
        resource: Resource,
        projectConfiguration: ProjectConfiguration,
        datastore: Datastore
    ): Promise<Array<FieldsViewGroup>> {

        return await aFlow(
            FieldsViewUtil.getGroups(resource.category, Named.arrayToMap(projectConfiguration.getCategoriesArray())),
            putActualResourceRelationsIntoGroups(resource, datastore),
            putActualResourceFieldsIntoGroups(resource, projectConfiguration),
            filter(shouldBeDisplayed)
        );
    }
}


function putActualResourceRelationsIntoGroups(resource: Resource, datastore: Datastore) {

    return ($: any) => aMap(async (group: any /* ! modified in place ! */) => {

        group.relations = await aFlow(
            group.relations,
            FieldsViewUtil.filterRelationsToShowFor(resource),
            aMap(async (relation: RelationDefinition) => {
                return {
                    label: relation.label,
                    targets: await datastore.getMultiple(resource.relations[relation.name])
                }
            })
        );
        return group;
    }, $);
}


function putActualResourceFieldsIntoGroups(resource: Resource, projectConfiguration: ProjectConfiguration): Mapping {

    const fieldContent: Mapping<FieldDefinition, FieldContent>
        = compose(to(Named.NAME), lookup(resource));

    return map(
        assoc(Group.FIELDS,
            compose(
                map(pairWith(fieldContent)),
                filter(on(R, isDefined)),
                filter(on(L, FieldsViewUtil.isVisibleField)),
                map(makeField(projectConfiguration)),
                flatten() as any /* TODO review typing*/
            )
        )
    );
}


function makeField(projectConfiguration: ProjectConfiguration) {

    return function([field, fieldContent]: [FieldDefinition, FieldContent]): FieldsViewField {

        return {
            label: field.label,
            value: isArray(fieldContent)
                ? fieldContent.map((fieldContent: any) =>
                    FieldsViewUtil.getValue(
                        fieldContent, field.name, projectConfiguration, field.valuelist
                    )
                )
                : FieldsViewUtil.getValue(
                    fieldContent, field.name, projectConfiguration, field.valuelist
                ),
            type: isArray(fieldContent) ? 'array' : isObject(fieldContent) ? 'object' : 'default',
            valuelist: field.valuelist,
            positionValues: field.positionValues
        };
    }
}
