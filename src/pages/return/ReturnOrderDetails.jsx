import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { getReturnedItemDetailApi, updateReturnStatusApi } from '../../api/orders';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { notifyToaster } from '../../components/notifyToaster';

const ReturnOrderDetails = () => {
  const location = useLocation();
  const receivedData = location.state;
  const [itemDetail, setItemDetail] = useState(null);
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    setStatus(event.target.value);
    updateReturnStatus(event.target.value);
  };

  const updateReturnStatus = async(statusVal) => {
    const reqBody = {
      id: receivedData._id,
      refundStatus: statusVal
    }

    try{
      const resp = await updateReturnStatusApi(reqBody);
      if(resp && resp.data){
        notifyToaster("Status Updated");
      }
    }
    catch(err){}
  }

    const getReturnedItemDetail = async() => {
        try{
            const resp = await getReturnedItemDetailApi(receivedData._id);
            if(resp && resp.data){
                setItemDetail(resp.data.data);
                setStatus(resp.data.data.refundStatus)
            }
        }
        catch(err){}
    }

    useEffect(() => {
        getReturnedItemDetail();
    }, [])

    if(!itemDetail) return null;

    return (
        <div className="mx-auto p-4">
        {/* <div>ReturnOrderDetails {JSON.stringify(receivedData)}</div> */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Return Details</h2>

      <div className="flex flex-col sm:flex-row gap-6">
        <img
          src={itemDetail.product?.imageUrls?.[0]}
          alt="Product"
          className="w-full sm:w-48 h-48 object-cover rounded-xl shadow"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-700">{itemDetail.product?.product_name}</h3>

          <div className="mt-4 space-y-2 text-gray-600 text-sm">
            <p><span className="font-medium">Quantity:</span> {itemDetail.quantity}</p>
            <p><span className="font-medium">Price per unit:</span> ₹{itemDetail.price_per_unit}</p>
            <p><span className="font-medium">Total price:</span> ₹{itemDetail.total_price}</p>
            <p><span className="font-medium">Returned at:</span> {new Date(itemDetail.returnedAt).toLocaleString()}</p>
            <p><span className="font-medium">Refund status:</span> 
              <span className={`ml-1 font-semibold ${itemDetail.refundStatus === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                {itemDetail.refundStatus}
              </span>
            </p>
            <p><span className="font-medium">Reason for return:</span> {itemDetail.returnReason}</p>
            {/* <p><span className="font-medium">Inspected:</span> {itemDetail.isInspected ? 'Yes' : 'No'}</p> */}
          </div>

        <div className="my-2 font-medium">Update Return Status:</div>

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
                <MenuItem value={"Accepted"}>Accept</MenuItem>
                <MenuItem value={"Rejected"}>Reject</MenuItem>
                <MenuItem value={"Paid"}>Amount Refunded</MenuItem>
            </Select>
        </FormControl>

        {itemDetail?.returnImages?.length > 0 && (
          <>
            <div className="my-2 font-medium">Customer Images:</div>
            <div className='flex'>
              {itemDetail.returnImages.map((imgUrl) => (
                <img src={imgUrl} className='mr-5 w-30 h-30 rounded' />
              ))}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
    )
}

export default ReturnOrderDetails
