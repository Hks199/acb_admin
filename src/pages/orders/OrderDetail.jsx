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
    const [showBill, setShowBill] = useState(false);

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
            <div className="bg-gray-100 p-10">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-8">

        {/* Order & Payment Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p>
              <span className="font-semibold text-gray-800">Order ID:</span>{" "}
              {orderData.order_number}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Date:</span> {new Date(orderData.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <p>
              <span className="font-semibold text-gray-800">Payment Method:</span> {orderData.paymentMethod}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Razorpay ID:</span> {orderData.razorpayOrderId}
            </p>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-gray-50 border rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Shipping Information</h2>
          <p className="leading-relaxed">
            {orderData.shippingAddress.fullName} ({orderData.shippingAddress.mobile}) <br />
            {orderData.shippingAddress.addressLine1}, {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.postalCode} <br />
            {orderData.shippingAddress.country}
          </p>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Products</h2>
          <div className="space-y-4">

            {/* Products */}
            {orderData.orderedItems.map((item, index) => (
                <div className="flex items-center gap-4 border border-gray-400 rounded-lg p-4">
                {/* <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Image</span>
                </div> */}
                <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.product_name}</p>
                    <div>Quantity: {item.quantity}</div>
                    {item.variant_combination && (
                        <div className="gap-3">
                            <div>Size: {item.variant_combination.Size}</div>
                            <div className="flex items-center gap-1">
                                <span>Color:</span>
                                <span className="ml-1 w-6 h-6 rounded border" style={{ backgroundColor: item.variant_combination.Color }}></span>
                            </div>
                        </div>
                    )}
                </div>
                <p className="font-semibold text-lg">₹{item.price_per_unit}</p>
                </div>
            ))}

          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-between items-center border-t pt-4">
          <p className="font-semibold text-lg text-gray-700">Tax: ₹{orderData.tax}</p>
          <p className="text-xl font-bold">Total Amount: ₹{orderData.totalAmount}</p>
        </div>
      </div>
      </div>
        )}


        <div className='pt-4 w-full text-3xl font-bold border-y-3'>Order Bill</div>


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
                                <td className="px-4 py-2 border">
                                    <div>{item.product_name}</div>
                                    {item.variant_combination && (
                                        <>
                                            <div>Size: {item.variant_combination.Size}</div>
                                            {/* <div>Color: {item.variant_combination.Color}</div> */}
                                        </>
                                    )}
                                </td>
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