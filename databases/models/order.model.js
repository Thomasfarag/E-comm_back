import mongoose from "mongoose";
const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    cartItems: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        productDetails: {
          title: String,
          imgCover: String,
          price: Number,
          category: String,
          brand: String
        }
      },
    ],
    totalOrderPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalOrderAfterDiscount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      city: {
        type: String,
        required: true,
      },
      addres: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const orderModel = mongoose.model("order", orderSchema);
