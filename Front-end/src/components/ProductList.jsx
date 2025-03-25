// ProductList.js
import React from 'react';

const ProductList = ({ selectedProducts, handleUpdateQuantity, handleRemoveProduct }) => {
  return (
    <div className="mt-4">
      {selectedProducts.length > 0 ? (
        selectedProducts.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
            <div>
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-gray-500">₹{Number(p.price || 0).toFixed(2)}</p>
            </div>
            <div className="flex items-center">
              <button onClick={() => handleUpdateQuantity(p.id, p.quantity - 1)} className="bg-gray-300 px-2 py-1 rounded text-sm" disabled={p.quantity <= 1}>-</button>
              <span className="px-3">{p.quantity}</span>
              <button onClick={() => handleUpdateQuantity(p.id, p.quantity + 1)} className="bg-gray-300 px-2 py-1 rounded text-sm">+</button>
            </div>
            <button onClick={() => handleRemoveProduct(p.id)} className="ml-2 text-red-500 text-sm">❌ Remove</button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Add a product to calculate total</p>
      )}
    </div>
  );
};

export default ProductList;