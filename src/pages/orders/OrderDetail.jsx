import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import logo from "../../assets/logo.jpeg";
import { changeOrderStatus, getOrderDetails } from '../../api/orders';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import { useReactToPrint } from "react-to-print";
import { notifyToaster } from '../../components/notifyToaster';


const OrderDetail = () => {
    const location = useLocation();
    const receivedData = location.state;
    const [status, setStatus] = useState(receivedData.orderStatus);
    const [orderData, setOrderData] = useState(null);

    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: orderData ? `Invoice-${orderData.order_number}` : "Order-Bill"
    });

    const handleOrderStatus = async(event) => {
        setStatus(event.target.value);
        const reqBody = {
            action: event.target.value,
            orderId: receivedData.order_id
        }

        try{
            const resp = await changeOrderStatus(reqBody);
            if(resp && resp.data && resp.data.success){
                notifyToaster("Order status updated!");
            }
        }
        catch(err){
            if(err?.response?.data?.message){
                    notifyToaster(err?.response?.data?.message);
                  }
                  else{
                    notifyToaster("Something went wrong!");
                  }
        }
    }

    useEffect(() => {
        const fetchOrderDetails = async() => {
            const reqBody = { orderId: receivedData.order_id }
            try{
                const resp = await getOrderDetails(reqBody);
                if(resp && resp.data && resp.data.success){
                    setOrderData(resp.data.data);
                }
            }
            catch(err){}
        }

        fetchOrderDetails();
    }, [])

  return (
    <div>
        <div className='p-6 mb-6 flex justify-between item-center'>
            <div className='text-2xl font-semibold'>Order Details</div>
            <div className='flex justify-between items-center'>
                <FormControl style={{width:200}}>
                    <InputLabel id="demo-simple-select-label">Order Status</InputLabel>
                    <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={status}
                    label="Order Status"
                    onChange={handleOrderStatus}
                    >
                        <MenuItem value={"Pending"} disabled>Pending</MenuItem>
                        <MenuItem value={"Confirmed"}>Confirmed</MenuItem>
                        <MenuItem value={"Shipped"}>Shipped</MenuItem>
                        <MenuItem value={"Delivered"}>Delivered</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="contained" style={{marginLeft:20}} onClick={reactToPrintFn}>Print Bill</Button>
            </div>
        </div>


        {orderData && (
            <div ref={contentRef} className="p-6 mx-auto">
                {/* <div className='text-4xl font-bold'>LOGO</div> */}
                <img src={logo} className='h-20' />
            <h2 className="py-3 text-2xl font-semibold mb-4 border-y-2">Order Bill</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                <p><span className="font-semibold">Order ID:</span> {orderData.order_number}</p>
                <p><span className="font-semibold">Date:</span> {new Date(orderData.createdAt).toLocaleString()}</p>
                </div>
                <div>
                <p><span className="font-semibold">Payment Method:</span> {orderData.paymentMethod}</p>
                {/* <p><span className="font-semibold">Payment Status:</span> {orderData.paymentStatus}</p> */}
                <p><span className="font-semibold">Razorpay ID:</span> {orderData.razorpayOrderId}</p>
                </div>
            </div>

            <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
                <p>{orderData.shippingAddress.fullName} ({orderData.shippingAddress.mobile})</p>
                <p>{orderData.shippingAddress.addressLine1}, {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.postalCode}</p>
                <p>{orderData.shippingAddress.country}</p>
            </div>

            <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Products</h3>
                <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-50 overflow-hidden">
                    <thead className="bg-gray-100 text-left text-sm font-semibold">
                    <tr>
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Qty</th>
                        <th className="px-4 py-2 border">Price</th>
                        <th className="px-4 py-2 border">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                        {orderData.orderedItems.map((item, index) => (
                            <tr key={index} className="border-t text-sm">
                                <td className="px-4 py-2 border">{item.product_name}</td>
                                <td className="px-4 py-2 border">{item.quantity}</td>
                                <td className="px-4 py-2 border">₹{item.price_per_unit}</td>
                                <td className="px-4 py-2 border font-semibold">₹{item.total_price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            <div className="mb-6 border-x text-sm">
                <div className="flex justify-end">
                <div className="w-full text-right">
                    {/* <p className='p-2 w-full border-b font-semibold'>Subtotal: ₹{orderData.subtotal}</p> */}
                    <p className='p-2 w-full border-b font-semibold'>Tax: ₹{orderData.tax}</p>
                    <p className='p-2 w-full border-b font-semibold text-base'>Total Amount: ₹{orderData.totalAmount}</p>
                </div>
                </div>
            </div>
            </div>
        )}

    </div>
  )
}

export default OrderDetail