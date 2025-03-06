import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerDetails = () => {
    const { id } = useParams(); // Get customer ID from URL
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
                setCustomer(response.data);
            } catch (error) {
                console.error("Error fetching customer:", error);
            }
        };
        fetchCustomer();
    }, [id]);

    if (!customer) return <h2>Loading...</h2>;

    return (
        <div className="p-6 w-[95%] mx-auto mt-4 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold">
                {customer.firstName} {customer.lastName}
            </h2>
            <p className="text-gray-600">{customer.email}</p>
    
            {/* ✅ Display Address */}
            <h3 className="font-semibold mt-4">Address:</h3>
            <p>
                {customer.defaultAddress 
                    ? `${customer.defaultAddress.address1}, ${customer.defaultAddress.city}, ${customer.defaultAddress.province}, ${customer.defaultAddress.country} - ${customer.defaultAddress.zip}`
                    : "No Address Provided"}
            </p>
    
            {/* ✅ Display Tags */}
            <h3 className="font-semibold mt-4">Tags:</h3>
            <p>{customer.tags.length ? customer.tags.join(", ") : "No Tags"}</p>
    
            {/* ✅ Display Orders */}
            <h3 className="font-semibold mt-4">Recent Orders:</h3>
            {customer.orders?.edges.length ? (
                <ul className="mt-2">
                    {customer.orders.edges.map(({ node }) => (
                        <li key={node.id} className="p-2 border-b">
                            <strong>{node.name}</strong> - {node.totalPriceSet.presentmentMoney.amount} {node.totalPriceSet.presentmentMoney.currencyCode}
                            <br />
                            <span className="text-gray-500">Placed on: {new Date(node.createdAt).toLocaleDateString()}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No Orders</p>
            )}
    
            <div className="mt-4">
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={() => navigate(`/orders/create?customerId=${id}`)}
                >
                    Create Order
                </button>
            </div>
        </div>
    );
    
};

export default CustomerDetails;
