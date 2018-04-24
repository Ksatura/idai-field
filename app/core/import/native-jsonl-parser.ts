import {Observable} from 'rxjs/Observable';
import {Document} from 'idai-components-2/core';
import {M} from '../../m';
import {AbstractParser} from './abstract-parser';
import {Observer} from 'rxjs/Observer';

/**
 * @author Sebastian Cuy
 * @author Jan G. Wieners
 */
export class NativeJsonlParser extends AbstractParser {


    public parse(content: string): Observable<Document> {
        
        this.warnings = [];
        return Observable.create((observer: Observer<any>) => {
            NativeJsonlParser.parseContent(content, observer, NativeJsonlParser.makeDoc);
            observer.complete();
        });
    }


    private static makeDoc(line: string) {
        
        const resource = JSON.parse(line);
        if (!resource.relations) resource.relations = {};

        return { resource: resource };
    }


    private static parseContent(content: string, observer: any, makeDocFun: Function) {

        const lines = content.split('\n');
        const len = lines.length;

        for (let i = 0; i < len; i++) {

            try {
                if (lines[i].length > 0) observer.next(makeDocFun(lines[i]));
            } catch (e) {
                console.error('parse content error. reason: ', e);
                observer.error([M.IMPORT_FAILURE_INVALIDJSONL, i + 1]);
                break;
            }
        }
    }
}