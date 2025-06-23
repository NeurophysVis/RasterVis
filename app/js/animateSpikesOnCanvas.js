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