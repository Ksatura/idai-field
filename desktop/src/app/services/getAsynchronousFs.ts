const fsPromises = typeof window !== 'undefined' ? undefined : require('fs').promises;
const extract = typeof window !== 'undefined' ? undefined : require('extract-zip');


// If called from Electron app: Return fs.promises instance from Electron main process via window['filesystem']
// If called from tests: Return required fs.promises instance
//
// (See: https://github.com/electron/electron/issues/19554#issuecomment-683383337)
export function getAsynchronousFs() {

    return fsPromises ? fsPromisesWrapper : filesystem;
}


const filesystem = {
    isFile: (path: string) => callFsFunction('isFile', path),
    isDirectory: (path: string) => callFsFunction('isDirectory', path),
    writeFile: (path: string, contents: any) => callFsFunction('writeFile', path, contents),
    readFile: (path: string, encoding?: string) => callFsFunction('readFile', path, encoding),
    readdir: (path: string) => callFsFunction('readdir', path),
    mkdir: (path: string, options: any) => callFsFunction('mkdir', path, options),
    rm: (path: string, options: any) => callFsFunction('rm', path, options),
    unlink: (path: string) => callFsFunction('unlink', path),
    extractZip: (source: string, destination: string) => callFsFunction('extractZip', source, destination),
    createCatalogZip: (outputFilePath, filePath, fileName, imageDirPath, imageDirName) =>
        callFsFunction('createCatalogZip', outputFilePath, filePath, fileName, imageDirPath, imageDirName)
};


const fsPromisesWrapper = {
    isFile: (path: string) => isFile(path),
    isDirectory: (path: string) => isDirectory(path),
    writeFile: (path: string, contents: any) => fsPromises.writeFile(path, contents),
    readFile: (path: string, encoding?: string) => fsPromises.readFile(path, encoding),
    readdir: (path: string) => fsPromises.readdir(path),
    mkdir: (path: string, options: any) => fsPromises.mkdir(path, options),
    rm: (path: string, options: any) => fsPromises.rm(path, options),
    unlink: (path: string) => fsPromises.unlink(path),
    extractZip: (source: string, destination: string) => extractZip(source, destination),
    createCatalogZip: () => {} // Not used in tests
};


async function callFsFunction(functionName: string, ...args: any[]): Promise<any> {

    const returnValue = await window['filesystem'][functionName](...args);

    if (returnValue.error) {
        throw returnValue.error;
    } else {
        return await returnValue.result;
    }
}


async function isFile(path: string): Promise<boolean> {

    try {
        const stat = await fsPromises.stat(path);
        return stat.isFile();
    } catch (error) {
        return false;
    }
}


async function isDirectory(path: string): Promise<boolean> {

    try {
        const stat = await fsPromises.stat(path);
        return stat.isDirectory();
    } catch (error) {
        return false;
    }
}


function extractZip(source: string, destination: string): Promise<any> {

    return extract(source, { dir: destination });
}
