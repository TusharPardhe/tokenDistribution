const fs = require("fs");
const path = require("path");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const checkKycStatus = async (average, accountFilePath) => {
    const options = {
        method: "GET",
        headers: { Accept: "application/json" },
    };
    console.log("Checking KYC Status...");

    const { accountData: data, ...otherDetails } = JSON.parse(fs.readFileSync(accountFilePath));
    const maxBalance = parseInt(process.env.MAX_HOLDER_BALANCE);
    let i = 1;

    for (const account in data) {
        await new Promise((resolve, reject) => {
            if (data[account].balance >= average && data[account].balance <= maxBalance) {
                fetch(`https://xumm.app/api/v1/platform/kyc-status/${account}`, options, 10000)
                    .then((response) => response.json())
                    .then((response) => {
                        const { kycApproved } = response;
                        data[account] = {
                            ...data[account],
                            kycApproved,
                        };
                        console.log(`${account}: ${kycApproved} ${i++}`);
                        resolve();
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                        return;
                    });
            } else resolve();
        });
    }
    const payload = {
        ...otherDetails,
        accountData: data,
    };

    fs.writeFileSync(accountFilePath, JSON.stringify(payload, null, "\t"));
};

module.exports = checkKycStatus;