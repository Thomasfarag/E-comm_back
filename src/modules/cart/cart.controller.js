import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from '../../utils/handlers/refactor.handler.js';
import ApiFeatures from '../../utils/APIFeatures.js';
import { cartModel } from '../../../databases/models/cart.model.js';
import { productModel } from '../../../databases/models/product.model.js';
import { couponModel } from '../../../databases/models/coupon.model.js';

function calcPrice(cart) {
  let totalPrice = 0;
  cart.cartItems.forEach((ele) => {
    totalPrice += ele.quantity * ele.price;
  });
  cart.totalPrice = totalPrice;

  if (cart.discount) {
    cart.totalPriceAfterDiscount = cart.totalPrice - (cart.totalPrice * cart.discount) / 100;
  } else {
    cart.totalPriceAfterDiscount = cart.totalPrice;
  }
}

const createCart = catchAsyncError(async (req, res, next) => {
  let product = await productModel.findById(req.body.product).select("price");
  if (!product) return next(new AppError("product not found", 404));

  req.body.price = product.price;
  let isCartExist = await cartModel.findOne({ user: req.user._id });
  if (!isCartExist) {
    let cart = new cartModel({
      user: req.user._id,
      cartItems: [req.body]
    });

    calcPrice(cart);
    await cart.save();
    return res.status(201).json({ message: "created", cart });
  }

  let item = isCartExist.cartItems.find((ele) => ele.product.toString() === req.body.product);
  if (item) {
    item.quantity += 1;
  } else {
    isCartExist.cartItems.push(req.body);
  }

  calcPrice(isCartExist);
  await isCartExist.save();
  res.json({ message: "Product Added To Cart", isCartExist });
});

const getCart = catchAsyncError(async (req, res, next) => {
  try {
    let cart = await cartModel.findOne({ user: req.user._id }).populate('cartItems.product');
    if (!cart) return next(new AppError("Cart not found", 404));
    res.json({ message: "Done", cart });
  } catch (error) {
    next(error);
  }
});

const getCartById = catchAsyncError(async (req, res, next) => {
  try {
    // Extract cartId from request parameters
    const { cartId } = req.params;

    // Find cart by cartId
    let cart = await cartModel.findById(cartId).populate('cartItems.product');

    // Check if cart exists
    if (!cart) return next(new AppError("Cart not found", 404));

    // Calculate price if necessary
    calcPrice(cart);

    // Respond with cart details
    res.json({ message: "Done", cart });
  } catch (error) {
    next(error);
  }
});


const removeCartItem = catchAsyncError(async (req, res, next) => {
  try {
    let cart = await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { cartItems: { _id: req.params.id } } },
      { new: true }
    ).populate('cartItems.product');

    if (!cart) return next(new AppError("Cart not found", 404));

    // Recalculate numOfCartItems
    cart.numOfCartItems = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);

    calcPrice(cart);
    await cart.save();

    res.json({ message: "Deleted", cart });
  } catch (error) {
    next(error);
  }
});


const clearCart = catchAsyncError(async (req, res, next) => {
  try {
    let cart = await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { $set: { cartItems: [] } },
      { new: true }
    );

    if (!cart) return next(new AppError("Cart not found", 404));

    // Reset numOfCartItems to 0
    cart.numOfCartItems = 0;

    calcPrice(cart);
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (error) {
    next(error);
  }
});


const updateCart = catchAsyncError(async (req, res, next) => {
  console.log('Received request to update cart:', req.body);

  // Find the product and select all fields
  let product = await productModel.findById(req.body.product);
  if (!product) {
    console.error('Product not found:', req.body.product);
    return next(new AppError("Product not found", 404));
  }

  // Update req.body with product details
  req.body.price = product.price;  // Assuming you need price for calculations

  // Find the user's cart and populate cartItems with product details
  let isCartExist = await cartModel.findOne({ user: req.user._id }).populate('cartItems.product');
  
  if (!isCartExist) {
    return next(new AppError("Cart not found", 404));
  }

  console.log('Cart items:', isCartExist.cartItems);

  // Convert req.body.product to a string
  let requestedProductId = req.body.product.toString();
  console.log('Requested product ID:', requestedProductId);

  // Find the cart item corresponding to the product
  let item = isCartExist.cartItems.find((ele) => {
    console.log('Comparing:', ele.product._id.toString(), 'with', requestedProductId);
    return ele.product._id.toString() === requestedProductId;
  });

  if (!item) {
    console.error('Item not found in cart:', req.body.product);
    return next(new AppError("Item not found in cart", 404));
  }

  // Update quantity of the item
  item.quantity = req.body.quantity;

  // Calculate prices or any other logic
  calcPrice(isCartExist);

  // Recalculate numOfCartItems
  isCartExist.numOfCartItems = isCartExist.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Save the cart
  await isCartExist.save();

  // Populate cartItems.product with all details from productModel
  isCartExist = await cartModel.findOne({ user: req.user._id }).populate('cartItems.product');

  // Send response with updated cart and product details
  res.json({ message: "Updated", cart: isCartExist });
});


// const applyCoupon = catchAsyncError(async (req, res, next) => {
//   let code = await couponModel.findOne({ code: req.params.code });
//   if (!code) return next(new AppError("Coupon not found", 404));

//   let cart = await cartModel.findOne({ user: req.user._id });
//   if (!cart) return next(new AppError("Cart not found", 404));

//   cart.totalPriceAfterDiscount = cart.totalPrice - (cart.totalPrice * code.discount) / 100;
//   cart.discount = code.discount;
//   await cart.save();
//   res.json({ message: "Done", cart });
// });

const addToCart = catchAsyncError(async (req, res, next) => {
  let product = await productModel.findById(req.body.product).select("price");
  if (!product) return next(new AppError("product not found", 404));

  req.body.price = product.price;
  let isCartExist = await cartModel.findOne({ user: req.user._id });
  if (!isCartExist) {
    let cart = new cartModel({
      user: req.user._id,
      cartItems: [req.body],
      totalPrice: req.body.price,
      numOfCartItems: 1 // Initialize numOfCartItems to 1
    });

    await cart.save();
    return res.status(201).json({ message: "Product Added To Cart", cart });
  }

  let item = isCartExist.cartItems.find((ele) => ele.product.toString() === req.body.product);
  if (item) {
    item.quantity += 1;
  } else {
    isCartExist.cartItems.push(req.body);
  }

  isCartExist.numOfCartItems = isCartExist.cartItems.reduce((sum, item) => sum + item.quantity, 0); // Update numOfCartItems

  calcPrice(isCartExist);
  await isCartExist.save();
  res.json({ message: "Product Added To Cart", cart: isCartExist });
});

export { createCart, getCart, removeCartItem,getCartById, updateCart, clearCart, addToCart };
