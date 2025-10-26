import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

const dbFile = path.join(__dirname,"..","database","local","db.json");
if(!fs.existsSync(dbFile)){
  fs.writeFileSync(dbFile, JSON.stringify({users:[{id:1,name:"admin",role:"admin"}],donations:[{id:1,donor:"Donante Inicial",amount:5.0,date:new Date().toISOString()}]},null,2));
}

const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

await db.read();
if(!db.data) db.data={users:[{id:1,name:"admin",role:"admin"}],donations:[{id:1,donor:"Donante Inicial",amount:5.0,date:new Date().toISOString()}]};
await db.write();

app.use("/", express.static(path.join(__dirname,"..","frontend")));

app.get("/api/donations", async (req,res)=>{
  await db.read();
  res.json(db.data.donations);
});
app.post("/api/donations", async (req,res)=>{
  const {donor,amount}=req.body;
  if(!donor||!amount) return res.status(400).json({error:"Datos inválidos"});
  const entry={id:Date.now(),donor,amount:Number(amount),date:new Date().toISOString()};
  db.data.donations.push(entry);
  await db.write();
  res.json(entry);
});

app.get("/api/users", async (req,res)=>{
  await db.read();
  res.json(db.data.users);
});
app.post("/api/users", async (req,res)=>{
  const {name,role}=req.body;
  const user={id:Date.now(),name,role:role||"user"};
  db.data.users.push(user);
  await db.write();
  res.json(user);
});

app.get("/api/summary", async (req,res)=>{
  await db.read();
  const users=db.data.users.length;
  const totalDonations=db.data.donations.reduce((sum,d)=>sum+Number(d.amount),0);
  res.json({users,totalDonations});
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log(`Servidor RicFullStack activo en http://localhost:${PORT}`));
