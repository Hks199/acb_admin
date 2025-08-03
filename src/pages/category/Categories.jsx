import { useState, useEffect } from 'react';
import { createCategory, getAllCategories, deleteCategory, updateCategory } from '../../api/category';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [editCategory, setEditCategory] = useState({id: "", data: "", url: ""});
  const [open, setOpen] = useState(false);

  const handleClickOpen = (obj) => {
    setEditCategory({ id:obj._id, data: obj.category, url: obj.imageUrls })
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCategory({id: "", data: ""});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data);
    } catch (err) {
      // console.error('Error fetching categories:', err);
    }
  };

  const createCategories = async () => {
    if(!newCategory) return;
    const reqBody = {
      category: newCategory,
      imageUrls: imgUrl
    }

    setLoading(true);
    try {
      await createCategory(reqBody);
      setNewCategory("");
      setImgUrl("");
      fetchCategories();
    } catch (err) {
      // console.error('Error creating category:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategories = async (categoryId) => {
    try {
      const resp = await deleteCategory(categoryId);
      fetchCategories();
    } catch (err) {
      // console.error('Error creating category:', err);
    }
  };

  const updateCategories = async () => {
    if(!editCategory.data || !editCategory.url) return;
    const reqBody = {
      category: editCategory.data,
      imageUrls: editCategory.url
    }

    try {
      const resp = await updateCategory(editCategory.id, reqBody);
      fetchCategories();
    } catch (err) {
      // console.error('Error creating category:', err);
    } finally {
      handleClose();
    }
  };


  return (
    <div className='w-full h-full'>
      <div style={{fontSize:22}}>Categories</div>

      <div className='mt-6 flex items-center'>
        <input placeholder='Add New Category'
          className='p-2 mr-4 w-64 border border-gray-300 rounded outline-none'
          value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
        />
        <input placeholder='category Image Url'
          className='p-2 mr-4 w-64 border border-gray-300 rounded outline-none'
          value={imgUrl} onChange={(e) => setImgUrl(e.target.value)}
        />
        <Button loading={loading} variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={createCategories}>Create</Button>
      </div>

      <div className='my-5 w-full bg-white rounded-lg shadow'>
        <div className='p-4 w-full grid grid-cols-5'>
          <div className='col-span-1 text-lg font-semibold'>No.</div>
          <div className='col-span-3 text-lg font-semibold'>Category</div>
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>

        {categories.map((obj, idx) => (
          <div className='p-4 pb-2 w-full grid grid-cols-5 border-t border-gray-200'>
            <div className='col-span-1'>{idx + 1}</div>
            <div className='col-span-3'>{obj.category}</div>
            <div className='col-span-1 flex'>
              <IconButton size="small" style={{marginRight:10}} onClick={() => handleClickOpen(obj)}>
                <FaEdit size={23}/>
              </IconButton>
              <IconButton size="small" onClick={() => deleteCategories(obj._id)}>
                <MdDelete size={25}/>
              </IconButton>
            </div>
          </div>
        ))}
      </div>


    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Update Category"}
        </DialogTitle>
        <DialogContent>
          <div className='mt-6 flex items-center'>
            <input placeholder='Update Category'
              className='p-2 mr-4 w-64 border border-gray-300 rounded outline-none'
              value={editCategory.data} onChange={(e) => setEditCategory((prev) => ({...prev, data: e.target.value}))}
            />
            <input placeholder='Update Category'
              className='p-2 mr-4 w-64 border border-gray-300 rounded outline-none'
              value={editCategory.url} onChange={(e) => setEditCategory((prev) => ({...prev, url: e.target.value}))}
            />
            <Button loading={loading} variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={updateCategories}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Categories