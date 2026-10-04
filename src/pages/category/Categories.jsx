import { useState, useEffect } from 'react';
import { createCategory, getAllCategories, deleteCategory, updateCategory } from '../../api/category';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { notifyToaster } from '../../components/notifyToaster';
import PageHeading from '../../components/PageHeading';
import { FiPlus, FiGrid, FiFolder } from 'react-icons/fi';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [fetchError, setFetchError] = useState('');
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
    setFetchError('');
    try {
      const response = await getAllCategories();
      if (!Array.isArray(response.data)) {
        throw new Error('The server returned an invalid category list. Please contact the site administrator.');
      }
      setCategories(response.data);
    } catch (err) {
      setFetchError(err.message || 'Unable to load categories. Please try again.');
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
      notifyToaster("New category added.");
      setNewCategory("");
      setImgUrl("");
      fetchCategories();
    } catch (err) {
      if(err?.response?.data?.message){
        notifyToaster(err?.response?.data?.message);
      }
      else{
        notifyToaster("Something went wrong!");
      }
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
      if(resp && resp.data){
        notifyToaster("Category updated successfully.");
      }
      fetchCategories();
    } catch (err) {
      if(err?.response?.data?.message){
        notifyToaster(err?.response?.data?.message);
      }
      else{
        notifyToaster("Something went wrong!");
      }
    } finally {
      handleClose();
    }
  };


  return (
    <div className='w-full h-full'>
      <PageHeading title="Categories" description="A little organization. A better shopping experience." />

      {fetchError && <div role="alert" className="form-card" style={{ marginBottom: 20 }}>
        <p>{fetchError}</p>
        <Button onClick={fetchCategories}>Retry</Button>
      </div>}

      <div className="form-card category-create">
        <div className="form-card-heading"><span className="section-icon"><FiPlus /></span><div><h2>Create a category</h2><p>Give your products a place to belong.</p></div></div>
        <div className="category-fields">
        <label className="field-label">Category name
        <input placeholder='e.g. Handmade ceramics'
          className='ui-input'
          value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
        />
        </label>
        <label className="field-label">Image URL
        <input placeholder='https://example.com/image.jpg'
          className='ui-input'
          value={imgUrl} onChange={(e) => setImgUrl(e.target.value)}
        />
        </label>
        <Button loading={loading} startIcon={<FiPlus />} variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={createCategories}>Create category</Button>
        </div>
      </div>

      <div className="collection-heading"><div><FiGrid /><h2>All categories</h2><span className="count-badge">{categories.length}</span></div><p>Your catalog, organized</p></div>
      <div className='data-table my-5 w-full bg-white rounded-lg shadow'>
        <div className='p-4 w-full grid grid-cols-5'>
          <div className='col-span-1 text-lg font-semibold'>No.</div>
          <div className='col-span-3 text-lg font-semibold'>Category</div>
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>

        {categories.map((obj, idx) => (
          <div key={obj._id} className='p-4 pb-2 w-full grid grid-cols-5 border-t border-gray-200'>
            <div className='col-span-1'>{idx + 1}</div>
            <div className='col-span-3 category-name'><span className="category-symbol"><FiFolder /></span>{obj.category}</div>
            <div className='col-span-1 flex'>
              <IconButton aria-label={`Edit ${obj.category}`} size="small" style={{marginRight:10}} onClick={() => handleClickOpen(obj)}>
                <FaEdit size={23}/>
              </IconButton>
              <IconButton aria-label={`Delete ${obj.category}`} className="delete-action" size="small" onClick={() => deleteCategories(obj._id)}>
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
          <div className='dialog-fields'>
            <input aria-label="Category name" placeholder='Category name'
              className='p-2 mr-4 w-64 border border-gray-300 rounded outline-none'
              value={editCategory.data} onChange={(e) => setEditCategory((prev) => ({...prev, data: e.target.value}))}
            />
            <input aria-label="Category image URL" placeholder='Image URL'
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
