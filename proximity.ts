//% color=#0062dB weight=96 icon="\uf294" block="Proximity"
namespace proximity {
    /* For saving most recent info */
    let lastNumber: number = -1;
    let lastString: string = "";
    let lastBuffer: Buffer = null;
    let lastTime: number = -1;
    let lastSerial: number = -1;
    let lastSignal: number = -1;
    let lastKnownInformation: any = {};

    export class Packet {
        /**
         * The number payload if a number was sent in this packet (via ``sendNumber()`` or ``sendValue()``)
         * or 0 if this packet did not contain a number.
         */
        public receivedNumber: number;
        /**
         * The string payload if a string was sent in this packet (via ``sendString()`` or ``sendValue()``)
         * or the empty string if this packet did not contain a string.
         */
        public receivedString: string;
        /**
         * The buffer payload if a buffer was sent in this packet
         * or the empty buffer
         */
        public receivedBuffer: Buffer;
        /**
         * The system time of the sender of the packet at the time the packet was sent.
         */
        public time: number;
        /**
         * The serial number of the sender of the packet or 0 if the sender did not sent their serial number.
         */
        public serial: number;
        /**
         * The received signal strength indicator (RSSI) of the packet.
         */
        public signal: number;
    }

    /* Whenever a new packet is recevied, update the last known packet information */
    radio.onDataReceived(() => {
        radio.receiveNumber();
        const packet = new Packet();
        packet.receivedNumber = radio.receivedNumber();
        packet.time = radio.receivedTime();
        packet.serial = radio.receivedSerial();
        packet.receivedString = radio.receivedString();
        packet.receivedBuffer = radio.receivedBuffer();
        packet.signal = radio.receivedSignalStrength();
        if (packet.receivedNumber)
            lastNumber = packet.receivedNumber;
        if (packet.receivedString)
            lastString = packet.receivedString;
        if (packet.receivedBuffer)
            lastBuffer = packet.receivedBuffer;
        if (packet.time)
            lastTime = packet.time;
        if (packet.serial)
            lastSerial = packet.serial;
        if (packet.signal)
            lastSignal = packet.signal;
        lastKnownInformation[lastSerial] = {"number": lastNumber, "string": lastString, "buffer": lastBuffer, "time": lastTime, "signal": lastSignal};
        cb(packet)
    });

    /** 
     * 
    */
    //% blockId=radio_other_signal block="signal of other microbit %serialNo" blockGap=8
    export function signalStrengthOfRemoteMicrobit(serialNo: number): number {
        if (lastSerial == serialNo) {
            return lastSignal;
        }
        return -1;
    }
}
