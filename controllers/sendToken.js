const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");
const transactionsFile = path.resolve(__dirname, "../transactionsHash.txt");
const qualifiedaccountJSONPath = path.resolve(__dirname, "../qualified_accounts.json");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sendTransaction = async () => {
    const client = new xrpl.Client(process.env.WSS_SERVER);
    await client.connect();
    const { accountData: data } = JSON.parse(fs.readFileSync(qualifiedaccountJSONPath));
    console.log("Sending Tokens...");

    for (account in data) {
        await new Promise(async (resolve, reject) => {
            try {
                const wallet = xrpl.Wallet.fromSeed(process.env.AIRDROP_ACCOUNT_SECRET_KEY);
                const payload = payloadForTokens(wallet, account);
                const prepared_payload = await client.autofill(payload);
                const signed = wallet.sign(prepared_payload);
                const response = await client.submitAndWait(signed.tx_blob);
                console.log(`Transaction: ${account}: ${response.result.hash}`);
                fs.appendFile(transactionsFile, `${account}: ${response.result.hash}\n`, (err) => {
                    if (err) throw err;
                    resolve();
                });
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    }
    client.disconnect();
};

// const payloadForXRP = (wallet) => {
//     const payload = {
//         "TransactionType": "Payment",
//         "Account": wallet.address,
//         "Amount": xrpl.xrpToDrops("1"),
//         "Destination": "rD3hvFSmMYD3XJuA36gERYASasxiZwkji7",
//         "Memos":[
//             {
//                 "Memo":{
//                     "MemoData": xrpl.convertStringToHex("This is a test message"),
//                 }
//             }
//         ]
//     }
//     return payload;
// }

const payloadForTokens = (wallet, destinationAddress) => {
    const payload = {
        "TransactionType": "Payment",
        "Account": wallet.address,
        "Amount": {
            "currency": process.env.CURRENCY,
            "value": process.env.AIRDROP_AMOUNT,
            "issuer": process.env.PARENT_ACCOUNT,
        },
        "Memos": [
            {
                "Memo": {
                    "MemoData": xrpl.convertStringToHex("I adore memes! Do you have any? By the way you will receive something special in near future."),
                }
            }
        ],
        "Destination": destinationAddress,
    }
    return payload;
}

sendTransaction();
