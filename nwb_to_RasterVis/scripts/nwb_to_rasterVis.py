import json
from pathlib import Path
import numpy as np
from pynwb import NWBHDF5IO


def make_trials_json(trials, nwbfile, output_path=""):
    subject = str(nwbfile.subject.subject_id)
    json_data = [
        {"trial_id": trial_id, **trial.to_dict()}
        for trial_id, trial in trials.iterrows()
    ]
    trials_filename = Path(output_path) / Path(f"{subject}_TrialInfo.json")
    json_output = json.dumps(json_data)

    with open(trials_filename, "w") as file:
        file.write(json_output)


def make_neurons_json(trials, units, nwbfile, output_path="", brain_area_column=None):
    n_trials = len(trials)
    subject = str(nwbfile.subject.subject_id)

    for unit_id, unit in units.iterrows():
        unit_spike_times = unit["spike_times"]

        # Need to make optional because brain area not always here.
        # IBL data has other column. Give user option to specify column or check this automatically.
        if brain_area_column is not None:
            brain_area = unit[brain_area_column]
        else:
            try:
                brain_area = str(unit["electrodes"].location.to_numpy()[0])
            except AttributeError:
                brain_area = "unknown"

        spikes_list = [
            {
                "trial_id": trial_id,
                "spikes": unit_spike_times[
                    np.logical_and(
                        unit_spike_times > trial["start_time"],
                        unit_spike_times < trial["stop_time"],
                    )
                ].tolist(),
            }
            for trial_id, trial in trials.iterrows()
        ]
        json_data = {
            "Name": str(unit_id),
            "Brain_Area": brain_area,
            "Subject": subject,
            "Number_of_Trials": n_trials,
            "Spikes": spikes_list,
        }
        neuron_filename = Path(output_path) / Path(f"Neuron_{subject}_{unit_id}.json")
        json_output = json.dumps(json_data)

        with open(neuron_filename, "w") as file:
            file.write(json_output)


def run_conversion(nwb_path, output_path=""):
    with NWBHDF5IO(nwb_path, "r") as io:
        nwbfile = io.read()
        units = nwbfile.units.to_dataframe()
        trials = nwbfile.trials.to_dataframe()
        make_neurons_json(trials, units, nwbfile, output_path=output_path)
        make_trials_json(trials, nwbfile, output_path=output_path)
