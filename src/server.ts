import app from './app';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FounderBot server running at http://localhost:${PORT}`);
});
