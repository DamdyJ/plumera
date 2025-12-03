import app from "./app";

const PORT =
  process.env.NODE_ENV === "development" ? 3000 : process.env.PORT || 3000;

// Only listen if not on Vercel (serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
