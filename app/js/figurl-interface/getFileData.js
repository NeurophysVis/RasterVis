import sendRequestToParent from './sendRequestToParent';
import deserializeReturnValue from './deserializeReturnValue';

const getFileData = (
  uri,
  responseType,
  onProgress,
  o = {}
) => {
  let responseType2
  if (responseType === 'json-deserialized') {
    responseType2 = 'json'
  }
  else {
    responseType2 = responseType
  }
  const request = {
    type: 'getFileData',
    uri,
    responseType: responseType2,
    figurlProtocolVersion: 'p1'
  };
  if (o.startByte !== undefined) {
    request.startByte = o.startByte;
    request.endByte = o.endByte;
  }
  progressListeners[uri] = ({ loaded, total }) => {
    onProgress({ loaded, total });
  };
  return new Promise((resolve, reject) => {
    sendRequestToParent(request).then(response => {
      if (!isGetFileDataResponse(response)) throw Error('Invalid response to getFigureData');
      if (response.errorMessage) {
        throw Error(`Error getting file data for ${uri}: ${response.errorMessage}`);
      }
      if (responseType === 'json-deserialized') {
        resolve(deserializeReturnValue(response.fileData));
      }
      else {
        resolve(response.fileData);
      }
    })
      .catch((err) => {
        reject(err);
      })
  })
};

export const getFileDataUrl = (uri) => {
  const request = {
    type: 'getFileDataUrl',
    uri,
    figurlProtocolVersion: 'p1'
  };
  return new Promise((resolve, reject) => {
    sendRequestToParent(request).then(response => {
      if (!isGetFileDataUrlResponse(response)) throw Error('Invalid response to getFigureUrlData');
      if (!response.fileDataUrl || response.errorMessage) {
        throw Error(`Error getting file data for ${uri}: ${response.errorMessage}`);
      }
      resolve(response.fileDataUrl);
    })
      .catch((err) => {
        reject(err);
      })
  })
}

const progressListeners = {};

export const handleFileDownloadProgress = ({
  uri,
  loaded,
  total,
}) => {
  const x = progressListeners[uri];
  if (x) {
    x({ loaded, total });
  }
};
