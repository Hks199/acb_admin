import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { cancelledItemDetailsApi, updateCancelStatusApi } from '../../api/orders';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { notifyToaster } from '../../components/notifyToaster';


const CancelOrderDetails = () => {
  const location = useLocation();
  const receivedData = location.state;
  const [itemDetail, setItemDetail] = useState(null);
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    setStatus(event.target.value);
    updateCancelStatus(event.target.value);
  };

  const updateCancelStatus = async(statusVal) => {
    const reqBody = {
      id: receivedData._id,
      refundStatus: statusVal
    }

    try{
      const resp = await updateCancelStatusApi(reqBody);
      if(resp && resp.data){
        notifyToaster("Status Updated");
      }
    }
    catch(err){}
  }

  const getCancelledItemDetail = async() => {
    const reqBody = {
      cancelId: receivedData._id,
      productId: receivedData.product_id
    }

    try{
      const resp = await cancelledItemDetailsApi(reqBody);
      if(resp && resp.data){
          setItemDetail(resp.data.data);
          setStatus(resp.data.data.refundStatus)
      }
    }
    catch(err){}
  }

  useEffect(() => {
    getCancelledItemDetail();
  }, [])

  if(!itemDetail) return null;

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Cancelled Item Details</h2>

      <div className="flex flex-col sm:flex-row gap-6">
        <img
          src={itemDetail.product_image}
          alt="Product"
          className="w-full sm:w-48 h-48 object-cover rounded-xl shadow"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-700">{itemDetail.product_name}</h3>

          <div className="mt-4 space-y-2 text-gray-600 text-sm">
            <p><span className="font-medium">Quantity:</span> {itemDetail.quantity}</p>
            <p><span className="font-medium">Price per unit:</span> ₹{itemDetail.price_per_unit}</p>
            <p><span className="font-medium">Total price:</span> ₹{itemDetail.total_price}</p>
            <p><span className="font-medium">Refund amount:</span> ₹{itemDetail.totalRefundAmount}</p>
            <p><span className="font-medium">Cancelled at:</span> {new Date(itemDetail.cancelledAt).toLocaleString()}</p>
            <p><span className="font-medium">Refund status:</span> 
              <span className={`ml-1 font-semibold ${itemDetail.refundStatus === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                {itemDetail.refundStatus}
              </span>
            </p>
            <p><span className="font-medium">Reason for return:</span> {itemDetail.cancellationReason}</p>
          </div>

        <div className="my-2 font-medium">Update Cancel Status:</div>

        <FormControl style={{minWidth:200}}>
            <InputLabel id="demo-simple-select-label">Status</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={status}
                label="Status"
                onChange={handleChange}
            >
                <MenuItem value={"Pending"} disabled>Pending</MenuItem>
                <MenuItem value={"Paid"}>Amount Refunded</MenuItem>
            </Select>
        </FormControl>
        </div>
      </div>
    </div>
  )
}

export default CancelOrderDetails

/*
{
  "cancellationReason": "cancel order",
  "cancelledAt": "2025-07-28T19:36:51.359Z",
  "totalRefundAmount": 399,
}
*/