
[![DOI](https://zenodo.org/badge/21776036.svg)](https://zenodo.org/badge/latestdoi/21776036)


# RasterVis

### About
RasterVis is a D3-based visualization tool for quickly viewing, grouping and summarizing spike rasters for many neurons.

This tool allows you to:
* Generate and change between rasters for many neurons
![change neurons](/img/RasterVis-ChangeNeurons.gif)
* Quickly view rasters aligned to experimental trial events.
![change time](/img/RasterVis-ChangeTime.gif)
* Add Gaussian-smoothed peristimulus time kernel density estimates with arbitrary smoothing.
![change smoothing](/img/RasterVis-KDE-Smoothing.gif)
* Group spikes based on experimental factors.
![change factors](/img/RasterVis-ChangeFactor.gif)


#### Example
See an example here: https://neurophysvis.github.io/RasterVis/public/

### Installation
To run RasterVis locally, you need to install the dependencies and set up a local web server.

To install the dependencies and start a webserver, run:
```
npm install
npm run postinstall

```

### Data Format and Naming
All files must be in the JSON format.
Time should be measured in milliseconds.

All data must be placed in the /DATA folder

Your data must follow a specific naming scheme to be rendered by RasterVis.
  * Sessions must be named as (subject) + (sessionNumber) e.g. "Bob23"
  * Neurons must be named as "(sessionName)\_(wireNumber)_(unit_number)" e.g. "Bob23_1_1"

There are three main file types:
  * trialInfo.json
  * <sessionName>_TrialInfo.json e.g. "Bob23_TrialInfo.json"
  * Neuron_<neuronName>.json e.g. "Neuron_Bob23_1_1"

The trialInfo.json contains an array of three objects structured as follows:
<pre>  
|--neurons
    |--name: Name of neuron
    |--sessionName: Name of session
|--timePeriods
    |--name: Name of trial event
    |--label: Short label of trial event
    |--startID: Beginning of trial event
    |--endID: End of trial event
    |--color: Color of trial event
|--experimentalFactor
    |--name: Name of experimental factor to sort by
    |--value: experimental factor key
    |--factorType: continuous | categorical | ordinal
</pre>

The (sessionName)_TrialInfo.json is an array of objects corresponding to each trial. Each trial object contains the properties corresponding to trial events and experimental factors. For example:
```
{
  "trial_id": 129,
  "start_time": 0,
  "fixation_onset": 143,
  "rule_onset": 491,
  "stim_onset": 934,
  "react_time": 1065,
  "reward_time": 1204,
  "end_time": 1232,
  "isCorrect": "Incorrect",
  "isIncluded": "Included",
  "Fixation_Break": "No Fixation Break"
}
 ```

 The Neuron_(neuronName).json contains an object structured as follows:
<pre>
|--Name
|--Brain_Area
|--Subject
|--File_Name
|--Number_of_Trials
|--Spikes: an array of spike objects corresponding to each trial
    |--trial_id
    |--spikes: an array of spike times
</pre>
