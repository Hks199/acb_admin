import React, { useState, useEffect, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { getAllProducts, createProduct, deleteProduct, updateProduct } from '../../api/product';
import { getAllCategories } from '../../api/category';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Pagination from '@mui/material/Pagination';
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { getAllVendors } from '../../api/vendor';


const Products = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });
  const [vendorPages, setVendorPages] = useState({ totalPages: 1, currentPage: 1 });
  const [form, setForm] = useState({ category_id: "", vendor_id: "", product_name: "", price: "", stock: "", isActive: "true", imageUrls: ["", "", "", "", ""] });
  const [updateProduct, setUpdateProduct] = useState(false);
  const [updatedProductId, setUpdatedProductId] = useState(null);

  const editor = useRef(null);
	const [content, setContent] = useState("");

	const config = useMemo(() => ({
			readonly: false,
			placeholder: 'Write a product description'
		}),
		[]
	);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ category_id: "", vendor_id: "", product_name: "", price: "", stock: "", isActive: "true", imageUrls: ["", "", "", "", ""]});
    setContent("");
    if(updateProduct){
      setUpdateProduct(false);
      setUpdatedProductId(null);
    }
  };

  const handlePagination = (event, value) => {
    setPages((prev) => ({...prev, currentPage: value}));
    fetchproductList(value);
  };

  const handleVendorPagination = (event, value) => {
    setVendorPages((prev) => ({...prev, currentPage: value}));
    fetchAllVendors(value);
  };

  useEffect(() => {
    fetchCategories();
    fetchproductList(1);
    fetchAllVendors(1);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategoryList(response.data);
    } catch (err) {
      // console.error('Error fetching categories:', err);
    }
  };

  const fetchAllVendors = async(pageNum) => {
      const reqBody = { page: pageNum, limit: 15 }

      try{
        const resp = await getAllVendors(reqBody);
        if(resp && resp.data){
          setVendorList(resp.data.data);
          setVendorPages({ currentPage: resp.data.page, totalPages: resp.data.totalPages });
        }
      } catch(err){}
    }

  const fetchproductList = async (pageNum) => {
    const reqBody = {
      page:pageNum,
      limit:10
    }
    try {
      const response = await getAllProducts(reqBody);
      if(response && response.data && response.data.success){
        setProductList(response.data.products);
        // console.log(response.data.products);
        setPages({ totalPages: response.data.totalPages, currentPage: response.data.currentPage });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked.toString() : value,
    }));
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...form.imageUrls];
    updatedImages[index] = value;
    setForm((prev) => ({...prev, imageUrls: updatedImages, description: content}));
  };

  const createProducts = async () => {
    const { category_id, vendor_id, product_name, price, stock } = form;

    if (!category_id || !vendor_id || !product_name.trim() || !content || !price || !stock) {
      alert("Please fill all required fields before submitting.");
      return;
    }

    // console.log(form)

    try {
      const resp = await createProduct({...form, description: content});
      if(resp && resp.data){
        setForm({ category_id: "", vendor_id: "", product_name: "", price: "", stock: "", isActive: "true", imageUrls: ["", "", "", "", ""]});
        setContent("");
        fetchproductList(1);
        handleClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProducts = async (productId) => {
    try {
      const resp = await deleteProduct(productId);
      fetchproductList(pages.currentPage);
      // console.log(resp.data)
    } catch (err) {
      // console.error('Error creating category:', err);
    }
  };

  const initializeFormWithProduct = (data) => {
    const paddedImages = Array(5)
      .fill("")
      .map((_, i) => data.imageUrls[i] || "");

    setForm({
      category_id: data.category_id || "",
      vendor_id: data.vendor_id || "",
      product_name: data.product_name || "",
      price: data.price?.toString() || "",
      stock: data.stock?.toString() || "",
      isActive: data.isActive?.toString() || "true",
      imageUrls: paddedImages,
    });

    setContent(data.content || "");
  };

  const updateProducts = async (obj) => {
    setUpdateProduct(true);
    setUpdatedProductId(obj._id)
    initializeFormWithProduct(obj);
    handleClickOpen();
  };

  const updateSelectedProduct = async () => {
    const { category_id, vendor_id, product_name, description, price, stock } = form;

    if (!category_id || !vendor_id || !product_name.trim() || !description.trim() || !price || !stock) {
      alert("Please fill all required fields before submitting.");
      return;
    }

    try {
      const resp = await updateProduct(updatedProductId, form);
      fetchproductList(pages.currentPage);
       handleClose();
    } catch (err) {
      // console.error('Error creating category:', err);
    }
  }


  return (
    <div className='w-full min-h-full'>
      <div className='flex justify-between items-center'>
        <div style={{fontSize:22}}>Products</div>
        <Button variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={handleClickOpen}>Add New Product</Button>
      </div>

      <div className='my-5 w-full bg-white rounded-lg shadow'>
        <div className='p-4 w-full grid grid-cols-7'>
          <div className='col-span-1 text-lg font-semibold'>No.</div>
          <div className='col-span-3 text-lg font-semibold'>Product Name</div>
          <div className='col-span-1 text-lg font-semibold'>Price</div>
          <div className='col-span-1 text-lg font-semibold'>Stock</div>
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>

        {productList.map((obj, idx) => (
          <div className='p-4 pb-2 w-full grid grid-cols-7 border-t border-gray-200'>
            <div className='col-span-1'>{idx + 1}</div>
            <div className='col-span-3'>{obj.product_name}</div>
            <div className='col-span-1'>{obj.price}</div>
            <div className='col-span-1'>{obj.stock}</div>
            <div className='col-span-1 flex'>
              <IconButton size="small" style={{marginRight:10}} onClick={() => updateProducts(obj)}>
                <FaEdit size={23}/>
              </IconButton>
              <IconButton size="small" onClick={() => deleteProducts(obj._id)}>
                <MdDelete size={25}/>
              </IconButton>
            </div>
          </div>
        ))}

        <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
          <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
        </div>
      </div>


    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          {"Create New Product"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-5">

            <div className='w-full flex items-center'>  
              <FormControl fullWidth style={{marginRight:10}}>
                <InputLabel id="category-label">Select Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category_id"
                  value={form.category_id}
                  label="Select Category"
                  onChange={handleChange}
                >
                  {categoryList.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="vendor-label">Select Vendor</InputLabel>
                <Select
                  labelId="vendor-label"
                  name="vendor_id"
                  value={form.vendor_id}
                  label="Select Vendor"
                  onChange={handleChange}
                >
                  {vendorList.map((ven) => (
                    <MenuItem key={ven._id} value={ven._id}>
                      {ven.vendor_name}
                    </MenuItem>
                  ))}

                  <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
                    <Pagination count={vendorPages.totalPages} variant="outlined" shape="rounded" onChange={handleVendorPagination} />
                  </div>
                </Select>
              </FormControl>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Description</label>

              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1} // tabIndex of textarea
                onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                onChange={newContent => setContent(newContent)}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                  required
                />
              </div>
            </div>

            <label className="mb-2 block font-medium text-gray-700">Image URLs</label>
            <div className='grid grid-cols-2 gap-4'>
              {form.imageUrls.map((img, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Image ${index + 1} URL`}
                  value={img}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="w-full mb-2 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                  required
                />
              ))}
            </div>

            {updateProduct ? (
              <button onClick={updateSelectedProduct}
                type="submit" className="w-full bg-blue-600 text-white font-semibold text-lg py-3 px-4 rounded-lg hover:bg-blue-700 transition"
              >Update Product</button>
            ) : (
              <button onClick={createProducts}
                type="submit" className="w-full bg-blue-600 text-white font-semibold text-lg py-3 px-4 rounded-lg hover:bg-blue-700 transition"
              >Submit Product</button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Products