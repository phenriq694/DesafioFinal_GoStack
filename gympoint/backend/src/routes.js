import { Router } from 'express';

import Student from './app/models/Student';

const routes = new Router();

routes.get('/', async (req, res) => {
  const student = await Student.create({
    name: 'Paulo Henrique',
    email: 'phenriq@gmail.com',
    password_hash: '1234145',
    age: 24,
    weight: 60.59,
    height: 1.7,
  });

  res.send(student);
});

export default routes;
