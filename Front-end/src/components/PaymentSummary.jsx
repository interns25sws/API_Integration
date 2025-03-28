import React from "react";

const PaymentSummary = ({ subtotal, discount, bulkDiscount, shipping, tax, total, selectedProducts }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Payment Summary</h3>
      
      <div className="flex justify-between text-sm">
        <span>Subtotal ({selectedProducts.length} items)</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm text-red-500">
          <span>Tag Discount</span>
          <span>- ₹{discount.toFixed(2)}</span>
        </div>
      )}

      {bulkDiscount > 0 && (
        <div className="flex justify-between text-sm text-blue-600">
          <span>Bulk Discount</span>
          <span>- {bulkDiscount}%</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span>₹{shipping.toFixed(2)}</span>
      </div>

      {/* <div className="flex justify-between text-sm">
        <span>Estimated Tax (9%)</span>
        <span>₹{tax.toFixed(2)}</span>
      </div> */}

      <hr className="my-2" />

      <div className="flex justify-between font-semibold text-lg text-green-600">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
