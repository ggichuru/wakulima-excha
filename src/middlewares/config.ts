import express, { Express } from "express";
import cors from "cors";

export const configureMiddleware = (app: Express) => {
  // Body parser middleware
  app.use(express.json());

  // Form parser middleware
  app.use(express.urlencoded({ extended: true }));

  // Allow cors
  app.use(cors());
};
