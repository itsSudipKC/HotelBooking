// Must be the first import: ESM hoists all imports above other top-level
// code, so anything imported below reads process.env after this has run —
// but only because this is evaluated first, in source order, among them.
import 'dotenv/config';

import { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    validateEnv();
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
