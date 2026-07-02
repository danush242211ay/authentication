import express from 'express';
import morgan from 'morgan';
import authrouter  from './routes/auth.routes.js';


const app = express();
app.use(express.json());
app.use(morgan("dev"))
app.use('/api/auth',authrouter);

export default app;