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

let logStr;
let queryResponseJson;
async function Query(user, queryStr) {
    logStr = ''
    queryResponseJson = null
    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('/home/ted/Documents/Fabric_AMLNodeSDK/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = user + 'User';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.load(fs.readFileSync(`/home/ted/Documents/Fabric_AMLNodeSDK/gateway/connection-${user}.yaml`, 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            //because node is in docker, asLocalhost should be true
            discovery: { enabled: true, asLocalhost: true }
        };
        // Connect to gateway using application specified parameters
        logStr = 'Connect to Fabric gateway.\n'

        await gateway.connect(connectionProfile, connectionOptions)

        // Access AML network and chaincode
        const channelName = 'amlchannel'
        const chaincodeName = 'amlchaincode1_4'
        logStr += `Use network channel: ${channelName}\n`

        const network = await gateway.getNetwork(channelName);

        // Get addressability to commercial AML contract
        logStr += `Use AML smart contract.\n`

        const contract = await network.getContract(chaincodeName);

        // Query
        logStr += `Submit aml Query.\n`
        //couchdb query with json format
        const queryResponse = await contract.evaluateTransaction('Query', `\
        { \
            "selector":{ \
                ${queryStr} \
            } \
        }`);

        // process response
        logStr += `Process Query response.\n`

        // let queryResult = JSON.stringify(JSON.parse(queryResponse.toString()), null, 2);
        // logStr += `${queryResult}\n`
        
        queryResponseJson = JSON.parse(queryResponse.toString())

        logStr += `Query complete.\n`

    } catch (error) {
        logStr += `Error processing Query. ${error}\n`
        logStr += `${error.stack}\n`
        
    } finally {
        // Disconnect from the gateway
        logStr += `Disconnect from Fabric gateway.\n`
        gateway.disconnect();
        return {
            logStr: logStr, 
            queryResponseJson: queryResponseJson
        };
    }
}


module.exports = {
    Query: Query
}