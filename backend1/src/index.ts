import { initServer } from "./app";
import * as dotenv from "dotenv"
dotenv.config();
const PORT=process.env.PORT || 8000;
async function init(){
  const { server } = await initServer();
  server.listen(PORT,'0.0.0.0',()=>console.log(`server started at PORT: ${PORT}`));
}
init();