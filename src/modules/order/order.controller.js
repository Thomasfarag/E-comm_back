import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from '../../utils/handlers/refactor.handler.js';
import ApiFeatures from '../../utils/APIFeatures.js';
import { orderModel } from '../../../databases/models/order.model.js';
import { cartModel } from '../../../databases/models/cart.model.js';
import { productModel } from '../../../databases/models/product.model.js';
import Stripe from "stripe";


const createCacheOrder = catchAsyncError(async (req, res, next) => {
  let cart = await cartModel.findById(req.params.id)
    .populate({
      path: 'cartItems.product',
      select: 'title imgCover price category brand'
    });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  let totalOrderPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalPrice;

  // Save detailed cart items with product information
  let orderItems = cart.cartItems.map(item => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.price,
    productDetails: {
      title: item.product.title,
      imgCover: item.product.imgCover,
      price: item.product.price,
      category: item.product.category,
      brand: item.product.brand
    }
  }));

  let order = new orderModel({
    user: req.user._id,
    cartItems: orderItems,
    totalOrderPrice,
    totalOrderAfterDiscount: totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  if (order) {
    let options = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));

    await productModel.bulkWrite(options);
    await order.save();
  } else {
    return next(new AppError("Error occurred while creating order", 409));
  }

  cart.cartItems = [];
  cart.totalPrice = 0;
  cart.totalPriceAfterDiscount = 0;
  cart.numOfCartItems = 0;
  await cart.save();

  res.json({
    message: "Order created successfully",
    order,
    shippingAddress: req.body.shippingAddress,
  });
});




const getOrder = catchAsyncError(async (req, res, next) => {
  let order = await orderModel.findOne({ user: req.user._id }).populate("cartItems.product");
  if (!order) return next(new AppError("Order not found", 404));

  res.json({ message: "Order retrieved successfully", order });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  try {
    const orders = await orderModel.find()
      .populate('user', 'name email phone profilePic')
      .populate({
        path: 'cartItems.product',
        select: 'title imgCover price category brand'
      });

    if (!orders.length) {
      return res.json({ message: "No orders found", orders: [] });
    }

    res.json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    next(new AppError("Error retrieving orders", 500));
  }
});



// const onlinePayment = catchAsyncError(async (req, res, next) => {
//   let cart = await cartModel.findById(req.params.id);
//   if (!cart) return next(new AppError("Cart not found", 404));

//   // 2- totalPrice
//   let totalOrderPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalPrice;

//   let session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: "egp",
//           unit_amount: totalOrderPrice * 100,
//           product_data: {
//             name: req.user.name,
//           },
//         },
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     success_url: "https://route-comm.netlify.app/#/",
//     cancel_url: "https://route-comm.netlify.app/#/cart",
//     customer_email: req.user.email,
//     client_reference_id: req.params.id,
//     metadata: req.body.shippingAddress,
//   });

//   res.json({ message: "Payment session created successfully", session });
// });
const deleteOrder = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await orderModel.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }
  
  await orderModel.findByIdAndDelete(orderId);
  
  res.json({ message: "Order deleted successfully" });
});

export { createCacheOrder, getOrder, getAllOrders , deleteOrder };
