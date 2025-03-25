// PaymentSummary.js
import React from 'react';

const PaymentSummary = ({ subtotal, discount, shipping, tax, total, selectedProducts }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Payment</h3>
      <div className="flex justify-between text-sm">
        <span>Subtotal ({selectedProducts.length} items)</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Discount</span>
        <span className="text-red-500">- ₹{(discount ?? 0).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span>₹{shipping.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Estimated tax (9%)</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold text-lg mt-2">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;