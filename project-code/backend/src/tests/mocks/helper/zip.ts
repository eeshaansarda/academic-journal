import {IZipCompressor, IZipExtractor, IZipSender} from "@helper/zip/zip";
import sinon from "sinon";

export class ZipCompressorMock implements IZipCompressor {
    compressToZip = sinon.stub();
}

export class ZipExtractorMock implements IZipExtractor {
    getFileAsString = sinon.stub();
    getFileEntries = sinon.stub();
    deleteZip = sinon.stub();
}

export class ZipSenderMock implements IZipSender {
    sendZip = sinon.stub();
}