const fetchTrustLines = require("./controllers/fetchTrustLines");
const calcAvg = require("./controllers/calculateAverage");

fetchTrustLines().then(res=>{
    if(res){
        calcAvg();
    }else {
        console.log("Try again some error occurred");
        process.exit(0);
    }
})
