const sendTransaction = require("../controllers/sendToken");
const path = require("path");
const accounts = path.resolve(__dirname, "../json/accountList3.json");

sendTransaction(accounts);
