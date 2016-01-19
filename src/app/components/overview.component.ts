import {Component, OnInit} from 'angular2/core';
import {PouchdbDatastore} from '../services/pouchdb-datastore';
import {Datastore} from '../services/datastore';
import {IdaiFieldObject} from '../model/idai-field-object';
import {provide} from "angular2/core";

@Component({
    templateUrl: 'templates/overview.html'
})

/**
 * @author Sebastian Cuy
 * @author Daniel M. de Oliveira
 */
export class OverviewComponent implements OnInit {

    public selectedObject: IdaiFieldObject;
    public objects: IdaiFieldObject[];

    constructor(private datastore: Datastore) {
    }

    deepCopyObject(from: IdaiFieldObject,to: IdaiFieldObject) {
        to._id = from._id;
        to.title = from.title;
        to._rev = from._rev;
        to.synced = from.synced;
    }

    onSelect(object: IdaiFieldObject) {
        this.selectedObject = { _id: "", title: "", _rev: "", synced: true};
        this.deepCopyObject(object,this.selectedObject);
    }

    getObjectIndex( id: String ) {
        for (var i in this.objects) {
            if (this.objects[i]._id==id) return i;
        }
        return null;
    }

    save(object: IdaiFieldObject) {

        this.datastore.save(object).then(
            data=>{
                this.deepCopyObject(
                    object,
                    this.objects[this.getObjectIndex(object._id)]
                );
                this.objects[this.getObjectIndex(object._id)].synced = false;
            },
            err=>{console.log(err)}
        )
    }

    ngOnInit() {
        this.datastore.all({}).then(objects => {

            // ToDo: Remove
            for (var o of objects) o.synced=true;
            this.objects = objects;
            console.log(this.objects)
        });
    }
}