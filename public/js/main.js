(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash-es/merge'), require('d3-queue/src/queue')) :
    typeof define === 'function' && define.amd ? define('rasterVis', ['exports', 'lodash-es/merge', 'd3-queue/src/queue'], factory) :
    (factory((global.rasterVis = global.rasterVis || {}),global.merge,global.queue));
}(this, function (exports,merge,queue) { 'use strict';

    merge = 'default' in merge ? merge['default'] : merge;
    queue = 'default' in queue ? queue['default'] : queue;

    function loading (isLoading, neuronName) {
      if (!isLoading) {
        d3.selectAll('#chart svg').attr('display', 'none');
        d3.select('#chart')
          .append('text')
          .attr('class', 'loading')
          .html('Loading... ' + neuronName);
      } else {
        d3.select('.loading').remove();
        d3.selectAll('#chart svg').attr('display', '');
      }
    }

    // const urlSearchParams = new URLSearchParams(window.location.search)
    // const queryParams = Object.fromEntries(urlSearchParams.entries())

    function parseQuery$1(queryString) {
      const ind = queryString.indexOf('?');
      if (ind < 0) return {};
      const query = {};
      const pairs = queryString.slice(ind + 1).split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
    }

    // Important to do it this way because it is difficult to handle special characters (especially #) by using URLSearchParams or window.location.search
    const queryParams$1 = parseQuery$1(window.location.href);

    const sendMessageToParent = (x, { parentOrigin }) => {
      const parentOrOpenerWindow = queryParams$1.useOpener === '1' ? window.opener : window.parent;
      // if no parent, this will post to itself
      parentOrOpenerWindow.postMessage(x, parentOrigin);
    };

    // const urlSearchParams = new URLSearchParams(window.location.search)
    // const queryParams = Object.fromEntries(urlSearchParams.entries())

    function parseQuery(queryString) {
      const ind = queryString.indexOf('?');
      if (ind < 0) return {};
      const query = {};
      const pairs = queryString.slice(ind + 1).split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
    }

    // Important to do it this way because it is difficult to handle special characters (especially #) by using URLSearchParams or window.location.search
    const queryParams = parseQuery(window.location.href);

    const pendingRequests = {};

    const handleFigurlResponse = (msg) => {
      const requestId = msg.requestId;
      const response = msg.response;
      if (requestId in pendingRequests) {
        pendingRequests[requestId].onResponse(response);
        delete pendingRequests[requestId];
      }
    };

    let initalizationData = undefined;
    const _initializationCallbacks = [];
    window.addEventListener('message', (e) => {
      if (initalizationData) return;
      const msg = e.data;
      if (msg.type === 'initializeFigure') {
        initalizationData = {
          parentOrigin: msg.parentOrigin,
          figureId: msg.figureId,
          s: msg.s,
        };
        _initializationCallbacks.forEach((cb) => {
          cb();
        });
      }
    });

    const onInitialized = (callback) => {
      if (initalizationData) {
        callback();
      } else {
        _initializationCallbacks.push(callback);
      }
    };

    const waitForInitialization = () => {
      return new Promise((resolve, reject) => {
        const figureId = queryParams.figureId;
        const parentOrigin = queryParams.parentOrigin;
        const s = queryParams.s || '';
        if (figureId !== undefined && parentOrigin !== undefined) {
          resolve({ parentOrigin, figureId, s });
        } else {
          onInitialized(() => {
            if (!initalizationData) throw Error('unexpected');
            resolve({
              parentOrigin: initalizationData.parentOrigin,
              figureId: initalizationData.figureId,
              s: initalizationData.s,
            });
          });
        }
      });
    };

    const sendRequestToParent = (request) => {
      return new Promise((resolve, reject) => {
        waitForInitialization().then(({ figureId, parentOrigin }) => {
          const requestId = randomAlphaString(10);
          let completed = false;
          pendingRequests[requestId] = {
            onResponse: (response) => {
              if (completed) return;
              completed = true;
              resolve(response);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (err) => {
              if (completed) return;
              completed = true;
              reject(err);
            },
          };
          const msg = {
            type: 'figurlRequest',
            figureId,
            requestId,
            request,
          };
          sendMessageToParent(msg, { parentOrigin });
        })
        .catch((err) => {
          reject(err);
        });
      });
    };

    const randomAlphaString = (num_chars) => {
      if (!num_chars) {
        throw Error('randomAlphaString: num_chars needs to be a positive integer.');
      }
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      for (let i = 0; i < num_chars; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deserializeReturnValue = (x) => {
      if (!x) return x;
      else if (typeof x === 'object') {
        if (Array.isArray(x)) {
          return x.map((a) => deserializeReturnValue(a));
        } else if (x._type === 'ndarray') {
          const shape = x.shape;
          const dtype = x.dtype;
          const data_b64 = x.data_b64;
          const dataBuffer = _base64ToArrayBuffer(data_b64);
          switch (dtype) {
            case 'float32':
              return applyShape(new Float32Array(dataBuffer), shape);
            case 'int32':
              return applyShape(new Int32Array(dataBuffer), shape);
            case 'int16':
              return applyShape(new Int16Array(dataBuffer), shape);
            case 'int8':
              return applyShape(new Int8Array(dataBuffer), shape);
            case 'uint32':
              return applyShape(new Uint32Array(dataBuffer), shape);
            case 'uint16':
              return applyShape(new Uint16Array(dataBuffer), shape);
            case 'uint8':
              return applyShape(new Uint8Array(dataBuffer), shape);
            default:
              throw Error(`Datatype not yet implemented for ndarray: ${dtype}`);
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ret = {};
          for (const k in x) {
            ret[k] = deserializeReturnValue(x[k]);
          }
          return ret;
        }
      } else return x;
    };

    const applyShape = (
      x,
      shape
    ) => {
      if (shape.length === 1) {
        if (shape[0] !== x.length) throw Error('Unexpected length of array');
        return Array.from(x);
      } else if (shape.length === 2) {
        const n1 = shape[0];
        const n2 = shape[1];
        if (n1 * n2 !== x.length) throw Error('Unexpected length of array');
        const ret = [];
        for (let i1 = 0; i1 < n1; i1++) {
          ret.push(Array.from(x.slice(i1 * n2, (i1 + 1) * n2)));
        }
        return ret;
      } else if (shape.length === 3) {
        const n1 = shape[0];
        const n2 = shape[1];
        const n3 = shape[2];
        if (n1 * n2 * n3 !== x.length) throw Error('Unexpected length of array');
        const ret = [];
        for (let i1 = 0; i1 < n1; i1++) {
          const A = [];
          for (let i2 = 0; i2 < n2; i2++) {
            A.push(Array.from(x.slice(i1 * n2 * n3 + i2 * n3, i1 * n2 * n3 + (i2 + 1) * n3)));
          }
          ret.push(A);
        }
        return ret;
      } else if (shape.length === 4) {
        const n1 = shape[0];
        const n2 = shape[1];
        const n3 = shape[2];
        const n4 = shape[3];
        if (n1 * n2 * n3 * n4 !== x.length) throw Error('Unexpected length of array');
        const ret = [];
        for (let i1 = 0; i1 < n1; i1++) {
          const A = [];
          for (let i2 = 0; i2 < n2; i2++) {
            const B = [];
            for (let i3 = 0; i3 < n3; i3++) {
              B.push(
                Array.from(
                  x.slice(i1 * n2 * n3 * n4 + i2 * n3 * n4 + i3 * n4, i1 * n2 * n3 * n4 + i2 * n3 * n4 + (i3 + 1) * n4)
                )
              );
            }
            A.push(B);
          }
          ret.push(A);
        }
        return ret;
      } else if (shape.length === 5) {
        const n1 = shape[0];
        const n2 = shape[1];
        const n3 = shape[2];
        const n4 = shape[3];
        const n5 = shape[4];
        if (n1 * n2 * n3 * n4 * n5 !== x.length) throw Error('Unexpected length of array');
        const request = [];
        for (let i1 = 0; i1 < n1; i1++) {
          const A = [];
          for (let i2 = 0; i2 < n2; i2++) {
            const B = [];
            for (let i3 = 0; i3 < n3; i3++) {
              const C = [];
              for (let i4 = 0; i4 < n4; i4++) {
                C.push(
                  Array.from(
                    x.slice(
                      i1 * n2 * n3 * n4 * n5 + i2 * n3 * n4 * n5 + i3 * n4 * n5 + i4 * n5,
                      i1 * n2 * n3 * n4 * n5 + i2 * n3 * n4 * n5 + i3 * n4 * n5 + (i4 + 1) * n5
                    )
                  )
                );
              }
              B.push(C);
            }
            A.push(B);
          }
          ret.push(A);
        }
        return ret;
      } else {
        throw Error('Not yet implemented');
      }
    };

    const _base64ToArrayBuffer = (base64) => {
      const binary_string = window.atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    };

    const getFigureData = () => {
      return new Promise((resolve, reject) => {
        const request = {
          type: 'getFigureData',
          figurlProtocolVersion: 'p1'
        };
        sendRequestToParent(request).then(response => {
          resolve(deserializeReturnValue(response.figureData));
        }).catch((err) => {
          reject(err);
        })
      })
    };

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

    const progressListeners = {};

    const handleFileDownloadProgress = ({
      uri,
      loaded,
      total,
    }) => {
      const x = progressListeners[uri];
      if (x) {
        x({ loaded, total });
      }
    };

    // import { handleReportUrlStateChange } from './SetupUrlState';

    // const urlSearchParams = new URLSearchParams(window.location.search)
    // const queryParams = Object.fromEntries(urlSearchParams.entries())

    const handleSetCurrentUser = (o) => {
      console.warn('Not implemented: handleSetCurrentUser', o);
    };

    function parseQuery$2(queryString) {
      const ind = queryString.indexOf('?');
      if (ind < 0) return {};
      const query = {};
      const pairs = queryString.slice(ind + 1).split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
    }

    // Important to do it this way because it is difficult to handle special characters (especially #) by using URLSearchParams or window.location.search
    const queryParams$2 = parseQuery$2(window.location.href);

    // if (!queryParams.parentOrigin) {
    //     // self-contained bundle
    //     const s = document.createElement("script");
    //     s.setAttribute("src", "figurlData.js");
    //     document.body.appendChild(s);
    // }

    const startListeningToParent = () => {
      window.addEventListener('message', (e) => {
        const msg = e.data;
        if (!msg) return;
        const messageToChildTypes = ['figurlResponse', 'setCurrentUser', 'fileDownloadProgress', 'reportUrlStateChange']
        const messageToParentTypes = ['figurlRequest']
        if (messageToChildTypes.includes(msg.type)) {
          if (msg.type === 'figurlResponse') {
            handleFigurlResponse(msg);
          } else if (msg.type === 'setCurrentUser') {
            handleSetCurrentUser({
              userId: msg.userId,
              googleIdToken: msg.googleIdToken,
            });
          } else if (msg.type === 'fileDownloadProgress') {
            handleFileDownloadProgress({
              uri: msg.uri,
              loaded: msg.loaded,
              total: msg.total,
            });
          } else if (msg.type === 'reportUrlStateChange') {
            console.warn('Not supported: reportUrlStateChange')
            // handleReportUrlStateChange(msg.state);
          }
        } else if (messageToParentTypes.includes(msg.type)) {
          // this is relevant for standalone (self-contained) figures
          if (queryParams$2.parentOrigin) {
            console.warn('Got message to parent even though parentOrigin is defined');
            return;
          }
          if (msg.type === 'figurlRequest') {
            const req = msg.request;
            if (req.type === 'getFigureData') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const figureData = (window).figurlData.figure;
              const resp = {
                type: 'getFigureData',
                figureData,
              };
              const msg2 = {
                type: 'figurlResponse',
                requestId: msg.requestId,
                response: resp,
              };
              window.postMessage(msg2, '*');
            } else if (req.type === 'getFileData') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const fileData = (window).figurlData.uri[req.uri];
              const resp = {
                type: 'getFileData',
                fileData,
              };
              const msg2 = {
                type: 'figurlResponse',
                requestId: msg.requestId,
                response: resp,
              };
              window.postMessage(msg2, '*');
            }
          }
        } else {
          console.warn('Unhandled message from parent', e);
        }
      });
    };

    let figurlObjectLoadState = "not-loaded";

    function fetchFigurlObject() {
      return new Promise((resolve, reject) => {
        getFigureData().then((data) => {
          resolve(data)
        }).catch((err) => {
          reject(err)
        });
      });
    }

    function getFigurlObject(callback) {
      // check if this window is the top-level window
      if (window === window.parent) {
        // this is the top-level window, so it is not being embedded in an iframe
        callback(null, null);
        return
      }

      if (figurlObjectLoadState === "loading") {
        setTimeout(() => {
          getFigurlObject(callback);
        }, 10);
      } else if (figurlObjectLoadState === "loaded") {
        callback(null, window.figurlObject);
      } else if (figurlObjectLoadState === "error") {
        callback("Error loading figurlObject", null);
      } else {
        figurlObjectLoadState = "loading";
        // fetch("figurl_data.json")
        // .then((response) => response.json())
        fetchFigurlObject()
          .then((figurlObject) => {
            window.figurlObject = figurlObject;
            figurlObjectLoadState = "loaded";
            callback(null, figurlObject);
          })
          .catch((error) => {
            figurlObjectLoadState = "error";
            callback(error, null);
          });
      }
    }

    function loadTrialInfo(callback) {
      getFigurlObject((err, figurlObject) => {
        if (figurlObject) {
          callback(null, figurlObject.objects["trialInfo"]);
        } else {
          fetch("DATA/" + "trialInfo.json")
            .then((response) => response.json())
            .then((trialInfo) => {
              callback(null, trialInfo);
            })
            .catch((error) => {
              callback(error, null);
            });
        }
      });
    }

    function loadSessionTrialData(sessionName, callback) {
      getFigurlObject((err, figurlObject) => {
        if (figurlObject) {
          callback(null, figurlObject.objects[sessionName + "_TrialInfo"]);
        } else {
          fetch("DATA/" + sessionName + "_TrialInfo.json")
            .then((response) => response.json())
            .then((trialData) => {
              callback(null, trialData);
            })
            .catch((error) => {
              callback(error, null);
            });
        }
      });
    }

    function loadNeuronData(neuronName, callback) {
      getFigurlObject((err, figurlObject) => {
        if (figurlObject) {
          callback(null, figurlObject.objects["Neuron_" + neuronName]);
        } else {
          fetch("DATA/Neuron_" + neuronName + ".json")
            .then((response) => response.json())
            .then((neuron) => {
              callback(null, neuron);
            })
            .catch((error) => {
              callback(error, null);
            });
        }
      });
    }

    startListeningToParent();

    function rasterDataManager () {
      let neuronName = '';
      let sessionName = '';
      let brainArea = '';
      let Subject = '';
      let timeDomain = [];
      let factorList = [];
      let trialEvents = [];
      let neuronList = [];
      let includeBrainAreas = [];
      let rasterData = {};
      let spikeInfo = {};
      let sessionInfo = {};
      let showSpikes = true;
      let showSmoothingLines = true;
      let lineSmoothness = 20;
      let curFactor = 'trial_id';
      let curEvent = 'start_time';
      let interactionFactor = '';
      let isLoaded = false;
      let dispatch = d3.dispatch('dataReady');
      let dataManager = {};
      let colorScale = d3.scale.ordinal().domain(['Spike']).range(['black']);

      dataManager.loadRasterData = function () {
        isLoaded = false;
        loadTrialInfo((error, trialInfo) => {
          factorList = trialInfo.experimentalFactor;
          trialEvents = trialInfo.timePeriods;
          neuronList = trialInfo.neurons;
          includeBrainAreas = d3.map(neuronList, function (d) { return d.brainArea; }).keys();

          if (neuronName === '') {
            neuronName = neuronList.length ? neuronList[0].name : neuronList.name;
          };

          loading(isLoaded, neuronName);

          let neuronInfo = neuronList.length ? neuronList.filter(function (d) {
            return d.name === neuronName;
          })[0] : neuronList;

          sessionName = neuronInfo.sessionName;
          Subject = neuronInfo.subjectName;

          queue()
            .defer(loadSessionTrialData, sessionName)
            .defer(loadNeuronData, neuronName)
            .await(function (error, sI, neuron) {
              spikeInfo = neuron.Spikes;
              brainArea = neuron.Brain_Area;
              sessionInfo = sI;
              isLoaded = true;
              loading(isLoaded);

              if (interactionFactor.length > 0) {
                let factorLevels = d3.set(sessionInfo.map(function (s) {
                  return s[interactionFactor];
                })).values();

                let interactingFactorType = factorList.filter(function (d) {
                  return d.value === interactionFactor;
                })
                  .map(function (d) { return d.factorType; })[0].toUpperCase();

                factorLevels = factorLevels
                  .filter(function (k) { return k.key !== 'null'; });

                (interactingFactorType === 'CONTINUOUS') ? factorLevels.sort(d3.ascending()) :
                  factorLevels.sort();

                colorScale = d3.scale.ordinal()
                  .domain(factorLevels)
                  .range(['#e41a1c', '#377eb8', '#66a61e', '#984ea3', '#ff7f00']);
              }

              dataManager.sortRasterData();
              dataManager.changeEvent();
              dispatch.dataReady();

            });
        });

      };

      dataManager.changeEvent = function () {
        let minTime = d3.min(sessionInfo, function (s) { return s.start_time - s[curEvent]; });

        let maxTime = d3.max(sessionInfo, function (s) { return s.end_time - s[curEvent]; });

        timeDomain = [minTime, maxTime];
      };

      dataManager.sortRasterData = function () {
        rasterData = merge(sessionInfo, spikeInfo);
        let factorType = factorList.filter(function (d) { return d.value === curFactor; })
          .map(function (d) { return d.factorType; })[0].toUpperCase();

        // Nest and Sort Data
        if (factorType !== 'CONTINUOUS') {
          rasterData = d3.nest()
            .key(function (d) { return d[curFactor] + '_' + sessionName; }) // nests data by selected factor
            .sortKeys(function (a, b) {
              // Sort ordinal keys
              if (factorType === 'ORDINAL') return d3.descending(+a[curFactor], +b[curFactor]);
            })
            .sortValues(function (a, b) {
              // If interaction factor is specified, then sort by that as well
              if (interactionFactor.length > 0) {
                return d3.descending(a[interactionFactor], b[interactionFactor]);
              } else {
                // else sort by trial id
                return d3.descending(+a.trial_id, +b.trial_id);
              };
            })
            .entries(rasterData);
        } else {
          rasterData = d3.nest()
            .key(function (d) { return d[''] + '_' + sessionName; }) // nests data by selected factor
            .sortValues(function (a, b) { // sorts values on factor if continuous
              return d3.descending(+a[curFactor], +b[curFactor]);
            })
            .entries(rasterData);
        }
      };

      dataManager.neuronName = function (value) {
        if (!arguments.length) return neuronName;
        neuronName = value;
        dataManager.loadRasterData();
        return dataManager;
      };

      dataManager.brainArea = function (value) {
        if (!arguments.length) return brainArea;
        brainArea = value;
        return dataManager;
      };

      dataManager.sessionName = function (value) {
        if (!arguments.length) return sessionName;
        sessionName = value;
        return dataManager;
      };

      dataManager.interactionFactor = function (value) {
        if (!arguments.length) return interactionFactor;
        interactionFactor = value;
        return dataManager;
      };

      dataManager.rasterData = function (value) {
        if (!arguments.length) return rasterData;
        rasterData = value;
        return dataManager;
      };

      dataManager.showSpikes = function (value) {
        if (!arguments.length) return showSpikes;
        showSpikes = value;
        if (isLoaded) dispatch.dataReady();
        return dataManager;
      };

      dataManager.showSmoothingLines = function (value) {
        if (!arguments.length) return showSmoothingLines;
        showSmoothingLines = value;
        if (isLoaded) dispatch.dataReady();
        return dataManager;
      };

      dataManager.lineSmoothness = function (value) {
        if (!arguments.length) return lineSmoothness;
        lineSmoothness = value;
        if (isLoaded) dispatch.dataReady();
        return dataManager;
      };

      dataManager.curFactor = function (value) {
        if (!arguments.length) return curFactor;
        curFactor = value;
        if (isLoaded) dataManager.sortRasterData(); dispatch.dataReady();
        return dataManager;
      };

      dataManager.curEvent = function (value) {
        if (!arguments.length) return curEvent;
        curEvent = value;
        if (isLoaded) dataManager.changeEvent(); dispatch.dataReady();
        return dataManager;
      };

      dataManager.timeDomain = function (value) {
        if (!arguments.length) return timeDomain;
        timeDomain = value;
        return dataManager;
      };

      dataManager.factorList = function (value) {
        if (!arguments.length) return factorList;
        factorList = value;
        return dataManager;
      };

      dataManager.trialEvents = function (value) {
        if (!arguments.length) return trialEvents;
        trialEvents = value;
        return dataManager;
      };

      dataManager.neuronList = function (value) {
        if (!arguments.length) return neuronList;
        neuronList = value;
        return dataManager;
      };

      dataManager.colorScale = function (value) {
        if (!arguments.length) return colorScale;
        colorScale = value;
        return dataManager;
      };

      dataManager.includeBrainAreas = function (value) {
        if (!arguments.length) return includeBrainAreas;
        includeBrainAreas = value;
        if (isLoaded) dispatch.dataReady();
        return dataManager;
      };

      d3.rebind(dataManager, dispatch, 'on');

      return dataManager;

    }

    /**
     * Renders spikes on a canvas with a fade-in animation
     *
     * @param {HTMLCanvasElement} canvas The canvas element to draw on.
     * @param {Array<Object>} sessionInfo The data array containing trial and spike information.
     * @param {Function} timeScale The D3 time scale from rasterChart.js.
     * @param {Function} yScale The D3 ordinal scale from rasterChart.js.
     * @param {string} curEvent The current event to align spike times to.
     * @param {string} interactionFactor The factor for coloring spikes.
     * @param {Function} colorScale The D3 color scale.
     * @param {number} [duration=1000] The duration of the fade-in animation.
     */
    function animateSpikesOnCanvas(
        canvas,
        sessionInfo,
        timeScale,
        yScale,
        curEvent,
        interactionFactor,
        colorScale,
        duration = 1000
    ) {
        const context = canvas.getContext('2d');

        // Stop any previously running animation on this canvas to prevent conflicts.
        if (canvas.__animation_timer) {
            canvas.__animation_timer.stop();
        }

        // Prepare spike data using logic derived from the original drawSpikes.js
        const spikeData = sessionInfo.flatMap((trial, ind) => {
            if (!Array.isArray(trial.spikes)) {
                return [];
            }
            return trial.spikes.map(spike => [spike - trial[curEvent], ind]);
        });
        const factorLevel = sessionInfo.map(d => d[interactionFactor]);
        const circleRadius = yScale.rangeBand() / 2;

        const animationTimer = d3.timer(elapsed => {
            // Clear the entire canvas on each frame of the animation.
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate animation progress as a value from 0.0 to 1.0.
            const progress = Math.min(1, elapsed / duration);

            const currentOpacity = d3.interpolate(0, 1)(progress);
            context.globalAlpha = currentOpacity;

            // Draw all spikes with the calculated opacity for the current frame.
            spikeData.forEach(d => {
                const [spikeTime, trialIndex] = d;
                const cx = timeScale(spikeTime);
                const cy = yScale(trialIndex) + circleRadius;

                const factorName = factorLevel[trialIndex] === undefined ? 'Spike' : factorLevel[trialIndex];
                context.fillStyle = colorScale(factorName);

                context.beginPath();
                context.arc(cx, cy, circleRadius, 0, 2 * Math.PI);
                context.fill();
            });

            // Stop the animation timer once the duration has been reached.
            if (progress >= 1) {
                animationTimer.stop();
                context.globalAlpha = 1.0; // Ensure final state is fully opaque.
            }
        });

        // Store the timer on the canvas node itself so it can be interrupted later.
        canvas.__animation_timer = animationTimer;
    }

    /* Draws each trial event (e.g. saccade, cue period, reward) from the beginning to
      end (e.g. saccade start, saccade finish) as an area. */

    function drawTrialEvents (selection, sessionInfo, trialEvents, curEvent, timeScale, yScale) {

      let eventArea = selection.selectAll('path.eventArea').data(trialEvents, function (d) { return d.label; });

      /* Reformat data for area chart. Duplicate data twice in order to draw
      straight vertical edges at the beginning and end of trials */
      let dupData = duplicateData(sessionInfo);

      // Plot area corresponding to trial events
      eventArea.enter()
        .append('path')
        .attr('class', 'eventArea')
        .attr('id', function (d) { return d.label; })
        .attr('opacity', 1E-6)
        .attr('fill', function (d) { return d.color; });

      eventArea.exit().remove();

      eventArea
        .interrupt()
        .transition()
        .duration(1000)
        .ease('linear')
        .attr('opacity', 0.90)
        .attr('d', function (t) {
          return AreaFun(dupData, t, timeScale, yScale, curEvent);
        });
    }

    function AreaFun(values, trialEvents, timeScale, yScale, curEvent) {
      // Setup helper line function
      let area = d3.svg.area()
        .defined(function (d) {
          return d[trialEvents.startID] != null && d[trialEvents.endID] != null && d[curEvent] != null;
        }) // if null, suppress line drawing
        .x0(function (d) {
          return timeScale(d[trialEvents.startID] - d[curEvent]);
        })
        .x1(function (d) {
          return timeScale(d[trialEvents.endID] - d[curEvent]);
        })
        .y(function (d, i) {
          // Draws straight line down for each trial on the corners.
          if (i % 2 == 0) { // Alternate top and bottom
            return yScale(d.sortInd); // Top of the trial
          } else {
            return yScale(d.sortInd) + yScale.rangeBand(); // bottom of the trial
          }
        })
        .interpolate('linear');
      return area(values);
    }

    function duplicateData(data) {
      // Duplicate data so that it appears twice aka 11223344
      let valuesInd = d3.range(data.length);
      let newValues = data.concat(data);
      valuesInd = valuesInd.concat(valuesInd);
      newValues.forEach(function (d, i) {
        d.sortInd = valuesInd[i];
      });

      newValues.sort(function (a, b) {
        return d3.descending(a.sortInd, b.sortInd);
      });

      return newValues;
    }

    function kernelDensityEstimator (kernel, x) {
      return function (sample) {
        return x.map(function (x) {
          return [x, d3.sum(sample, function (v) { return kernel(x - v); })];
        });
      };
    }

    function gaussianKernel (bandwidth) {
      return function (spikeTime) {
        return Math.exp((spikeTime * spikeTime) / (-2 * bandwidth * bandwidth))
          / (bandwidth * Math.sqrt(2 * Math.PI));
      };
    }

    function drawSmoothingLine (selection, data, timeScale, yScale, lineSmoothness, curEvent, interactionFactor, colorScale) {
      // Nest by interaction factor
      let spikes = d3.nest()
        .key(function (d) {
          return d[interactionFactor];
        })
        .entries(data.filter(function (d) {
          return d.start_time != null &&
            d.isIncluded === 'Included';
        })); // Don't include trials with no start time or excluded

      spikes = spikes.filter(function (k) { return k.key !== 'null'; });

      // Compute kernel density estimate
      let timeRange = d3.range(d3.min(timeScale.domain()), d3.max(timeScale.domain()));
      let kde = kernelDensityEstimator(gaussianKernel(lineSmoothness), timeRange);

      spikes.forEach(function (factor) {

        let kdeByTrial = factor.values.map(function (trial) {
          if (trial.spikes[0] !== undefined) {
            return kde(
              trial.spikes.map(function (spike) { return spike - trial[curEvent]; })
            );
          } else if (trial.start_time !== null) {
            return kde(0);
          }
        });

        let y = kdeByTrial.map(function (trial) {
          if (trial !== undefined) {
            return trial.map(function (e) { return e[1]; });
          };
        });

        const summedKDE = new Array(timeRange.length).fill(0);
        let validTrialCount = 0;
        y.forEach(trialKDE => {
          if (trialKDE !== undefined) {
            validTrialCount++;
            for (let i = 0; i < timeRange.length; i++) {
              summedKDE[i] += trialKDE[i];
            }
          }
        });

        factor.values = timeRange.map((time, ind) => {
          const meanValue = validTrialCount > 0 ? summedKDE[ind] / validTrialCount : 0;
          return [time, 1000 * meanValue];
        });

      });

      // max value of density estimate
      let maxKDE = d3.max(spikes.map(function (d) {
        return d3.max(d.values, function (e) {
          return e[1];
        });
      }));

      let kdeScale = d3.scale.linear()
        .domain([0, maxKDE])
        .range([yScale.range()[0] + yScale.rangeBand(), 0]);

      let kdeG = selection.selectAll('g.kde').data(spikes, function (d) { return d.key; });

      kdeG.enter()
        .append('g')
        .attr('class', 'kde');
      kdeG.exit()
        .remove();

      let line = d3.svg.line()
        .x(function (d) { return timeScale(d[0]); })
        .y(function (d) { return kdeScale(d[1]); });

      let kdeLine = kdeG.selectAll('path.kdeLine').data(function (d) { return [d]; });

      kdeLine.enter()
        .append('path')
        .attr('class', 'kdeLine');
      kdeLine
        .interrupt()
        .transition()
        .duration(1000)
        .attr('d', function (d) { return line(d.values); })
        .attr('stroke', function (d) {
          let factorName = (d.key === 'undefined') ? 'Spike' : d.key;
          return colorScale(factorName);
        });

      kdeLine.exit()
        .remove();

      return maxKDE;

    }

    let toolTip = d3.select('body').selectAll('div#tooltip').data([{}]);
    toolTip.enter()
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 1e-6);

    function drawMouseBox (selection, data, timeScale, yScale, curEvent, width) {
      // Append invisible box for mouseover
      let mouseBox = selection.selectAll('rect.trialBox').data(data);

      mouseBox.exit()
        .remove();
      mouseBox.enter()
        .append('rect')
        .attr('class', 'trialBox');
      mouseBox
        .attr('x', function (d) {
          if (d.start_time !== null) {
            return timeScale(d.start_time - d[curEvent]);
          } else {
            return 0;
          }
        })
        .attr('y', function (d, i) { return yScale(i); })
        .attr('width', function (d) {
          if (d.start_time !== null) {
            return (timeScale(d.end_time - d[curEvent])) - (timeScale(d.start_time - d[curEvent]));
          } else {
            return width;
          }
        })
        .attr('height', yScale.rangeBand())
        .attr('opacity', '1e-9')
        .on('mouseover', mouseBoxOver)
        .on('mouseout', mouseBoxOut);
    }

    function mouseBoxOver(d) {
      // Pop up tooltip
      toolTip
        .style('opacity', 1)
        .style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY + 10) + 'px')
        .html(function () {
          var table = '<b>Trial ' + d.trial_id + '</b><br>' + '<table>';
          var varName = '';
          for (varName in d) {
            var isValid = (varName != 'trial_id') & (varName != 'spikes')
              & (varName != 'sortInd');
            if (isValid) {
              table += '<tr><td>' + varName + ':' + '</td><td><b>' + d[varName]
                + '</b></td></tr>';
            }
          }

          table += '</table>';
          return table;
        });

      d3.select(this)
        .attr('stroke', 'black')
        .attr('fill', 'white')
        .attr('opacity', 1)
        .attr('fill-opacity', 1e-9);
    }

    function mouseBoxOut(d) {
      // Hide tooltip
      toolTip
        .style('opacity', 1e-9);
      d3.select(this)
        .attr('opacity', 1e-9);
    }

    // Replaces underscores with blanks and 'plus' with '+'
    function fixDimNames (dimName) {
      let pat1 = /plus/;
      let pat2 = /_/g;
      let pat3 = /minus/;
      let fixedName = dimName.replace(pat1, '+').replace(pat2, ' ').replace(pat3, '-');
      return fixedName;
    }

    // Append average start time for event label position
    function findAverageStartTime (data, trialEvents, curEvent) {
      trialEvents.forEach(function (period, ind) {
        let avgTime = d3.mean(data, function (trial) {
          if (trial[curEvent] !== null && trial[period.startID] !== null) {
            return trial[period.startID] - trial[curEvent];
          }

        });

        period.labelPosition = avgTime;
      });
    }

    function eventMarkers (selection, data, trialEvents, timeScale, curEvent, innerHeight) {

      const labelWidth = 45;
      const labelHeight = 33;

      findAverageStartTime(data, trialEvents, curEvent);

      // Add labels corresponding to trial events
      let eventLabel = selection.selectAll('.eventLabel').data(trialEvents, function (d) { return d.label; });

      eventLabel.enter()
        .append('foreignObject')
        .attr('class', 'eventLabel')
        .attr('id', function (d) { return d.label; })
        .attr('width', labelWidth)
        .attr('height', 33)
        .style('color', function (d) { return d.color; })
        .html(function (d) { return '<div>▲<br>' + d.label + '</div>'; });

      eventLabel
        .attr('x', function (d) {
          return timeScale(d.labelPosition) - (labelWidth / 2);
        })
        .attr('y', innerHeight + 16);
    }

    function rasterChart () {
      // Defaults
      let margin = { top: 50, right: 50, bottom: 50, left: 50 };
      let outerWidth = 960;
      let outerHeight = 500;
      let timeDomain = [];
      let timeScale = d3.scale.linear();
      let yScale = d3.scale.ordinal();
      let curEvent = '';
      let trialEvents = [];
      let lineSmoothness = 20;
      let interactionFactor = '';
      let curFactor = '';
      let showSpikes = true;
      let showSmoothingLines = true;
      let innerHeight;
      let innerWidth;
      let colorScale = d3.scale.ordinal().domain(['Spike']).range(['black']);

      function chart(selection) {
        selection.each(function (data) {

          // Allow height and width to be determined by data
          if (typeof outerHeight === 'function') {
            innerHeight = outerHeight(data) - margin.top - margin.bottom;
          } else {
            innerHeight = outerHeight - margin.top - margin.bottom;
          };

          if (typeof outerWidth === 'function') {
            innerWidth = outerWidth(data) - margin.left - margin.right;
          } else {
            innerWidth = outerWidth - margin.left - margin.right;
          }

          let svg = d3.select(this).selectAll('svg').data([data], function (d) { return d.key; });

          // Initialize the chart, set up drawing layers
          let enterG = svg.enter()
            .append('svg')
            .append('g');
          enterG
            .append('rect')
            .attr('class', 'backgroundLayer');
          svg.select('rect.backgroundLayer')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('opacity', 0.1)
            .attr('fill', '#aaa');
          enterG
            .append('g')
            .attr('class', 'trialEvents');

          // Add a canvas layer for spikes
          enterG
            .append('foreignObject')
            .attr('class', 'spike-canvas-wrapper')
            .append('xhtml:canvas')
            .attr('class', 'spikes-canvas');

          enterG
            .append('g')
            .attr('class', 'smoothLine');

          // Ensure the interactive layer is on top of the canvas
          enterG
            .append('g')
            .attr('class', 'trialBox');

          enterG
            .append('g')
            .attr('class', 'timeAxis');
          enterG
            .append('g')
            .attr('class', 'yAxis');
          enterG
            .append('g')
            .attr('class', 'eventMarker');

          // Fix title names
          let s = data.key.split('_');
          if (s[0] === 'undefined') {
            s[0] = '';
          } else {
            s[0] = ': ' + s[0];
          };
          let title = enterG
            .append('text')
            .attr('class', 'title')
            .attr('font-size', 16)
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', -8);
          svg.select('text.title')
            .text(fixDimNames(curFactor) + s[0]);

          // Update svg size, drawing area, and scales
          svg
            .attr('width', innerWidth + margin.left + margin.right)
            .attr('height', innerHeight + margin.top + margin.bottom);
          svg.select('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
          timeScale
            .domain(timeDomain)
            .range([0, innerWidth]);
          yScale
            .domain(d3.range(0, data.values.length))
            .rangeBands([innerHeight, 0]);

          // Draw the chart
          svg.select('.spike-canvas-wrapper')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .select('.spikes-canvas')
            .attr('width', innerWidth)
            .attr('height', innerHeight);

          let trialEventsG = svg.select('g.trialEvents');
          let trialBoxG = svg.select('g.trialBox');
          let smoothLineG = svg.select('g.smoothLine');
          let eventMarkerG = svg.select('g.eventMarker');

          drawTrialEvents(trialEventsG, data.values, trialEvents, curEvent, timeScale, yScale);
          drawMouseBox(trialBoxG, data.values, timeScale, yScale, curEvent, innerWidth);
          eventMarkers(eventMarkerG, data.values, trialEvents, timeScale, curEvent, innerHeight);

          const canvas = svg.select('.spikes-canvas').node();
          if (showSpikes) {
            animateSpikesOnCanvas(canvas, data.values, timeScale, yScale, curEvent, interactionFactor, colorScale);
          } else {
            if (canvas.__animation_timer) canvas.__animation_timer.stop();
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          }

          let maxKDE = 0;
          if (showSmoothingLines) {
            maxKDE = drawSmoothingLine(smoothLineG, data.values, timeScale, yScale, lineSmoothness, curEvent, interactionFactor, colorScale);
          } else {
            smoothLineG.selectAll('path.kdeLine').remove();
          }

          // Draw the time axis
          let timeAxisG = svg.select('g.timeAxis');
          let timeAxis = d3.svg.axis()
            .scale(timeScale)
            .orient('bottom')
            .ticks(7)
            .tickSize(0)
            .tickFormat(d3.format('4d'));
          timeAxisG
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(timeAxis);

          // Draw smoothing axis if showing smoothing line
          let yAxisG = svg.select('g.yAxis');
          if (showSmoothingLines) {
            yAxisG.attr('display', '');
            let smoothScale = d3.scale.linear()
              .domain([0, maxKDE]) // assuming in milliseconds
              .range([innerHeight, 0]);
            let yAxis = d3.svg.axis()
              .scale(smoothScale)
              .orient('left')
              .tickValues([0, maxKDE])
              .tickSize(0);
            yAxisG.call(yAxis);
          } else {
            // hide axis
            yAxisG.attr('display', 'none');
          }
        });
      };

      chart.width = function (value) {
        if (!arguments.length) return outerWidth;
        outerWidth = value;
        return chart;
      };
      chart.height = function (value) {
        if (!arguments.length) return outerHeight;
        outerHeight = value;
        return chart;
      };
      chart.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
      };
      chart.timeDomain = function (value) {
        if (!arguments.length) return timeDomain;
        timeDomain = value;
        return chart;
      };
      chart.curEvent = function (value) {
        if (!arguments.length) return curEvent;
        curEvent = value;
        return chart;
      };
      chart.curFactor = function (value) {
        if (!arguments.length) return curFactor;
        curFactor = value;
        return chart;
      };
      chart.interactionFactor = function (value) {
        if (!arguments.length) return interactionFactor;
        interactionFactor = value;
        return chart;
      };
      chart.trialEvents = function (value) {
        if (!arguments.length) return trialEvents;
        trialEvents = value;
        return chart;
      };
      chart.lineSmoothness = function (value) {
        if (!arguments.length) return lineSmoothness;
        lineSmoothness = value;
        return chart;
      };
      chart.showSmoothingLines = function (value) {
        if (!arguments.length) return showSmoothingLines;
        showSmoothingLines = value;
        return chart;
      };
      chart.showSpikes = function (value) {
        if (!arguments.length) return showSpikes;
        showSpikes = value;
        return chart;
      };
      chart.colorScale = function (value) {
        if (!arguments.length) return colorScale;
        colorScale = value;
        return chart;
      };

      return chart;
    }

    let rasterView = rasterChart();

    function createDropdown () {
      let key;
      let displayName;
      let options;
      let dispatch = d3.dispatch('click');

      function _createDropdown(selection) {
        selection.each(function (data) {
          let menu = d3.select(this).selectAll('ul').selectAll('li').data(options,
            function (d) { return d[key]; });

          displayName = (typeof displayName === 'undefined') ? key : displayName;

          menu.enter()
            .append('li')
            .attr('id', function (d) {
              return d[key];
            })
            .attr('role', 'presentation')
            .append('a')
            .attr('role', 'menuitem')
            .attr('tabindex', -1)
            .text(function (d) {
              return d[displayName];
            });

          menu.on('click', dispatch.click);

          menu.exit().remove();

          let curText = options.filter(function (d) { return d[key] === data; })
            .map(function (d) { return d[displayName]; })[0];

          d3.select(this).selectAll('button')
            .text(curText)
            .append('span')
            .attr('class', 'caret');
        });

      }

      _createDropdown.key = function (value) {
        if (!arguments.length) return key;
        key = value;
        return _createDropdown;
      };

      _createDropdown.options = function (value) {
        if (!arguments.length) return options;
        options = value;
        return _createDropdown;
      };

      _createDropdown.displayName = function (value) {
        if (!arguments.length) return displayName;
        displayName = value;
        return _createDropdown;
      };

      d3.rebind(_createDropdown, dispatch, 'on');

      return _createDropdown;

    }

    const factorDropdown = createDropdown()
      .key('value')
      .displayName('name');

    factorDropdown.on('click', function () {
      var curFactor = d3.select(this).data()[0];
      rasterData.curFactor(curFactor.value);
    });

    let eventDropdown = createDropdown()
      .key('startID')
      .displayName('name');

    eventDropdown.on('click', function () {
      let curEvent = d3.select(this).data()[0];
      rasterData.curEvent(curEvent.startID);
    });

    function createSlider () {

      let stepSize;
      let domain;
      let maxStepInd;
      let units;
      let curValue;
      let minValue;
      let maxValue;
      let running = false;
      let delay = 200;
      let dispatch = d3.dispatch('sliderChange', 'start', 'stop');

      function _createSlider(selection) {
        selection.each(function (value) {
          let input = d3.select(this).selectAll('input');
          let output = d3.select(this).selectAll('output');
          stepSize = stepSize || d3.round(domain[1] - domain[0], 4);
          maxStepInd = domain.length - 1;
          curValue = value;
          minValue = d3.min(domain);
          maxValue = d3.max(domain);

          input.property('min', minValue);
          input.property('max', maxValue);
          input.property('step', stepSize);
          input.property('value', value);
          input.on('input', function () {
            output.text(this.value + ' ' + units);
          });

          input.on('change', function () {
            dispatch.sliderChange(+this.value);
          });

          output.text(value + ' ' + units);
        });
      };

      _createSlider.stepSize = function (value) {
        if (!arguments.length) return stepSize;
        stepSize = value;
        return _createSlider;
      };

      _createSlider.running = function (value) {
        if (!arguments.length) return running;
        running = value;
        return _createSlider;
      };

      _createSlider.delay = function (value) {
        if (!arguments.length) return delay;
        delay = value;
        return _createSlider;
      };

      _createSlider.domain = function (value) {
        if (!arguments.length) return domain;
        domain = value;
        return _createSlider;
      };

      _createSlider.units = function (value) {
        if (!arguments.length) return units;
        units = value;
        return _createSlider;
      };

      _createSlider.maxStepInd = function (value) {
        if (!arguments.length) return maxStepInd;
        maxStepInd = value;
        return _createSlider;
      };

      _createSlider.curValue = function (value) {
        if (!arguments.length) return curValue;
        curValue = value;
        return _createSlider;
      };

      _createSlider.play = function () {
        running = true;
        dispatch.start();

        let t = setInterval(step, delay);

        function step() {
          if (curValue < maxValue && running) {
            curValue += stepSize;
            dispatch.sliderChange(curValue);
          } else {
            dispatch.stop();
            running = false;
            clearInterval(t);
          }
        }
      };

      _createSlider.stop = function () {
        running = false;
        dispatch.stop();
      };

      _createSlider.reset = function () {
        running = false;
        dispatch.sliderChange(minValue);
        dispatch.stop();
      };

      d3.rebind(_createSlider, dispatch, 'on');

      return _createSlider;

    }

    let smoothingSlider = createSlider();

    smoothingSlider
      .domain([5, 1000])
      .stepSize(5)
      .units('ms');

    smoothingSlider.on('sliderChange', function (bandwidth) {
      rasterData.lineSmoothness(bandwidth);
    });

    /* If showing spikes, set to reasonable height so spikes are visible, else
       pick the normal height of the plot if it's small or a value that can fit
       several plots on the screen.
    */
    function chartHeight (data) {
      const spikeDiameter = 4;
      const noSpikesHeight = 250;
      let heightMargin = rasterView.margin().top + rasterView.margin().bottom;
      let withSpikesHeight = (data.values.length * spikeDiameter) + heightMargin;
      const shouldShowSpikes = rasterView.showSpikes();
      return shouldShowSpikes ? withSpikesHeight : d3.min([noSpikesHeight, withSpikesHeight]);
    }

    function createList () {
      let key = '';
      let curSelected = '';
      let dispatch = d3.dispatch('click');

      function _createList(selection) {
        selection.each(function (data) {
          if (data.length === undefined || data.length === 0) {
            if (data[key] !== undefined) {
              data = [data];
            } else return;
          }

          let options = d3.select(this).select('select').selectAll('option')
            .data(data, function (d) {
              return d[key];
            });

          options.enter()
            .append('option')
            .text(function (d) { return d[key]; });

          options.exit().remove();
          options.property('selected', false);
          options.filter(function (d) { return d[key] === curSelected; }).property('selected', true);
          options.on('click', function (d) { return dispatch.click(d[key]); });

        });
      }

      _createList.key = function (value) {
        if (!arguments.length) return key;
        key = value;
        return _createList;
      };

      _createList.curSelected = function (value) {
        if (!arguments.length) return curSelected;
        curSelected = value;
        return _createList;
      };

      d3.rebind(_createList, dispatch, 'on');

      return _createList;
    }

    let neuronList = createList();

    neuronList.key('name');

    neuronList.on('click', function (d) {
      rasterData.neuronName(d);
    });

    function createSearch () {
      let fuseOptions = {};
      let key = '';
      let dispatch = d3.dispatch('click');
      let guessIndex = 0;
      let guesses;
      const MAX_GUESSES = 10;

      function _createSearchBox(selection) {
        selection.each(function (data) {
          let fuseSearch = new Fuse(data, fuseOptions);

          selection.select('input').on('input', function () {
            let curInput = d3.select(this).property('value');
            if (curInput.length < 2) {
              selection.classed('open', false);
              guessIndex = 0;
              return;
            }
            guesses = fuseSearch.search(curInput);

            guesses = guesses.filter(function (g) { return g.score < 0.05; });

            if (guesses.length > MAX_GUESSES) guesses = guesses.slice(0, MAX_GUESSES);

            let guessList = selection.select('ul').selectAll('li').data(guesses.map(function (d) { return d.item[key]; }), String);

            guessList.enter()
              .append('li')
              .append('a')
              .attr('role', 'menuitem')
              .attr('tabindex', -1)
              .text(function (d) { return d; });

            guessList.selectAll('a').on('click', function (d) {
              selection.select('input').property('value', '');
              dispatch.click(d);
            });

            guessList.exit().remove();

            selection.classed('open', guesses.length > 0 & curInput.length > 2);

            d3.select(this).on('keydown', function () {
              let li = selection.select('ul').selectAll('li');
              switch (d3.event.keyCode) {
                case 38: // up
                  guessIndex = (guessIndex > 0) ? guessIndex - 1 : 0;
                  li.classed('active', false);
                  li.filter(function (d, ind) {
                    return ind === guessIndex;
                  }).classed('active', true);
                  break;
                case 40: // down
                  li.classed('active', false);
                  li.filter(function (d, ind) {
                    return ind === guessIndex;
                  }).classed('active', true);
                  guessIndex = (guessIndex < guesses.length - 1) ? guessIndex + 1 : guesses.length - 1;
                  break;
                case 13: // enter
                  selection.classed('open', false);
                  selection.select('input').property('value', '');
                  dispatch.click(selection.select('ul').selectAll('.active').data()[0]);
                  break;
              }

            });
          });
        });
      }

      _createSearchBox.fuseOptions = function (value) {
        if (!arguments.length) return fuseOptions;
        fuseOptions = value;
        return _createSearchBox;
      };

      _createSearchBox.key = function (value) {
        if (!arguments.length) return key;
        key = value;
        return _createSearchBox;
      };

      d3.rebind(_createSearchBox, dispatch, 'on');
      return _createSearchBox;
    }

    let neuronSearch = createSearch();

    const fuseOptions$1 = {
      threshold: 0.4,
      shouldSort: true,
      include: ['score'],
      location: 1,
      keys: ['name', 'brainArea'],
    };

    neuronSearch.on('click', function (d) {
      rasterData.neuronName(d);
    });

    neuronSearch
      .fuseOptions(fuseOptions$1)
      .key('name');

    let showLinesCheckbox = d3.select('#showLines input');

    showLinesCheckbox.on('change', function () {
      rasterData.showSmoothingLines(this.checked);
    });

    let showSpikesCheckbox = d3.select('#showRaster input');

    showSpikesCheckbox.on('change', function () {
      rasterData.showSpikes(this.checked);
    });

    function createBrainAreaCheckboxes () {
      let dispatch = d3.dispatch('change');

      function _createCheckbox(selection) {
        selection.each(function (data) {
          if (data.length === undefined || data.length === 0) {
            return;
          }

          let checkboxes = d3.select(this).selectAll('.checkbox').data(data);
          var checkboxEnter = checkboxes.enter()
            .append('div')
            .attr('class', 'checkbox');
          checkboxEnter
            .append('input')
            .attr('id', function (brainArea) { return brainArea; })
            .attr('checked', 'checked')
            .attr('type', 'checkbox')
            .attr('class', 'form-check-input');
          checkboxEnter
            .append('label').html(function (brainArea) {
              return brainArea;
            })
            .attr('class', 'form-check-label');

          checkboxes.select('input').on('change', function (d) {
            dispatch.change();
          });
        });
      }

      d3.rebind(_createCheckbox, dispatch, 'on');

      return _createCheckbox;
    }

    let brainAreaCheckboxes = createBrainAreaCheckboxes();

    brainAreaCheckboxes.on('change', function () {
      const choices = d3.selectAll('#NeuronFilter .checkbox input:checked').nodes().map(cb => cb.id);
      rasterData.includeBrainAreas(choices);
    });

    function legendView (scale) {
      const CIRCLE_RADIUS = 7.5;
      let margin = { top: 10, right: 10, bottom: 10, left: 10 };
      let outerWidth = document.getElementById('legend').offsetWidth;
      let outerHeight = (scale.domain().length * CIRCLE_RADIUS * 3)
        + margin.top + margin.bottom + CIRCLE_RADIUS;
      let innerHeight = outerHeight - margin.top - margin.bottom;
      let innerWidth = outerWidth - margin.left - margin.right;
      let legendID = d3.select('#filterNav').select('#legend');
      let legend = d3.legend.color()
        .shape('circle')
        .shapeRadius(CIRCLE_RADIUS)
        .shapePadding(CIRCLE_RADIUS)
        .title('Legend')
        .scale(scale);
      let svg = legendID.selectAll('svg').data([{}]);
      svg.enter()
        .append('svg')
        .append('g');
      svg
        .attr('width', innerWidth + margin.left + margin.right)
        .attr('height', innerHeight + margin.top + margin.bottom);
      svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.select('g').call(legend);

    }

    let rasterData = rasterDataManager();
    rasterData.on('dataReady', function () {
      d3.select('span#NeuronName')
        .text('Neuron ' + rasterData.brainArea() + ' ' + rasterData.neuronName());
      let chartWidth = document.getElementById('chart').offsetWidth;
      rasterView
        .width(chartWidth)
        .height(chartHeight)
        .timeDomain(rasterData.timeDomain())
        .trialEvents(rasterData.trialEvents())
        .lineSmoothness(rasterData.lineSmoothness())
        .showSmoothingLines(rasterData.showSmoothingLines())
        .showSpikes(rasterData.showSpikes())
        .curEvent(rasterData.curEvent())
        .curFactor(rasterData.curFactor())
        .interactionFactor(rasterData.interactionFactor())
        .colorScale(rasterData.colorScale());

      legendView(rasterData.colorScale());

      let multiples = d3.select('#chart').selectAll('div.row')
        .data(rasterData.rasterData(), function (d) { return d.key; });

      multiples.enter()
        .append('div')
        .attr('class', 'row')
        .attr('id', function (d) { return d.key; });

      multiples.exit().remove();
      multiples.call(rasterView);

      // UI
      factorDropdown.options(rasterData.factorList());
      eventDropdown.options(rasterData.trialEvents());

      neuronList.curSelected(rasterData.neuronName());
      d3.select('#FactorSortMenu').datum(rasterData.curFactor()).call(factorDropdown);
      d3.select('#EventMenu').datum(rasterData.curEvent()).call(eventDropdown);
      d3.select('#LineSmoothSliderPanel').datum(rasterData.lineSmoothness()).call(smoothingSlider);
      d3.select('#NeuronMenu').datum(rasterData.neuronList().filter(
        function (d) { return rasterData.includeBrainAreas().includes(d.brainArea); })
      ).call(neuronList);
      d3.select('#NeuronSearch').datum(rasterData.neuronList()).call(neuronSearch);
      d3.select('#NeuronFilter').datum(rasterData.includeBrainAreas()).call(brainAreaCheckboxes);

      showLinesCheckbox.property('checked', rasterData.showSmoothingLines());
      showSpikesCheckbox.property('checked', rasterData.showSpikes());
    });

    function download (svgInfo, filename) {
      window.URL = (window.URL || window.webkitURL);
      var blob = new Blob(svgInfo.source, {type: 'text\/xml'});
      var url = window.URL.createObjectURL(blob);
      var body = document.body;
      var a = document.createElement('a');

      body.appendChild(a);
      a.setAttribute('download', filename + '.svg');
      a.setAttribute('href', url);
      a.style.display = 'none';
      a.click();
      a.parentNode.removeChild(a);

      setTimeout(function() {
        window.URL.revokeObjectURL(url);
      }, 10);
    }

    var prefix = {
      svg: 'http://www.w3.org/2000/svg',
      xhtml: 'http://www.w3.org/1999/xhtml',
      xlink: 'http://www.w3.org/1999/xlink',
      xml: 'http://www.w3.org/XML/1998/namespace',
      xmlns: 'http://www.w3.org/2000/xmlns/',
    };

    function setInlineStyles (svg) {

      // add empty svg element
      var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
      window.document.body.appendChild(emptySvg);
      var emptySvgDeclarationComputed = window.getComputedStyle(emptySvg);

      // hardcode computed css styles inside svg
      var allElements = traverse(svg);
      var i = allElements.length;
      while (i--) {
        explicitlySetStyle(allElements[i]);
      }

      emptySvg.parentNode.removeChild(emptySvg);

      function explicitlySetStyle(element) {
        var cSSStyleDeclarationComputed = window.getComputedStyle(element);
        var i;
        var len;
        var key;
        var value;
        var computedStyleStr = '';

        for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
          key = cSSStyleDeclarationComputed[i];
          value = cSSStyleDeclarationComputed.getPropertyValue(key);
          if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
            // Don't set computed style of width and height. Makes SVG elmements disappear.
            if ((key !== 'height') && (key !== 'width')) {
              computedStyleStr += key + ':' + value + ';';
            }

          }
        }

        element.setAttribute('style', computedStyleStr);
      }

      function traverse(obj) {
        var tree = [];
        tree.push(obj);
        visit(obj);
        function visit(node) {
          if (node && node.hasChildNodes()) {
            var child = node.firstChild;
            while (child) {
              if (child.nodeType === 1 && child.nodeName != 'SCRIPT') {
                tree.push(child);
                visit(child);
              }

              child = child.nextSibling;
            }
          }
        }

        return tree;
      }
    }

    function preprocess (svg) {
      svg.setAttribute('version', '1.1');

      // removing attributes so they aren't doubled up
      svg.removeAttribute('xmlns');
      svg.removeAttribute('xlink');

      // These are needed for the svg
      if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns')) {
        svg.setAttributeNS(prefix.xmlns, 'xmlns', prefix.svg);
      }

      if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns:xlink')) {
        svg.setAttributeNS(prefix.xmlns, 'xmlns:xlink', prefix.xlink);
      }

      setInlineStyles(svg);

      var xmls = new XMLSerializer();
      var source = xmls.serializeToString(svg);
      var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      var rect = svg.getBoundingClientRect();
      var svgInfo = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        class: svg.getAttribute('class'),
        id: svg.getAttribute('id'),
        childElementCount: svg.childElementCount,
        source: [doctype + source],
      };

      return svgInfo;
    }

    function save(svgElement, config) {
      if (svgElement.nodeName !== 'svg' || svgElement.nodeType !== 1) {
        throw 'Need an svg element input';
      }

      var config = config || {};
      var svgInfo = preprocess(svgElement, config);
      var defaultFileName = getDefaultFileName(svgInfo);
      var filename = config.filename || defaultFileName;
      var svgInfo = preprocess(svgElement);
      download(svgInfo, filename);
    }

    function getDefaultFileName(svgInfo) {
      var defaultFileName = 'untitled';
      if (svgInfo.id) {
        defaultFileName = svgInfo.id;
      } else if (svgInfo.class) {
        defaultFileName = svgInfo.class;
      } else if (window.document.title) {
        defaultFileName = window.document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      }

      return defaultFileName;
    }

    const exportButton = d3.select('button#export');

    exportButton
      .on('click', function () {
        const svgs = d3.selectAll('#chart').selectAll('svg').nodes();

        svgs.forEach((svgNode, i) => {
          const svgSelection = d3.select(svgNode);
          // Find the canvas associated with this SVG
          const canvas = svgSelection.select('.spikes-canvas').node();
          if (!canvas) return;

          // Get the canvas content as a base64 image URL
          const imgData = canvas.toDataURL('image/png');

          // Temporarily embed the canvas image into the SVG for export.
          // We insert it before '.smoothLine' to ensure it's under the smoothing line.
          const tempImage = svgSelection.select('g').insert('image', '.smoothLine')
            .attr('xlink:href', imgData)
            .attr('width', canvas.width)
            .attr('height', canvas.height);

          // Prepare the filename (logic from original file)
          const levelNames = rasterData.rasterData().map(function (d) { return d.key; });
          const curFactor = rasterData.curFactor();
          const curEvent = rasterData.curEvent();
          const neuronName = rasterData.neuronName();
          const saveName = `${neuronName}_${curEvent}_${curFactor}_${levelNames[i]}`;

          // Save the modified SVG
          save(svgNode, { filename: saveName });

          // IMPORTANT: Remove the temporary image after saving to restore the live chart
          tempImage.remove();
        });
      });

    let permalinkBox = d3.select('#permalink');
    let permalinkButton = d3.select('button#link');
    permalinkButton
      .on('click', function () {
        permalinkBox
          .style('display', 'block');

        let linkString = window.location.origin + window.location.pathname + '?' +
          'neuronName=' + rasterData.neuronName() +
          '&curFactor=' + rasterData.curFactor() +
          '&curEvent=' + rasterData.curEvent() +
          '&showSmoothingLines=' + rasterData.showSmoothingLines() +
          '&lineSmoothness=' + rasterData.lineSmoothness() +
          '&showSpikes=' + rasterData.showSpikes() +
          '&interactionFactor=' + rasterData.interactionFactor();
        permalinkBox.selectAll('textarea').html(linkString);
        permalinkBox.selectAll('.bookmark').attr('href', linkString);
      });

    permalinkBox.selectAll('.close')
      .on('click', function () {
        permalinkBox.style('display', 'none');
      });

    // Set up help overlay
    let overlay = d3.select('#overlay');
    let helpButton = d3.select('button#help-button');
    overlay.selectAll('.close')
      .on('click', function () {
        overlay.style('display', 'none');
      });

    helpButton
      .on('click', function () {
        overlay
          .style('display', 'block');
      });

    function init(passedParams) {

      let showSpikes = (passedParams.showSpikes === undefined) ?
        true : (passedParams.showSpikes === 'true');
      let showSmoothingLines = (passedParams.showSmoothingLines === undefined) ?
        true : (passedParams.showSmoothingLines === 'true');
      let lineSmoothness = (passedParams.lineSmoothness || 20);
      let curFactor = passedParams.curFactor || 'trial_id';
      let curEvent = passedParams.curEvent || 'start_time';
      let interactionFactor = passedParams.interactionFactor || '';
      let neuronName = passedParams.neuronName || '';

      rasterData
        .showSpikes(showSpikes)
        .showSmoothingLines(showSmoothingLines)
        .lineSmoothness(lineSmoothness)
        .curFactor(curFactor)
        .curEvent(curEvent)
        .interactionFactor(interactionFactor)
        .neuronName(neuronName);

    }

    exports.init = init;

    Object.defineProperty(exports, '__esModule', { value: true });

}));