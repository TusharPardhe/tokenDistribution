
const fs = require("fs");
const path = require("path");

const qualifiedaccountJSONPath = path.resolve(__dirname, "qualified_accounts.json");

const x = () => {
    const { accountData: data, average } = JSON.parse(fs.readFileSync(qualifiedaccountJSONPath));
	console.log(4000000 / Object.keys(data).length, Object.keys(data).length);
};

x();
