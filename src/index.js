import dotenv from "dotenv"
import { dbConnect } from "./db/db.js";
import { app } from "./app.js";
dotenv.config();

const port = process.env.PORT || 3000;

dbConnect()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server running on port: ${port}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failled !! ",err);
    
})