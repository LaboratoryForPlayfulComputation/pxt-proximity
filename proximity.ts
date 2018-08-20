//% color=#0062dB weight=96 icon="\uf500" block="Proximity"
namespace proximity {
    /* For saving most recent info */
    let lastNumber: number = -1;
    let lastString: string = "";
    let lastBuffer: Buffer = null;
    let lastTime: number = -1;
    let lastSerial: number = -1;
    let lastSignal: number = -1;
    let knownMicrobits: Array<RemoteMicrobit> = [];
    let msgCount: number = 0;

    export class RemoteMicrobit {
        public serial: number;
        public lastReceivedNumber: number;
        public lastReceivedString: string;
        public lastReceivedBuffer: Buffer;
        public lastReceivedTime: number;
        public lastReceivedSignal: number;
        public lastReceivedNumbers: Array<number>;
        public lastReceivedStrings: Array<string>;
        public lastReceivedBuffers: Array<Buffer>;
        public lastReceivedTimes: Array<number>;
        public lastReceivedSignals: Array<number>;
        
        constructor(serial: number) {
            this.serial = serial;
            this.lastReceivedSignal = -1;
            this.lastReceivedSignals = [-1, -1, -1];
        }

        public averageLastReceivedSignals(): number {
            let sum = 0;
            let denominator = 0;
            for (let i = 0; i < this.lastReceivedSignals.length; i++){
                let signal = this.lastReceivedSignals[i];
                if (signal != -1) {
                    sum += signal;
                    denominator += 1;
                }
            }

            if (denominator == 0)
                return -1;
            
            return sum / denominator;
        }
    }

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
        lastSerial = packet.serial;
        let microbitAlreadyAdded = false;
        for (let i = 0; i < knownMicrobits.length; i++) {
            if (knownMicrobits[i].serial == packet.serial) {
                knownMicrobits[i].lastReceivedSignal = packet.signal;
                microbitAlreadyAdded = true;
            }
        }
        if (!microbitAlreadyAdded) {
            let microbit = new RemoteMicrobit(packet.serial);
            //microbit.serial = packet.serial;
            microbit.lastReceivedSignal = packet.signal;
            knownMicrobits.push(microbit);
        }
        msgCount += 1;
    });

    radio.setTransmitSerialNumber(true);

    /** 
     * 
    */
    //% blockId=proximity_signal block="signal of other microbit %serialNo" blockGap=8
    export function signalStrengthOfRemoteMicrobit(serialNo: number): number {
        for (let i = 0; i < knownMicrobits.length; i++) {
            if (knownMicrobits[i].serial == serialNo) {
                return knownMicrobits[i].lastReceivedSignal;
            }
        }
        return -1;
    }

    /** 
     * 
    */
    //% blockId=proximity_signal_avg block="average signal of other microbit %serialNo" blockGap=8
    export function signalStrengthOfRemoteMicrobitAveraged(serialNo: number): number {
        for (let i = 0; i < knownMicrobits.length; i++) {
            if (knownMicrobits[i].serial == serialNo) {
                // return knownMicrobits[i].averageLastReceivedSignals();
                return knownMicrobits[i].lastReceivedSignal;
            }
        }
        return -1;
    }

    /** 
     * 
    */
    //% blockId=proximity_group block="set group %id" blockGap=8
    export function setGroup(id: number){
        radio.setGroup(id);
    }

    /** 
     * 
    */
    //% blockId=proximity_power block="set transmit power %power" blockGap=8
    export function setTransmitPower(power: number){
        radio.setTransmitPower(power);
    }

    /** 
     * 
    */
    //% blockId=proximity_send_num block="send number %num" blockGap=8
    export function sendNumber(num: number){
        radio.sendNumber(num);
    }    

    /** 
     * 
    */
    //% blockId=proximity_send_string block="send string %str" blockGap=8
    export function sendString(str: string){
        radio.sendString(str);
    }  
    
    /** 
     * 
    */
    //% blockId=proximity_map block="map %input| from %min_input| to %max_input| to %min_output| to %max_output" blockGap=8
    //% inlineInputMode="external" 
    export function map(num: number, in_min: number, in_max: number, out_min: number, out_max: number): number{
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }      

}