import { useState, useEffect } from 'react';
import { FaRegEye } from "react-icons/fa";
import IconButton from '@mui/material/IconButton';
import { getAllOrders } from '../../api/orders';
import Pagination from '@mui/material/Pagination';
import { useNavigate } from 'react-router';


const CustomerOrder = () => {
    const navigation = useNavigate();
    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });


    const fetchAllOrders = async (pageNum) => {
        const reqBody = { limit: 20, page: pageNum };

        try {
            const response = await getAllOrders(reqBody);
            if(response && response.data && response.data.success){
                setPages({totalPages: response.data.totalPages, currentPage: response.data.currentPage});
                setOrderList(response.data.data);
            }
        }
        catch (err) {}
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders(1);
    }, []);

    const handlePagination = (event, value) => {
        setPages((prev) => ({...prev, currentPage: value}));
        fetchAllOrders(value);
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
          <div className='col-span-1 text-lg font-semibold'>Order Date</div>
          <div className='col-span-1 text-lg font-semibold'>Customer Name</div>
          <div className='col-span-1 text-lg font-semibold'>Order Status</div>
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>


        {orderList.map((obj, idx) => (
          <div className='p-4 pb-2 w-full grid grid-cols-7 border-t border-gray-200'>
            <div className='col-span-3 flex'>
                <div className='w-20'>{idx + 1}</div>
                <div>{obj.order_number}</div>
            </div>
            <div className='col-span-1'>{formattedDate(obj.createdAt)}</div>
            <div className='col-span-1'>{obj.name}</div>
            <div className='col-span-1'>{obj.orderStatus}</div>
            <div className='col-span-1'>
              <IconButton size="small" onClick={() => navigation("/order-detail", { state: obj })}>
                <FaRegEye size={23}/>
              </IconButton>
            </div>
          </div>
        ))}

        {/* {orderList.map((obj, idx) => {
          if (idx > 0 && obj.order_number !== orderList[idx - 1].order_number) {
            return (
              <div className='p-4 pb-2 w-full grid grid-cols-7 border-t border-gray-200'>
                    <div className='col-span-3 flex'>
                        <div className='w-20'>{idx + 1}</div>
                        <div>{obj.order_number}</div>
                    </div>
                    <div className='col-span-1'>{formattedDate(obj.createdAt)}</div>
                    <div className='col-span-1'>{obj.name}</div>
                    <div className='col-span-1'>{obj.orderStatus}</div>
                    <div className='col-span-1'>
                      <IconButton size="small" onClick={() => navigation("/order-detail", { state: obj })}>
                        <FaRegEye size={23}/>
                      </IconButton>
                    </div>
                  </div>
            );
          }
          return null
        })} */}

      </div>

      <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
                <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
              </div>
    </div>
  )
}

export default CustomerOrder