import { clone } from 'tsfun';
import { BaseGroupDefinition } from '../model/form/base-form-definition';


/**
 * @author Thomas Kleinke
 */
export function mergeGroupsConfigurations(parentGroups: Array<BaseGroupDefinition>,
                                          childGroups: Array<BaseGroupDefinition>): Array<BaseGroupDefinition> {
                                   
    return childGroups.reduce((result, childGroup) => {
        const parentGroup: BaseGroupDefinition|undefined = result.find(group => group.name === childGroup.name);

        if (parentGroup) {
            parentGroup.fields = parentGroup.fields
                .filter(fieldName => !childGroup.fields.includes(fieldName))
                .concat(childGroup.fields);
        } else {
            result.push(clone(childGroup));
        }
        return result;
    }, clone(parentGroups));
}
