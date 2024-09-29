import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const app = express();

app.use(express.json());

app.get('/status', AppController.getStatus);
app.get('/stats', AppController.getStats);
app.post('/users', UsersController.postNew);
app.get('/connect', AuthController.getConnect);
app.get('/disconnect', AuthController.getDisconnect);
app.get('/users/me', UsersController.getMe);
app.post('/files', FilesController.postUpload);

export default app;
