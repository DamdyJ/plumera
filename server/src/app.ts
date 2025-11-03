import express, { json, urlencoded } from 'express'
import helmet from 'helmet';

const app = express();
app.use(urlencoded({ extended: true }))
app.use(json())
app.use(helmet())

app.get("/api/test", (req, res) => {
    res.send("Hello World!");
    console.log("Response sent");
});

export default app;