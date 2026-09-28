import { Router } from "express";
import prisma from "../prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", async (req, res) => {
  const products = await prisma.product.findMany();

  res.json(products);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const product = await prisma.product.findUnique({
  where: {
    pid: id
  }
});

res.json(product);
});

router.post("/", authMiddleware, async (req, res) => {
  const { productName, price, description, stock } = req.body;

  const product = await prisma.product.create({
  data: {
    productName,
    price,
    description,
    stock
  }
 });
 res.status(201).json(product);
});

router.put("/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { productName, price, description, stock } = req.body;

  const product = await prisma.product.update({
  where: {
    pid: id
  },
  data: {
    productName,
    price,
    description,
    stock
  }
});
res.json(product);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  const product = await prisma.product.delete({
  where: {
    pid: id
  }
});
res.json(product);
});

export default router;