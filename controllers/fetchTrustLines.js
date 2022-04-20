const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");
const accountJSONPath = path.resolve(__dirname, "../accounts.json");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fetchTrustLines = () => {
        let data = {};
        console.log("Fetching trustlines...");
        const client = new xrpl.Client(process.env.WSS_SERVER);

        (async function getData(marker, index) {
            const payload = {
                command: "account_lines",
                account: process.env.PARENT_ACCOUNT,
                limit: 400,
            };

            console.log(`Trustline Batch: ${index} - ${marker} fetched`);

            try {
                await client.connect();

                if (marker) payload.marker = marker;
                const response = await client.request(payload);

                if (response.result.lines.length === 0 || !response.result.marker) {
                    client.disconnect();
                    const payload = {
                        accountData: data,
                    };
                    fs.writeFileSync(accountJSONPath, JSON.stringify(payload, null, "\t"));
                    process.exit(0);
                }

                response.result.lines.forEach((account) => {
                    if (account.balance !== "0") {
                        data[account.account] = {
                            balance: -1 * account.balance,
                        };
                    }
                });

                getData(response.result.marker, index + 1);
            } catch (err) {
                console.log(err);
                process.exit(0);
            }
        })(null, 1);
};

fetchTrustLines();
