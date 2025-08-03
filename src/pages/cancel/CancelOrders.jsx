import { useState, useEffect } from 'react';
import { FaRegEye } from "react-icons/fa";
import IconButton from '@mui/material/IconButton';
import { getAllCancelledItemsApi } from '../../api/orders';
import Pagination from '@mui/material/Pagination';
import { useNavigate } from 'react-router';


const CancelOrders = () => {
  const navigation = useNavigate();
  const [cancelOrderList, setCancelOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });


  const getAllCancelledItems = async (pageNum) => {
    const reqBody = { page: pageNum, limit: 20 };

    try {
        const response = await getAllCancelledItemsApi(reqBody);
        if(response && response.data && response.data.success){
            setPages({totalPages: response.data.totalPages, currentPage: response.data.currentPage});
            setCancelOrderList(response.data.data);
        }
    }
    catch (err) {}
    finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    getAllCancelledItems(1);
  }, []);

  const handlePagination = (event, value) => {
    setPages((prev) => ({...prev, currentPage: value}));
    getAllCancelledItems(value);
  };

  const formattedDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    return formattedDate
  }


  return (
    <div className='w-full h-full'>
      <div style={{fontSize:22}}>All Orders</div>

      <div className='my-5 w-full bg-white rounded-lg shadow'>
        <div className='p-4 w-full grid grid-cols-7'>
          <div className='col-span-3 text-lg font-semibold flex'>
            <div className='w-20'>No.</div>
            <div>#Order ID</div>
          </div>
          <div className='col-span-1 text-lg font-semibold'>Return Date</div>
          <div className='col-span-1 text-lg font-semibold'>Total Refund Amount</div>
          <div className='col-span-1 text-lg font-semibold'>Status</div>
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>

        {cancelOrderList.map((obj, idx) => (
          <div className='p-4 pb-2 w-full grid grid-cols-7 border-t border-gray-200'>
            <div className='col-span-3 flex'>
                <div className='w-20'>{idx + 1}</div>
                <div>{obj.orderId}</div>
            </div>
            <div className='col-span-1'>{formattedDate(obj.cancelledAt)}</div>
            <div className='col-span-1'>₹{obj.totalRefundAmount}</div>
            <div className='col-span-1'>{obj.refundStatus}</div>
            <div className='col-span-1'>
              <IconButton size="small" onClick={() => navigation("/cancel-order-details", { state: obj })}>
                <FaRegEye size={23}/>
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
        <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
      </div>
    </div>
  )
}

export default CancelOrders
