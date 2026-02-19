/**
 * Store: Call State
 * Estado global de chamada - compartilhado entre PhoneShell e Phone.jsx
 * Necessário porque o Phone.jsx pode não estar montado quando a chamada chega.
 */

let _incomingCall = null;
let _listeners = [];

export function setIncomingCall(data) {
    _incomingCall = data;
    _listeners.forEach(fn => fn(data));
}

export function getIncomingCall() {
    return _incomingCall;
}

export function clearIncomingCall() {
    _incomingCall = null;
}

export function onIncomingCallChange(fn) {
    _listeners.push(fn);
    return () => {
        _listeners = _listeners.filter(l => l !== fn);
    };
}
