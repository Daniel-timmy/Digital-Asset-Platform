export const add_to_cart = (asset) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[asset.id] = asset;
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const in_cart = (asset) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  return cart.hasOwnProperty(asset.id);
};

export const remove_from_cart = (asset) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  delete cart[asset.id];
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const clear_cart = () => {
  localStorage.removeItem("cart");
};

export const get_cart = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  return cart;
};
