import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    cartItems: [
      {
        product: {
              type: mongoose.Types.ObjectId,
            ref:"product"
            },
            quantity: {
                type: Number,
                default:1
            },
            price:Number
      },
        ],
        totalPrice: Number,

      numOfCartItems: {
        type: Number,
        default: function() {
          return this.cartItems.length;
        }
      },
  
        // discount: Number,
    totalPriceAfterDiscount:Number
  },
  { timestamps: true }
);


export const cartModel = mongoose.model("cart", cartSchema);



