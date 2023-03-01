import { bsv } from 'scrypt-ts'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

const dotenvConfigPath = '.env'
dotenv.config({ path: dotenvConfigPath })

// fill in private key on testnet in WIF here
let privKey = process.env.PRIVATE_KEY
if (!privKey) {
    genPrivKey()
}

export function genPrivKey() {
    const newPrivKey = bsv.PrivateKey.fromRandom('testnet')
    console.log(`Missing private key, generating a new one ...
Private key generated: '${newPrivKey.toWIF()}'
You can fund its address '${newPrivKey.toAddress()}' from sCrypt faucet https://scrypt.io/#faucet`)
    // auto generate .env file with new generated key
    fs.writeFileSync(dotenvConfigPath, `PRIVATE_KEY="${newPrivKey}"`)
    privKey = newPrivKey.toWIF()
}

export const myPrivateKey = bsv.PrivateKey.fromWIF(privKey)
export const myPublicKey = bsv.PublicKey.fromPrivateKey(myPrivateKey)
export const myPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(
    myPublicKey.toBuffer()
)
export const myAddress = myPublicKey.toAddress()
