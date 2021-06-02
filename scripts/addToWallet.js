/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { Wallets } = require('fabric-network');
const path = require('path');

async function main() {

    // Main try/catch block
    try {
        // A wallet stores a collection of identities
        const wallet = await Wallets.newFileSystemWallet('/home/ted/Documents/Fabric_AMLNodeSDK/wallet');

        // Identity to credentials to be stored in the wallet
        const credPath = '/home/ted/AML_fabricTest/org0/admin/msp';
        const cert = fs.readFileSync(path.join(credPath, 'signcerts/cert.pem')).toString(); 
        const key = fs.readFileSync(path.join(credPath, 'keystore/key.pem')).toString(); 
        
        // Load credentials into wallet
        const identityLabel = 'org0User'; 

        const identity = {
            credentials: {
        	certificate: cert,
        	privateKey: key,
            },
            mspId: 'org0MSP',
            type: 'X.509'
        }

        await wallet.put(identityLabel,identity);

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(() => {
    console.log('done');
}).catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
