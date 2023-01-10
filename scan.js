const ipTimes = {};
const timesIp = {};
const times = [];
const NUM_CLUSTS = 3;
const NUM_ITERS = 750;
let C = '192.168.1';
let fn = getImageMeasurement;

function setC(newC) {
    C = newC;
}

function generateClusters() {
    clusterMaker.k(NUM_CLUSTS);
    clusterMaker.iterations(NUM_ITERS);
    clusterMaker.data(times.map(t => [t]));
    console.log(clusterMaker.clusters());

    console.log(ipTimes);
    console.log(timesIp);
}

function round(num) {
    return Math.round(num * 1000) / 1000;
}
function render() {
    const table = document.getElementById('hosts');
    for (let ip in coloredIps) {
        const pos = table.rows.length - 1;
        const newRow = table.insertRow(pos);
        newRow.style.color = coloredIps[ip].color;
        newRow.className = coloredIps[ip].color;
        const tdIp = newRow.insertCell(0);
        const tdK = newRow.insertCell(1);
        const tdTime = newRow.insertCell(2);
        tdIp.innerHTML = C + '.' + ip; //;
        tdK.innerHTML = `<span style="font-size: 0.75em;">(${round(coloredIps[ip].centroid)})</span>`;
        tdTime.innerHTML = round(coloredIps[ip].t);
    }
}

function hideBoringIps() {
    const els = document.getElementsByClassName('lightgrey');
    for (let i = 0; i < els.length; i++) {
        els[i].style.display = 'none';
    }
}
async function handleButton(_e) {
    for (let i = 1; i < 255; i++) {
        let ip = C + '.' + i;
        let url = 'http://' + ip + '/';
        fn(url, function (t) {
            console.log("time ", t, " for .", i);
            ipTimes[i] = t;
            // IPs unique, times may not be
            if (t in timesIp) {
                timesIp[t].push(i);
            } else {
                timesIp[t] = [i];
            }
            times.push(t);
        })
        await (new Promise(resolve => setTimeout(resolve, 400)));
    }
    console.log("wait 3s for requests to finish");
    await (new Promise(resolve => setTimeout(resolve, 3000)));

    generateClusters();
    generateColoredIps();
    render();
}


let coloredIps = {};
function generateColoredIps() {
    let clusts = clusterMaker.clusters();
    const max = clusts.map(c => c.points.length).reduce((a, b) => a > b ? a : b);
    const min = clusts.map(c => c.points.length).reduce((a, b) => a < b ? a : b);

    for (let i = 0; i < clusts.length; i++) {
        const clust = clusts[i];
        const centroid = clust.centroid[0];
        let color = 'blue';
        if (clust.points.length == min) {
            color = 'green';
        } else if (clust.points.length == max) {
            color = 'lightgrey';
        }
        for (let j = 0; j < clust.points.length; j++) {
            const t = clust.points[j][0];
            const ips = timesIp[t];
            for (let k = 0; k < ips.length; k++) {
                let ip = ips[k];
                coloredIps[ip] = { color, t, centroid };
            }
        }
    }

    console.log(coloredIps);
}
