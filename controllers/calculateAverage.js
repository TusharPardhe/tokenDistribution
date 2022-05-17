const fs = require("fs");
const path = require("path");

const checkKycStatus = require("./checkKycStatus");
const accountJSONPath = path.resolve(__dirname, "../json/accounts.json");
const account1 = path.resolve(__dirname, "../json/accountList1.json");
const account2 = path.resolve(__dirname, "../json/accountList2.json");
const account3 = path.resolve(__dirname, "../json/accountList3.json");
const excludedAccountsJSONPath = path.resolve(__dirname, "../json/excluded_accounts.json");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const previousAirdrops = [1223.8, 1327, 1690.617, 1677.852, 2781.641, 2702.703, 3055.768];

// split into chunks
const splitArrayIntoChunksOfLen = (arr, len) => {
    var chunks = [],
        i = 0,
        n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, (i += len)));
    }
    return chunks;
};

const calcAvg = () => {
    console.log("Calculating...\n\n");

    const { accountData: data } = JSON.parse(fs.readFileSync(accountJSONPath));
    const filteredAccounts = {};
    const minBalance = parseInt(process.env.MIN_HOLDER_BALANCE);
    const maxBalance = parseInt(process.env.MAX_HOLDER_BALANCE);
    const accountsObj1 = {};
    const accountsObj2 = {};
    const accountsObj3 = {};
    const excluded_accounts = JSON.parse(fs.readFileSync(excludedAccountsJSONPath));
    const previousAirdropsSum = previousAirdrops.reduce((previousValue, currentValue) => previousValue + currentValue, 0.0);
    const averageMultiplier = parseFloat(process.env.MULTIPLIER);
    const firstPartOfEquation = averageMultiplier * previousAirdropsSum;
    let average = 0.0;

    // filter accounts based on max and min balances and remove excluded accounts
    Object.keys(data).forEach((acc) => {
        const balance = data[acc].balance;
        if (balance >= minBalance && balance <= maxBalance && !excluded_accounts.includes(acc)) {
            filteredAccounts[acc] = balance;
        }
    });

    // calculate average of filtered accounts
    const filteredAccKeys = Object.keys(filteredAccounts);
    filteredAccKeys.forEach((acc) => {
        average += filteredAccounts[acc] / filteredAccKeys.length;
    });
    const averageIncludingMultiplier = firstPartOfEquation + average;

    // split filterKeys
    const [keys1, keys2, keys3] = splitArrayIntoChunksOfLen(filteredAccKeys, filteredAccKeys.length / 3);
    const isEligibleAccount = (acc) => filteredAccounts[acc] > averageIncludingMultiplier;
    let qualified_accounts = 0;

    // get accounts that pass threshold
    keys1.forEach((acc) => {
        if (isEligibleAccount(acc)) {
            accountsObj1[acc] = false;
            qualified_accounts++;
        }
    });

    keys2.forEach((acc) => {
        if (isEligibleAccount(acc)) {
            accountsObj2[acc] = false;
            qualified_accounts++;
        }
    });

    keys3.forEach((acc) => {
        if (isEligibleAccount(acc)) {
            accountsObj3[acc] = false;
            qualified_accounts++;
        }
    });

    console.log("Previous airdrops sum (A):", previousAirdropsSum.toLocaleString("US"));
    console.log("Multiplier (M):", averageMultiplier.toLocaleString("US"));
    console.log("TL Average (T): ", average.toLocaleString("US"));
    console.log("\nEquation: (A * M) + T", "\x1b[32m");
    console.log("\nThreshold: ", averageIncludingMultiplier.toLocaleString("US"));
    console.log("Qualified Accounts: ", qualified_accounts.toLocaleString("US"));
    console.log("Airdrop Amount: ", (4000000 / qualified_accounts).toLocaleString("US"), "\x1b[0m");

    // writing into three files
    fs.writeFileSync(account1, JSON.stringify({ accountData: accountsObj1 }, null, "\t"));
    fs.writeFileSync(account2, JSON.stringify({ accountData: accountsObj2 }, null, "\t"));
    fs.writeFileSync(account3, JSON.stringify({ accountData: accountsObj3 }, null, "\t"));

    if (process.env.CHECK_KYC == "true") {
        checkKycStatus(averageIncludingMultiplier, account1);
        checkKycStatus(averageIncludingMultiplier, account2);
        checkKycStatus(averageIncludingMultiplier, account3);
    }
};

calcAvg();
