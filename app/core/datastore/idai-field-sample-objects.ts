import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';

export const DOCS: IdaiFieldDocument[] = [
    {
        "resource": {
            "id": "test",
            "identifier": "test",
            "shortDescription": "Testprojekt",
            "relations": {
                "isRecordedIn": []
            },
            "type": "Project"
        }
    },
    {
        "resource": {
            "id": "t1",
            "identifier": "trench1",
            "shortDescription": "Goldener Schnitt",
            "relations": {
                "isRecordedIn": [ "test" ]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [27.18926513195038, 39.14123618602753],
                    [27.18935239315033, 39.141262888908386],
                    [27.18937313556671, 39.14121866226196],
                    [27.18929159641266, 39.14118945598602],
                    [27.18926513195038, 39.14123618602753]]]
            },
            "type": "Trench"
        }
    },
    {
        "resource": {
            "id": "c1",
            "identifier": "context1",
            "shortDescription": "Ein Befund",
            "relations": {
                "isRecordedIn": [ "t1" ],
                "includes": [ "tf1" ]
            },
            "geometry": {
                "type": "Point",
                "coordinates": [ 27.189335823059082, 39.141223192214966 ]
            },
            "type": "Feature"
        }
    },
    {
        "resource": {
            "id": "tf1",
            "identifier": "testf1",
            "shortDescription": "Testfund",
            "relations": {
                "isRecordedIn": [ "t1" ],
                "liesWithin": [ "c1" ]
            },
            "geometry": {
                "type": "Point",
                "coordinates": [ 27.189337372779846, 39.14122772216797 ]
            },
            "type": "Find"
        }
    },
    {
        "resource": {
            "id": "o25",
            "identifier": "PE07-So-07_Z001.jpg",
            "shortDescription": "Test Layer 1",
            "type": "Drawing",
            "originalFilename" : "PE07-So-07_Z001.jpg",
            "height" : 2423,
            "width" : 3513,
            "relations": {
                "isRecordedIn" : []
            },
            "georeference": {
                "bottomLeftCoordinates": [39.1411810096, 27.1892609283],
                "topLeftCoordinates": [39.1412672328, 27.1892609283],
                "topRightCoordinates": [39.1412672328, 27.1893859555]
            }
        }
    },
    {
        "resource": {
            "id": "o26",
            "identifier": "mapLayerTest2.png",
            "shortDescription": "Test Layer 2",
            "type": "Image",
            "relations": {
                "isRecordedIn" : []
            },
            "originalFilename" : "mapLayerTest2.png",
            "height" : 782,
            "width" : 748,
            "georeference": {
                "bottomLeftCoordinates": [39.1412810096, 27.1893609283],
                "topLeftCoordinates": [39.1413672328, 27.1893609283],
                "topRightCoordinates": [39.1413672328, 27.1894859555]
            }
        }
    }
];
