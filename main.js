let formCounter = 0;
const state = [newExperiment()];

document.addEventListener('DOMContentLoaded', function () {
    reproduceForm();
});

function newExperiment() {
    return { url: null, times: [], stats: {} };
}

function getFormByIdx(idx) {
    return document.getElementById('urlForm-' + idx);
}

function reproduceForm() {
    // Append a new copy of the form
    let form = getFormByIdx(0);
    let clone = form.cloneNode(true);
    clone.style.display = 'block'; // not none

    formCounter++;
    clone.id = 'urlForm-' + formCounter;
    let spanCount = clone.getElementsByClassName("form-idx")[0];
    spanCount.innerHTML = formCounter;

    form.parentNode.appendChild(clone);
}

function getUrlByIdx(cur) {
    return getFormByIdx(cur).getElementsByClassName('url-input')[0].value;
}

function renderStats(cur) {
    const form = getFormByIdx(cur);
    const stats = state[cur].stats;
    for (let field of ['count', 'min', 'max', 'mean', 'median', 'stdev']) {
        form.getElementsByClassName(field)[0].innerHTML = '<span>' + stats[field] + '</span>';
    }
}

function handleButton(e) {
    const cur = parseInt(e.parentNode.id.split('-')[1]);
    if (cur == formCounter) {
        let experiment = newExperiment();
        experiment.url = getUrlByIdx(cur);
        state.push(experiment);
        lockUrlInput();
        reproduceForm();
    }

    measurers[measureMethod].fn(getUrlByIdx(cur), function (t) {
        console.log(`[${cur}] measured: ${t}`);
        state[cur].times.push(t)
        state[cur].stats = calculateStatistics(state[cur].times);
        renderStats(cur);
    });
}

function lockUrlInput() {
    // Make the URL input field no longer editable
    getFormByIdx(formCounter).getElementsByClassName('url-input')[0].readOnly = true;
}

function calculateStatistics(numbers) {
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const sum = numbers.reduce((acc, current) => acc + current, 0);
    const mean = sum / numbers.length;

    // sort the array in ascending order
    const sorted = numbers.sort((a, b) => a - b);
    let median;
    if (sorted.length % 2 === 0) {
        // if the array has an even number of elements, the median is the average of the two middle elements
        median = (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    } else {
        // if the array has an odd number of elements, the median is the middle element
        median = sorted[Math.floor(sorted.length / 2)];
    }

    // calculate the standard deviation
    let stdev = 0;
    for (const number of numbers) {
        stdev += (number - mean) ** 2;
    }
    stdev = Math.sqrt(stdev / numbers.length);

    const count = numbers.length;

    return {
        count,
        min,
        max,
        mean,
        median,
        stdev
    };
}
