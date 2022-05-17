const sendTransaction = require("../controllers/sendToken");
const path = require("path");
const accounts = path.resolve(__dirname, "../json/accountList2.json");

sendTransaction(accounts);
