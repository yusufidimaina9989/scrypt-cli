import {
    method,
    prop,
    SmartContract,
    hash256,
    assert,
    ByteString,
    SigHash
} from 'scrypt-ts'

export class PROJECT_NAME extends SmartContract {
    @prop(true)
    count: bigint

    constructor(count: bigint) {
        super(count)
        this.count = count
    }

    @method(SigHash.SINGLE)
    public increment() {
        this.count++

        // make sure balance in the contract does not change
        const amount: bigint = this.ctx.utxo.value
        // output containing the latest state
        const output: ByteString = this.buildStateOutput(amount)
        // verify current tx has this single output
        assert(this.ctx.hashOutputs === hash256(output), 'hashOutputs mismatch')
    }
}
