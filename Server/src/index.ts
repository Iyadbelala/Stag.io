import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ☕ Stag.io Server is running!
  📡 http://localhost:${PORT}
  🔧 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});
