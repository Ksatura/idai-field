import {subtract} from 'tsfun';
import { FieldDocument, FieldGeometry, FieldResource } from "idai-components-2";
import { CoordinatesUtility } from './coordinates-utility';
import { SimpleChanges } from '@angular/core';


export module MapComponentHelper {

    type Bounds = any[];


    export function addToBounds(markers: { [id: string]: Array<L.CircleMarker> }, 
                                polygons: { [id: string]: Array<L.Polygon> }, 
                                polylines: { [id: string]: Array<L.Polyline> }) {
        
        return (document: FieldDocument): Bounds => {

            const bounds: any = [];
            const id = document.resource.id;
            
            if (polygons[id]) {
                addPathToBounds(polygons[id], bounds);
            } else if (polylines[id]) {
                addPathToBounds(polylines[id], bounds);
            } else if (markers[id]) {
                addMarkersToBounds(markers[id], bounds);
            }

            return bounds;
        }
    }


    function addPathToBounds(paths: Array<L.Polyline|L.Polygon>, bounds: Bounds) {

        paths.forEach(path => bounds.push(path.getLatLngs()[0]));
    }

    function addMarkersToBounds(markers: Array<L.CircleMarker>, bounds: Bounds) {

        markers.forEach(marker => bounds.push(marker.getLatLng()));
    }


    export function getGeometry(document: FieldDocument): FieldGeometry|undefined {

        const geometry: FieldGeometry|undefined = document.resource.geometry;

        return (geometry && geometry.coordinates && geometry.coordinates.length > 0)
            ? geometry
            : undefined;
    }


    export function hasGeometries(documents: Array<FieldDocument>): boolean {

        return documents.find(this.getGeometry) !== undefined;
    }


    export function getPolylineFromCoordinates(coordinates: Array<any>): L.Polyline {

        return L.polyline(<any> CoordinatesUtility.convertPolylineCoordinatesFromLngLatToLatLng(coordinates));
    }


    export function getPolygonFromCoordinates(coordinates: Array<any>): L.Polygon {

        return L.polygon(<any> CoordinatesUtility.convertPolygonCoordinatesFromLngLatToLatLng(coordinates));
    }


    export function getTooltipText(resource: FieldResource) {

        let shortDescription = resource.identifier;
        if (resource.shortDescription && resource.shortDescription.length > 0) {
            shortDescription += ' | ' + resource.shortDescription;
        }

        return shortDescription;
    }


    export function hasOnlySelectionChanged(changes: SimpleChanges): boolean {

        return (changes['selectedDocument'] || changes['additionalSelectedDocuments'])
            && !changes['documents'] && !changes['parentDocument']
            && !changes['coordinateReferenceSystem'];
    }


    export function getPreviousSelection(changes: SimpleChanges): Array<FieldDocument> {

        const result = changes['selectedDocument']?.previousValue
            ? [changes['selectedDocument'].previousValue]
            : [];

        return changes['additionalSelectedDocuments'].previousValue
            ? result.concat(changes['additionalSelectedDocuments'].previousValue)
            : result;
    }


    export function getDeselectedDocuments(currentSelection: Array<FieldDocument>,
                                          previousSelection: Array<FieldDocument>): Array<FieldDocument> {

        return subtract(currentSelection)(previousSelection);
    }
}
