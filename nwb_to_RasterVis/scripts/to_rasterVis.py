import json
from logging import getLogger
from os.path import join

import numpy as np

from loren_frank_data_processing import (get_spike_indicator_dataframe,
                                         make_epochs_dataframe,
                                         make_neuron_dataframe,
                                         reshape_to_segments)

from .parameters import ANIMALS, SAMPLING_FREQUENCY

TO_MILLISECONDS = 1E3
logger = getLogger(__name__)


def export_trial_info(data_folder):
    epoch_info = make_epochs_dataframe(ANIMALS)
    epoch_keys = epoch_info[(epoch_info.type == 'run') & (
        epoch_info.environment != 'lin')].index
    neuron_info = (make_neuron_dataframe(ANIMALS).query('numspikes > 0')
                   .reset_index()
                   .set_index(['animal', 'day', 'epoch'])
                   .loc[epoch_keys])
    neuron_info['sessionName'] = (
        neuron_info.reset_index().apply(
            lambda x: '{0}_{1:02d}_{2:02d}'.format(x.animal, x.day, x.epoch),
            axis=1).values)

    neurons = (neuron_info
               .reset_index()
               .loc[:, ['neuron_id', 'sessionName', 'area']]
               .rename(columns=dict(neuron_id='name', area='brainArea'))
               .to_dict(orient='records'))
    filename = 'trialInfo.json'

    data = {
        'neurons': neurons,
        'timePeriods': [
            dict(name='Ripple Start', label='Ripple Start',
                 startID='ripple_start', endID='ripple_end', color='#756bb1'),
            dict(name='Ripple End', label='Ripple End',
                 startID='ripple_end', endID='end_time', color='#f1eef6'),
            dict(name='Before Ripple', label='Before Ripple',
                 startID='start_time', endID='ripple_start', color='#f1eef6'),
            dict(name='After Ripple', label='',
                 startID='ripple_end', endID='end_time', color='#f1eef6')
        ],
        'experimentalFactor': [dict(name='Ripple number',
                                    value='trial_id',
                                    factorType='continuous'),
                               dict(name='Replay Type',
                                    value='predicted_state',
                                    factorType='categorical'),
                               dict(name='Ripple Duration',
                                    value='ripple_duration',
                                    factorType='continuous'),
                               dict(name='Session Time (Early, Middle, Late)',
                                    value='session_time',
                                    factorType='ordinal'),
                               dict(name='Linear Distance',
                                    value='linear_distance',
                                    factorType='continuous'),
                               dict(name='Speed', value='speed',
                                    factorType='continuous'),
                               dict(name='Replay Task',
                                    value='replay_task',
                                    factorType='categorical'),
                               dict(name='Replay Order',
                                    value='replay_order',
                                    factorType='categorical'),
                               dict(name='Replay Decoder Confidence',
                                    value='predicted_state_probability',
                                    factorType='continuous'),
                               dict(name='Head Direction',
                                    value='head_direction',
                                    factorType='continuous')
                               ],
    }

    with open(join(data_folder, filename), 'w') as f:
        json.dump(data, f)


def export_all_session_neuron_info(data_folder, window_offset=(-0.5, 0.5)):
    epoch_info = make_epochs_dataframe(ANIMALS)
    epoch_keys = epoch_info[(epoch_info.type == 'run') & (
        epoch_info.environment != 'lin')].index
    for epoch_key in epoch_keys:
        export_session_and_neuron_info(epoch_key, data_folder, window_offset)


def export_session_and_neuron_info(epoch_key, data_folder, ripple_times,
                                   replay_info, window_offset=(-0.5, 0.5)):

    _export_session_info(epoch_key, replay_info, data_folder, window_offset)
    _export_neuron_info(epoch_key, replay_info, data_folder, window_offset,
                        ripple_times)


def _export_session_info(epoch_key, replay_info, data_folder, window_offset):
    filename = '{0}_{1:02d}_{2:02d}_TrialInfo.json'.format(*epoch_key)

    KEEP_COLUMNS = ['trial_id', 'start_time', 'end_time', 'predicted_state',
                    'replay_task', 'replay_order',
                    'session_time', 'linear_distance', 'speed',
                    'ripple_duration', 'head_direction']
    window_end = np.diff(window_offset).item() * TO_MILLISECONDS

    def convert_time(df):
        df = df.copy()
        end_time = ((df['end_time'] - df['start_time']).dt.total_seconds()
                    * TO_MILLISECONDS)
        start_time = ((df['start_time'] - df['start_time']).dt.total_seconds()
                      * TO_MILLISECONDS)
        df['ripple_start'] = start_time + window_end / 2
        df['ripple_end'] = end_time + window_end / 2
        return df

    (replay_info
     .rename(columns={'ripple_number': 'trial_id'})
     .loc[:, KEEP_COLUMNS]
     .pipe(convert_time)
     .assign(isIncluded='Included', start_time=0.0, end_time=window_end)
     .assign(ripple_duration=lambda df: df.ripple_duration.dt.total_seconds()
             * TO_MILLISECONDS)
     .to_json(path_or_buf=join(data_folder, filename), orient='records'))


def _export_neuron_info(epoch_key, replay_info, data_folder, window_offset,
                        ripple_times):
    neuron_info = make_neuron_dataframe(ANIMALS).xs(
        epoch_key, drop_level=False).query('numspikes > 0')
    n_trials = len(replay_info)

    COLUMN_MAP = {
        'neuron_id': 'Name',
        'area': 'Brain_Area',
        'animal': 'Subject',
    }

    KEEP_COLUMNS = ['Name', 'Brain_Area', 'Subject']
    neuron_data = (neuron_info
                   .reset_index()
                   .rename(columns=COLUMN_MAP)
                   .loc[:, KEEP_COLUMNS]
                   .assign(Number_of_Trials=n_trials)
                   ).to_dict(orient='records')

    for data, neuron_key in zip(neuron_data, neuron_info.index):
        logger.info(neuron_key)
        data['Spikes'] = _get_spikes(neuron_key, ripple_times, window_offset)
        filename = 'Neuron_{id}.json'.format(id=data['Name'])
        with open(join(data_folder, filename), 'w') as f:
            json.dump(data, f)


def _get_spikes(neuron_key, ripple_times, window_offset):
    spikes = get_spike_indicator_dataframe(neuron_key, ANIMALS)
    event_locked_spikes = reshape_to_segments(
        spikes, ripple_times, window_offset=window_offset,
        sampling_frequency=SAMPLING_FREQUENCY)
    KEEP_COLUMNS = ['trial_id', 'spikes']
    COLUMN_MAP = {0: 'is_spike', 'ripple_number': 'trial_id'}

    event_locked_spikes = (event_locked_spikes
                           .reset_index()
                           .rename(columns=COLUMN_MAP)
                           .assign(spikes=lambda df: df.time.dt.total_seconds()
                                   * TO_MILLISECONDS)
                           .query('is_spike == 1')
                           .loc[:, KEEP_COLUMNS])
    window_end = np.diff(window_offset).item() * TO_MILLISECONDS
    n_trials = len(ripple_times)

    data = []
    for trial_id in range(1, n_trials + 1):
        trial_data = event_locked_spikes.loc[
            event_locked_spikes.trial_id == trial_id]
        data.append(
            dict(trial_id=trial_id,
                 spikes=(trial_data.spikes + window_end / 2).tolist()))

    return data
