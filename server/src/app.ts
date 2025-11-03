import express, { json, urlencoded } from 'express'

const app = express();
app.use(urlencoded({ extended: true }))
app.use(json())

app.get("/api/test", (req, res) => {
    res.send("Hello World!");
    console.log("Response sent");
});

export default app;