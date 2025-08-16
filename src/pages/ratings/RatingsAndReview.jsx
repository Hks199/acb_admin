import { useState, useEffect } from 'react';
import { MdDelete } from "react-icons/md";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Rating from '@mui/material/Rating';
import { getAllProducts } from '../../api/product';
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { getReviewsByProductId, deleteReview } from '../../api/ratings';
import Pagination from '@mui/material/Pagination';


const RatingsAndReview = () => {
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({rating: "", review: "", customerId: ""});
  const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });
  const [pages2, setPages2] = useState({ totalPages: 1, currentPage: 1 });
  const [open, setOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const [productId, setProductId] = useState("");
  const [reviews, setReviews] = useState([]);

  const handleClickOpen = (obj) => {
    setRatings({rating: obj.rating, review: obj.review, customerId: obj.customerId._id});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRatings({rating: "", review: "", customerId: ""});
  };

  const handleChange = (e) => {
    setProductId(e.target.value);
    fetchReviewsByProductId(e.target.value, pages.currentPage);
  }

  useEffect(() => {
    fetchproductList(1);
  }, []);

  const fetchproductList = async (pageNum) => {
    const reqBody = { page:  pageNum, limit: 15 }

    try {
      const response = await getAllProducts(reqBody);
      if(response && response.data && response.data.success){
        setProductList(response.data.products);
        setPages2({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handlePagination = (event, value) => {
    setPages((prev) => ({...prev, currentPage: value}));
    fetchReviewsByProductId(productId, value);
  };

  const handlePagination2 = (event, value) => {
    setPages2((prev) => ({...prev, currentPage: value}));
    fetchproductList(value);
  };


  const deleteCustomerReview = async (productId, customerId) => {
    try {
      const resp = await deleteReview(productId, customerId);
      if(resp && resp.data){
        fetchReviewsByProductId(productId, pages.currentPage);
        handleClose();
      }
    } catch (err) {
      // console.error('Error creating category:', err);
    }
  };

  const fetchReviewsByProductId = async (productId, pageNum) => {
    const reqBody = { page: pageNum, limit: 20 };

    try {
      const resp = await getReviewsByProductId(productId, reqBody);
      if(resp && resp.data && resp.data.success){
        setReviews(resp.data.reviews);
      }
    } catch (err) {
      // console.error('Error getting Reviews By ProductId:', err);
    }
  };


  return (
    <div className='w-full min-h-screen'>
      <div style={{fontSize:22}}>Ratings & Reviews</div>

      <div className='mt-6'>
        <FormControl style={{width:"50%"}}>
                <InputLabel id="product-label">Select Product</InputLabel>
                <Select
                  labelId="product-label"
                  name="productId"
                  value={productId}
                  label="Select Product"
                  onChange={(e) => handleChange(e)}
                >
                  {productList.map((obj) => (
                    <MenuItem key={obj._id} value={obj._id}>
                      {obj.product_name}
                    </MenuItem>
                  ))}

                  <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
                    <Pagination count={pages2.totalPages} variant="outlined" shape="rounded" onChange={handlePagination2} />
                  </div>
                </Select>
              </FormControl>
      </div>

      <div className='my-5 w-full bg-white rounded-lg shadow'>
        <div className='p-4 w-full grid grid-cols-5'>
          <div className='col-span-1 text-lg font-semibold'>No.</div>
          <div className='col-span-2 text-lg font-semibold'>Customer Name</div>
          <div className='col-span-1 text-lg font-semibold'>Ratings</div>
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>

        {reviews.map((obj, idx) => (
          <div className='p-4 pb-2 w-full grid grid-cols-5 border-t border-gray-200'>
            <div className='col-span-1'>{idx + 1}</div>
            <div className='col-span-2'>{obj.customerId.first_name}</div>
            <div className='col-span-1'>{obj.rating} star</div>
            <div className='col-span-1 flex'>
              <IconButton size="small" style={{marginRight:10}} onClick={() => handleClickOpen(obj)}>
                <MdOutlineRemoveRedEye size={23}/>
              </IconButton>
            </div>
          </div>
        ))}

        <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
          <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
        </div>
      </div>


    <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{"Product Review"}</DialogTitle>
        <DialogContent>
          <div className='w-[450px]'>
            <div className='mb-1 text-[#FF5E5E]'>Product Rating</div>
            <Rating name="simple-controlled" value={ratings.rating} readOnly />
            <div className='mt-3 mb-1 text-[#FF5E5E]'>Review</div>
            <textarea className='p-3 w-full h-[150px] border-2 border-[#e3e3e3] rounded-lg outline-none' value={ratings.review} readOnly />
          </div>
          <DialogActions>
              <Button variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={() => deleteCustomerReview(productId, ratings.customerId)}>Delete this review</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RatingsAndReview