const fs = require("fs");
const path = require("path");
const accountJSONPath = path.resolve(__dirname, "../accounts.json");
const qualifiedaccountJSONPath = path.resolve(__dirname, "../qualified_accounts.json");
const excludedAccountsJSONPath = path.resolve(__dirname, "../excluded_accounts.json");

const checkKycStatus = require("./checkKycStatus");

require('dotenv').config({ path: path.resolve(__dirname, "../.env") });

const previousAirdrops = [1223.8, 1327, 1690.617, 1677.852, 2781.641, 2702.703, 3055.768];

const calcAvg = () => {
    console.log("Calculating...\n\n");

    const { accountData: data } = JSON.parse(fs.readFileSync(accountJSONPath));
    const filteredAccounts = {};

    const minBalance = parseInt(process.env.MIN_HOLDER_BALANCE);
    const maxBalance = parseInt(process.env.MAX_HOLDER_BALANCE);
    const qualified_accounts = {};
    const excluded_accounts = JSON.parse(fs.readFileSync(excludedAccountsJSONPath));

    const previousAirdropsSum = previousAirdrops.reduce((previousValue, currentValue) => previousValue + currentValue, 0.0);
    const averageMultiplier = parseFloat(process.env.MULTIPLIER);
    const firstPartOfEquation = averageMultiplier * previousAirdropsSum;
    let average = 0.0;

    // filter accounts based on max and min balances and remove excluded accounts
    Object.keys(data).forEach((acc) => {
        const balance = data[acc].balance;
        if ((balance >= minBalance && balance <= maxBalance) && !excluded_accounts.includes(acc)) {
            filteredAccounts[acc] = balance;
        }
    });

    // calculate average of filtered accounts
    const filteredAccKeys = Object.keys(filteredAccounts);
    filteredAccKeys.forEach(acc => {
        average += filteredAccounts[acc] / filteredAccKeys.length;
    });

    const fullAmount = firstPartOfEquation + average;

    // get accounts that pass threshold
    filteredAccKeys.forEach(acc => {
        if (filteredAccounts[acc] > fullAmount) {
            qualified_accounts[acc]= false;
        }
    });

    const payload = {
        average: fullAmount,
        accountData: qualified_accounts,
    };

    console.log("Previous airdrops sum (A):", previousAirdropsSum.toLocaleString("US"));
    console.log("Multiplier (M):", averageMultiplier.toLocaleString("US"));
    console.log("TL Average (T): ", average.toLocaleString("US"));
    console.log("\nEquation: (A * M) + T", "\x1b[32m");
    console.log("\nThreshold: ", fullAmount.toLocaleString("US"));
    console.log("Qualified Accounts: ", Object.keys(qualified_accounts).length.toLocaleString("US"));
    console.log("Airdrop Amount: ", (4000000 / Object.keys(qualified_accounts).length).toLocaleString("US"), "\x1b[0m")
    
    fs.writeFileSync(qualifiedaccountJSONPath, JSON.stringify(payload, null, "\t"));

    if (process.env.CHECK_KYC == "true") {
        checkKycStatus(fullAmount);
    }
};

calcAvg();
