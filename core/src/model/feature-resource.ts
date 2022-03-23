import { Dating } from './dating';
import { FieldResource } from './field-resource';
import { OptionalRange } from './optional-range';


export interface FeatureResource extends FieldResource {

    relations: FeatureResource.Relations;
    period?: OptionalRange<string>;
    dating: Dating // TODO shouldn't that be Array<Dating>?
}


export namespace FeatureResource {

    export const PERIOD = 'period';


    export interface Relations extends FieldResource.Relations {

        isContemporaryWith: string[];
        isAfter: string[];
        isBefore: string[];
    }    
}
