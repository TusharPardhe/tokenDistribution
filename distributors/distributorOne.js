const sendTransaction = require("../controllers/sendToken");
const path = require("path");
const accounts = path.resolve(__dirname, "../json/accountList1.json");

sendTransaction(accounts);
