import dotenv from 'dotenv'
dotenv.config()
import cluster from "cluster";
import os from 'os'
import { startServer } from ".";

const isDev=process.env.NODE_ENV!=="production"



const numOFCups=isDev?4:os.cpus().length

// console.log("numOFCups",numOFCups)


if(cluster.isPrimary){
    // console.log(`Primary process ${process.pid} is running 🥀🥀🥀`)
    // console.log(`swamping ${numOFCups} running processes ....`)
    for(let i=0;i<numOFCups;i++){
      cluster.fork()
    }
    cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

}
else{
    startServer()
}




// startServer()

