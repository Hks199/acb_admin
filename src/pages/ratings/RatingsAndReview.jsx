import PageHeading from '../../components/PageHeading';
import { useState, useEffect } from 'react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import {
  Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  Rating, Autocomplete, Pagination, TextField,
} from '@mui/material';
import { getProductsByCategoryId } from '../../api/product';
import { getAllCategories } from '../../api/category';
import {
  getReviewsByProductId, deleteReview, addAdminReview, deleteAdminReview,
} from '../../api/ratings';
import { notifyToaster } from '../../components/notifyToaster';

const emptyForm = { customerName: '', rating: 5, review: '' };
const customerName = (review) => review.customerName || review.customerId?.first_name || 'Unknown customer';

const RatingsAndReview = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(1);
  const [productList, setProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const productId = selectedProduct?._id || '';
  const categoryId = selectedCategory?._id || '';

  useEffect(() => {
    let active = true;
    getAllCategories().then(({ data }) => {
      if (active) setCategories(data);
    }).catch((error) => {
      if (!active) return;
      const message = error.response?.data?.message || 'Unable to load categories. Please refresh the page.';
      setCategoriesError(message);
      notifyToaster(message);
    }).finally(() => { if (active) setCategoriesLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    let active = true;
    setProductsLoading(true);
    setProductsError('');
    getProductsByCategoryId({ category_id: categoryId, page: productPage, limit: 15 }).then(({ data }) => {
      if (active && data.success) {
        setProductList(data.products);
        setProductPages(Math.max(1, data.totalPages));
      }
    }).catch((error) => {
      if (!active) return;
      setProductList([]);
      setProductPages(1);
      if (error.response?.status !== 404) {
        const message = error.response?.data?.message || 'Unable to load products. Please refresh the page.';
        setProductsError(message);
        notifyToaster(message);
      }
    }).finally(() => { if (active) setProductsLoading(false); });
    return () => { active = false; };
  }, [categoryId, productPage]);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    setLoading(true);
    getReviewsByProductId(productId, { page, limit: 20 }).then(({ data }) => {
      if (active && data.success) {
        const lastPage = Math.max(1, data.totalPages);
        setTotalPages(lastPage);
        if (page > lastPage) setPage(lastPage);
        else setReviews(data.reviews);
      }
    }).catch((error) => {
      if (!active) return;
      setReviews([]);
      setTotalPages(1);
      if (error.response?.status === 404) setPage(1);
      else notifyToaster(error.response?.data?.message || 'Unable to load reviews.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId, page, refresh]);

  const handleError = (error) => {
    notifyToaster(error.response?.data?.message || error.message || 'Something went wrong.');
  };

  const createReview = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!productId || !form.customerName.trim() || !form.review.trim() ||
        !Number.isInteger(form.rating) || form.rating < 1 || form.rating > 5) {
      notifyToaster('Enter a customer name, a rating from 1 to 5, and review text.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await addAdminReview({ productId, ...form, customerName: form.customerName.trim(), review: form.review.trim() });
      setAddOpen(false);
      setForm(emptyForm);
      setPage(Math.max(1, Math.ceil(data.totalReviews / 20)));
      setRefresh((value) => value + 1);
      notifyToaster('Review added successfully.');
    } catch (error) { handleError(error); }
    finally { setSaving(false); }
  };

  const removeReview = async () => {
    if (saving || !selectedReview) return;
    const customerId = selectedReview.customerId?._id || selectedReview.customerId;
    if (!customerId) {
      notifyToaster('This review has no customer ID and cannot be deleted.');
      return;
    }
    setSaving(true);
    try {
      const remove = selectedReview.isAdminReview ? deleteAdminReview : deleteReview;
      await remove(productId, customerId);
      setSelectedReview(null);
      setRefresh((value) => value + 1);
      notifyToaster('Review deleted successfully.');
    } catch (error) { handleError(error); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="page-toolbar">
        <PageHeading title="Ratings & reviews" description="Listen to your customers. Care for your community." section="Store management" />
        <div className="flex flex-wrap gap-2">
          <Button variant="contained" disabled={!productId} onClick={() => {
            setForm(emptyForm);
            setAddOpen(true);
          }}>Add review</Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Autocomplete
            id="review-category"
            options={categories}
            value={selectedCategory}
            loading={categoriesLoading}
            disabled={categoriesLoading}
            getOptionLabel={(category) => category.category || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            noOptionsText="No categories found"
            onChange={(_, category) => {
              if (category?._id === selectedCategory?._id) return;
              setSelectedCategory(category);
              setSelectedProduct(null);
              setProductList([]);
              setProductPage(1);
              setProductPages(1);
              setProductsLoading(Boolean(category));
              setProductsError('');
              setReviews([]);
              setPage(1);
              setTotalPages(1);
              setLoading(false);
              setSelectedReview(null);
            }}
            renderInput={(params) => <TextField {...params} label="Select Category" error={Boolean(categoriesError)}
              helperText={categoriesError || (categoriesLoading ? 'Loading categories...' : 'Choose a category first.')} />}
          />
          <Autocomplete
            id="review-product"
            options={productList}
            value={selectedProduct}
            loading={productsLoading}
            disabled={!categoryId || productsLoading}
            getOptionLabel={(product) => product.product_name || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            noOptionsText="No matching products on this page"
            onChange={(_, product) => {
              if (product?._id === selectedProduct?._id) return;
              setSelectedProduct(product);
              setReviews([]);
              setPage(1);
              setTotalPages(1);
              setLoading(Boolean(product));
              setSelectedReview(null);
            }}
            renderInput={(params) => <TextField {...params} label="Select Product" error={Boolean(productsError)}
              helperText={productsError || (!categoryId ? 'Choose a category to load its products.' : productsLoading ? 'Loading products...' :
                productList.length === 0 ? 'No products in this category.' : productPages > 1 ? 'Search this page or browse more products below.' : 'Choose a product to manage its reviews.')} />}
          />
        </div>
        {categoryId && productPages > 1 && <div className="mt-3 flex justify-center">
          <Pagination aria-label="Product pages in selected category" count={productPages} page={productPage} disabled={productsLoading}
            onChange={(_, value) => { setProductList([]); setProductsLoading(true); setProductPage(value); }} />
        </div>}
      </div>

      <div className="data-table my-5 w-full bg-white rounded-lg shadow" aria-busy={loading}>
        <div className="p-4 w-full grid grid-cols-5">
          <div className="col-span-1 text-lg font-semibold">No.</div>
          <div className="col-span-2 text-lg font-semibold">Customer Name</div>
          <div className="col-span-1 text-lg font-semibold">Ratings</div>
          <div className="col-span-1 text-lg font-semibold">Action</div>
        </div>
        {loading ? <p className="p-4">Loading reviews...</p> : reviews.length === 0 ? (
          <p className="p-4">{productId ? 'No reviews for this product yet.' : categoryId ? 'Select a product to view or add reviews.' : 'Select a category, then a product to view or add reviews.'}</p>
        ) : reviews.map((entry, index) => (
          <div key={entry.customerId?._id || index} className="p-4 pb-2 w-full grid grid-cols-5 border-t border-gray-200">
            <div className="col-span-1">{(page - 1) * 20 + index + 1}</div>
            <div className="col-span-2">
              {customerName(entry)}
              {entry.isAdminReview && <span className="block text-xs text-gray-500">Admin added</span>}
            </div>
            <div className="col-span-1">{entry.rating} star</div>
            <div className="col-span-1">
              <IconButton size="small" aria-label={`View review by ${customerName(entry)}`} onClick={() => setSelectedReview(entry)}>
                <MdOutlineRemoveRedEye size={23} />
              </IconButton>
            </div>
          </div>
        ))}
        <div className="p-4 pb-2 w-full flex justify-center border-t border-gray-200">
          <Pagination count={totalPages} page={page} variant="outlined" shape="rounded" disabled={!productId || loading} onChange={(_, value) => setPage(value)} />
        </div>
      </div>

      <Dialog open={Boolean(selectedReview)} onClose={() => { if (!saving) setSelectedReview(null); }} fullWidth maxWidth="sm" aria-labelledby="review-title">
        <DialogTitle id="review-title">Product Review</DialogTitle>
        <DialogContent>
          <p className="mb-3">{selectedReview && customerName(selectedReview)}</p>
          <Rating value={selectedReview?.rating || 0} readOnly />
          <TextField label="Review" value={selectedReview?.review || ''} multiline rows={5} fullWidth margin="normal" slotProps={{ input: { readOnly: true } }} />
        </DialogContent>
        <DialogActions>
          <Button disabled={saving} onClick={() => setSelectedReview(null)}>Close</Button>
          <Button variant="contained" color="error" disabled={saving} onClick={removeReview}>{saving ? 'Deleting...' : 'Delete this review'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addOpen} onClose={() => { if (!saving) setAddOpen(false); }} fullWidth maxWidth="sm" aria-labelledby="add-review-title">
        <form onSubmit={createReview}>
          <DialogTitle id="add-review-title">Add product review</DialogTitle>
          <DialogContent>
            <p className="mb-4">{selectedProduct?.product_name}</p>
            <TextField label="Customer name" value={form.customerName} onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))} fullWidth required margin="normal" disabled={saving} slotProps={{ htmlInput: { maxLength: 100 } }} />
            <div className="mt-3 mb-1" id="new-rating-label">Product rating</div>
            <Rating aria-labelledby="new-rating-label" value={form.rating} disabled={saving} onChange={(_, value) => setForm((prev) => ({ ...prev, rating: value }))} />
            <TextField label="Review" value={form.review} onChange={(event) => setForm((prev) => ({ ...prev, review: event.target.value }))} multiline rows={5} fullWidth required margin="normal" disabled={saving} slotProps={{ htmlInput: { maxLength: 5000 } }} />
          </DialogContent>
          <DialogActions>
            <Button disabled={saving} onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save review'}</Button>
          </DialogActions>
        </form>
      </Dialog>

    </div>
  );
};

export default RatingsAndReview;
