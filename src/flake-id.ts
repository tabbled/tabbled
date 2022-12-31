import {Buffer} from 'buffer/'

export class FlakeId {
    constructor(id?: number, epoch?: number) {
        this.epoch = epoch || 1300000000000
        this.lastTime = 0;
        this.overflow = false;
        this.id = (id ? id : 1) & 0x3FF;
        this.genId = this.id;
        this.genId <<= 12;
    }

    private epoch: number = 0
    private lastTime: number = 0
    private overflow: boolean = false
    private seqMask = 0xFFF
    private seq = 0;
    private id: number
    private genId

    private POW10 = Math.pow(2, 10); // 2 ^ 10
    private POW26 = Math.pow(2, 26); // 2 ^ 26

    async generateId(): Promise<BigInt> {
        let id = new Buffer(8)

        let time = Date.now() - this.epoch;

        // Generates id in the same millisecond as the previous id
        if (time < this.lastTime) {
            throw new Error(`Clock moved backwards. Refusing to generate id for ${this.lastTime - time} milliseconds`);
        }
        if (time === this.lastTime) {

            // If all sequence values (4096 unique values including 0) have been used
            // to generate ids in the current millisecond (overflow is true) wait till next millisecond
            if (this.overflow) {
                throw new Error('Sequence exceeded its maximum value.');
            }

            // Increase sequence counter
            /*jslint bitwise: true */
            this.seq = (this.seq + 1) & this.seqMask;

            // sequence counter exceeded its max value (4095)
            // - set overflow flag and wait till next millisecond
            if (this.seq === 0) {
                this.overflow = true;
                throw new Error('Sequence exceeded its maximum value.');
            }
        } else {
            this.overflow = false;
            this.seq = 0;
        }
        this.lastTime = time;

        id.writeUInt32BE(((time & 0x3) << 22) | this.genId | this.seq, 4);
        id.writeUInt8(Math.floor(time / 4) & 0xFF, 4);
        id.writeUInt16BE(Math.floor(time / this.POW10) & 0xFFFF, 2);
        id.writeUInt16BE(Math.floor(time / this.POW26) & 0xFFFF, 0);



        return id.readBigInt64BE(0);
    }
}


