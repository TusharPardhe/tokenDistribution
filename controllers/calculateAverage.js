const fs = require("fs");
const path = require("path");
const accountJSONPath = path.resolve(__dirname, "../accounts.json");
const qualifiedaccountJSONPath = path.resolve(__dirname, "../qualified_accounts.json");
const excludedAccountsJSONPath = path.resolve(__dirname, "../excluded_accounts.json");

const checkKycStatus = require("./checkKycStatus");

require('dotenv').config({ path: path.resolve(__dirname, "../.env") });

const calcAvg = () => {
    console.log("Calculating average...");

    const { accountData: data } = JSON.parse(fs.readFileSync(accountJSONPath));
    const totalLength = Object.keys(data).length;
    const minBalance = parseInt(process.env.MIN_HOLDER_BALANCE);
    const maxBalance = parseInt(process.env.MAX_HOLDER_BALANCE);
    const qualified_accounts = {};
    const excluded_accounts = JSON.parse(fs.readFileSync(excludedAccountsJSONPath));

    let average = parseFloat(process.env.INCLUDE_IN_AVERAGE);
    console.log(average);
    Object.keys(data).map((acc) => {
        const balance = data[acc].balance;
        if ((balance >= minBalance && balance <= maxBalance) && !excluded_accounts.includes(acc)) {
            average += balance / totalLength;
            // console.log(balance / totalLength);
        }
    });

    Object.keys(data).map(acc => {
        if (data[acc].balance > average && !excluded_accounts.includes(acc)) {
            qualified_accounts[acc]= false;
        }
    });

    const payload = {
        average: average,
        accountData: qualified_accounts,
    };

    console.log("Average: ", average.toLocaleString("US"));
    console.log("Qualified Accounts: ", Object.keys(qualified_accounts).length.toLocaleString("US"));
    
    fs.writeFileSync(qualifiedaccountJSONPath, JSON.stringify(payload, null, "\t"));

    if (process.env.CHECK_KYC == "true") {
        checkKycStatus(average);
    }
};

calcAvg();
