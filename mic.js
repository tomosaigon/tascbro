// Will request microphone permission to enable non-mDNS IP via WebRTC
function getLocalStream() {
    navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
            window.localStream = stream;
            // window.localAudio.srcObject = stream;
            // window.localAudio.autoplay = true;
        })
        .catch((err) => {
            console.error(`you got an error: ${err}`);
        });
}

// getLocalStream();

let rfc1918addr = ''; 
function setIfRfc1918(ip) {
    const octets = ip.split('.');
    document.getElementById('mic-ip').innerHTML = ip;
    if (octets.length == 4) {
        if (octets[0] == '192' && octets[1] == '168') {
            rfc1918addr = ip;
        }
        if (octets[0] == '172' /* also should be from 16 to 31 */) {
            // but don't overwrite a 192.168
            if (rfc1918addr == '') {
                rfc1918addr = ip;
            }
        }
        if (octets[0] == '10') {
            // but don't overwrite a 192.168
            if (rfc1918addr == '') {
                rfc1918addr = ip;
            }
        }
    }
}

// get IP from https://stackoverflow.com/questions/20194722/can-you-get-a-users-local-lan-ip-address-via-javascript
const findLocalIp = (logInfo = true) => new Promise( (resolve, reject) => {
    window.RTCPeerConnection = window.RTCPeerConnection 
                            || window.mozRTCPeerConnection 
                            || window.webkitRTCPeerConnection;

    if ( typeof window.RTCPeerConnection == 'undefined' )
        return reject('WebRTC not supported by browser');

    let pc = new RTCPeerConnection();
    let ips = [];

    pc.createDataChannel("");
    pc.createOffer()
     .then(offer => pc.setLocalDescription(offer))
     .catch(err => reject(err));
    pc.onicecandidate = event => {
        if ( !event || !event.candidate ) {
            // All ICE candidates have been sent.
            if ( ips.length == 0 )
                return reject('WebRTC disabled or restricted by browser');

            return resolve(ips);
        }

        let parts = event.candidate.candidate.split(' ');
        let [base,componentId,protocol,priority,ip,port,,type,...attr] = parts;
        let component = ['rtp', 'rtpc'];

        if ( ! ips.some(e => e == ip) )
            ips.push(ip);

        if ( ! logInfo )
            return;

        console.log(" candidate: " + base.split(':')[1]);
        console.log(" component: " + component[componentId - 1]);
        console.log("  protocol: " + protocol);
        console.log("  priority: " + priority);
        console.log("        ip: " + ip);
        setIfRfc1918(ip);
        console.log("      port: " + port);
        console.log("      type: " + type);

        if ( attr.length ) {
            console.log("attributes: ");
            for(let i = 0; i < attr.length; i += 2)
                console.log("> " + attr[i] + ": " + attr[i+1]);
        }

        console.log();
    };
} );