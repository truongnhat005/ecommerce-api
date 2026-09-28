import { Router } from "express";
import prisma from "../prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// Lấy danh sách đơn hàng
router.get("/", authMiddleware, async (req, res) => {
  const orders = await prisma.order.findMany();

  res.json(orders);
});

// Lấy đơn hàng theo ID
router.get("/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  const order = await prisma.order.findUnique({
    where: {
      oid: id
    }
  });

  res.json(order);
});

// Tạo đơn hàng
router.post("/", authMiddleware, async (req, res) => {
  const uid = req.user.uid;
  const { items } = req.body;

  let total = 0;

  // Kiểm tra sản phẩm và tính tổng tiền
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: {
        pid: item.pid
      }
    });

    // Kiểm tra sản phẩm có tồn tại không
    if (!product) {
      return res.status(404).json({
        message: `Không tìm thấy sản phẩm có pid ${item.pid}`
      });
    }

    // Kiểm tra số lượng tồn kho
    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `Sản phẩm ${product.productName} không đủ số lượng trong kho`
      });
    }

    // Tính tổng tiền
    total += Number(product.price) * item.quantity;
  }

  // Tạo Order
  const order = await prisma.order.create({
    data: {
      uid,
      total
    }
  });

  // Tạo OrderDetail và trừ tồn kho
  for (const item of items) {
    await prisma.orderDetail.create({
      data: {
        oid: order.oid,
        pid: item.pid,
        quantity: item.quantity
      }
    });

    await prisma.product.update({
      where: {
        pid: item.pid
      },
      data: {
        stock: {
          decrement: item.quantity
        }
      }
    });
  }

  // Lấy thông tin người đặt hàng
  const user = await prisma.user.findUnique({
    where: {
      uid
    }
  });

  // Tạo Shipment
  await prisma.shipment.create({
    data: {
      oid: order.oid,
      shipmentDate: new Date(),
      address: user.address,
      status: "Pending"
    }
  });

  res.status(201).json({
    message: "Đặt hàng thành công",
    order
  });
});

// Cập nhật đơn hàng
router.put("/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { total } = req.body;

  const order = await prisma.order.update({
    where: {
      oid: id
    },
    data: {
      total
    }
  });

  res.json(order);
});

// Xóa đơn hàng
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  const order = await prisma.order.delete({
    where: {
      oid: id
    }
  });

  res.json(order);
});

export default router;