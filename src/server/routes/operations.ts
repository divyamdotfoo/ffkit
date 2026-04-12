import { Router } from "express";

export function createOperationsRouter(): Router {
  const router = Router();

  router.post("/v1/operations/:id", (req, res) => {
    res.status(501).json({
      error: "Not implemented",
      id: req.params.id,
      hint: "Wire this route to core executor when operations are ready.",
    });
  });

  return router;
}
