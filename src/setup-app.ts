import express, { Express, Request, Response } from 'express';

export const setupApp = (app: Express) => {
  app.use(express.json()); //middleware express.json() парсит JSON в теле запроса и добавляет его как объект в свойство body запроса (req.body.).
  return app;
};
