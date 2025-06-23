/**
 * Renders spikes onto a canvas with a simple fade-in animation (D3 v3-compatible).
 *
 * ‼ NOTE: D3 v3 timers stop when the callback **returns true** – there is no
 *         `Timer.stop()` method.  A small cancel-hook is attached to the
 *         canvas so outside code can interrupt the animation when switching
 *         neurons.
 *
 * @param {HTMLCanvasElement} canvas              The canvas element to draw on.
 * @param {Array<Object>}     sessionInfo         Trial objects with spike data.
 * @param {Function}          timeScale           D3 scale: ms → px.
 * @param {Function}          yScale              D3 ordinal scale: trial → px.
 * @param {string}            curEvent            Key used to align spike times.
 * @param {string}            interactionFactor   Field used to colour spikes.
 * @param {Function}          colorScale          D3 colour scale.
 * @param {number}            [duration=1000]     Fade-in duration (ms).
 */
export default function animateSpikesOnCanvas(
    canvas,
    sessionInfo,
    timeScale,
    yScale,
    curEvent,
    interactionFactor,
    colorScale,
    duration = 1000
) {
    const ctx = canvas.getContext('2d');

    /* ──────────────────────────────────────────────────────────────────────────
     * 1.  Cancel any animation already running for this canvas
     * ─────────────────────────────────────────────────────────────────────── */
    if (canvas.__animation_cancel) {
        canvas.__animation_cancel(); // flag previous timer to finish immediately
    }

    /* ──────────────────────────────────────────────────────────────────────────
     * 2.  Prepare spike data: [relativeTime(ms), trialIndex]
     *    (Use Array#reduce to stay ES5-friendly and avoid optional chaining /
     *     nullish-coalescing that older bundlers choke on.)
     * ─────────────────────────────────────────────────────────────────────── */
    const spikeData = sessionInfo.reduce(function (acc, trial, i) {
        if (!Array.isArray(trial.spikes)) return acc;
        for (var s = 0; s < trial.spikes.length; ++s) {
            acc.push([trial.spikes[s] - trial[curEvent], i]);
        }
        return acc;
    }, []);

    const factorLevels = sessionInfo.map(function (d) { return d[interactionFactor]; });
    // yScale.bandwidth() exists in v4+, rangeBand() in v3 – support both:
    const circleR = (typeof yScale.bandwidth === 'function' ? yScale.bandwidth() : yScale.rangeBand()) / 2;

    /* ──────────────────────────────────────────────────────────────────────────
     * 3.  Start the D3 v3 timer.  Returning **true** stops the timer.
     * ─────────────────────────────────────────────────────────────────────── */
    var cancelled = false;
    canvas.__animation_cancel = function () {
        cancelled = true;
    };

    d3.timer(function (elapsed) {
        if (cancelled) return true; // interrupt immediately if a new neuron is selected

        // Animation progress 0→1
        var progress = Math.min(1, elapsed / duration);

        // Clear & draw current frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = progress;

        for (var j = 0; j < spikeData.length; ++j) {
            var t = spikeData[j][0];
            var trialIdx = spikeData[j][1];
            var cx = timeScale(t);
            var cy = yScale(trialIdx) + circleR;
            var factor = (factorLevels[trialIdx] === undefined ? 'Spike' : factorLevels[trialIdx]);

            ctx.fillStyle = colorScale(factor);
            ctx.beginPath();
            ctx.arc(cx, cy, circleR, 0, 2 * Math.PI);
            ctx.fill();
        }

        // End of animation – freeze final frame and stop timer
        if (progress >= 1) {
            ctx.globalAlpha = 1;
            return true; // ← required to stop the timer in D3 v3
        }
    });
}