import app from "./app";

const PORT = process.env.NODE_ENV === "development" ? 3000 : process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
