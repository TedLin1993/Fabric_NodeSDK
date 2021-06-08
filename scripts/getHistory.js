/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const { json } = require('sjcl');
//const CommercialPaper = require('../contract/lib/paper.js');

// Main program function
async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('/home/ted/Documents/Fabric_AMLNodeSDK/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        // const userName = 'isabella.issuer@magnetocorp.com';
        const userName = 'org0User';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.load(fs.readFileSync('/home/ted/Documents/Fabric_AMLNodeSDK/gateway/connection-org0.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            //because node is in docker, asLocalhost should be true
            discovery: { enabled: true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access AML network
        const channelName = 'amlchannel'
        console.log('Use network channel: ' + channelName);

        const network = await gateway.getNetwork(channelName);

        // Get addressability to commercial AML contract
        console.log('Use AML smart contract.');

        const contract = await network.getContract('amlchaincode1_4');

        // GetHistory
        console.log('AML GetHistory.');
        //couchdb query with json format
        const GetHistoryResponse = await contract.evaluateTransaction('GetHistory', 'D111111111', 'org0MSP');

        // process response
        console.log('Process GetHistory response.');
        let GetHistoryResult = JSON.stringify(JSON.parse(GetHistoryResponse.toString()), null, 2);

        console.log(GetHistoryResult);
        console.log('GetHistory complete.');
        
    } catch (error) {

        console.log(`Error processing GetHistory. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();
        process.exit(1);
    }
}
main().then(() => {

    console.log('GetHistory program complete.');

}).catch((e) => {

    console.log('GetHistory program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
