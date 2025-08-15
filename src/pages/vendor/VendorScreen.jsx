import { useState, useEffect } from 'react';
import { createVendor, deleteVendor, getAllVendors, updateVendor } from '../../api/vendor';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import { notifyToaster } from '../../components/notifyToaster';


const VendorScreen = () => {
  const [form, setForm] = useState({ vendor_name: "", art_type: "", description: "", email: "", mobile_number: "", gender: "", landmark: "", state: "", city: "", country: "" });
  const [imageUrls, setImageUrls] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [newVendor, setNewVendor] = useState(false);
  const [vendorUpdateId, setVendorUpdateId] = useState("");
  const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });
  const [vendorProfile, setVendorProfile] = useState(null);

  const handlePagination = (event, value) => {
    setPages((prev) => ({...prev, currentPage: value}));
    fetchAllVendors(value);
  };

  // Form field change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchAllVendors = async(pageNum) => {
    const reqBody = { page: pageNum, limit: 15 }

    try{
      const resp = await getAllVendors(reqBody);
      if(resp && resp.data){
        setVendorList(resp.data.data);
        setPages({ currentPage: resp.data.page, totalPages: resp.data.totalPages });
      }
    } catch(err){}
  }

  const removeVendor = async(vendorId) => {
    try{
      const resp = await deleteVendor(vendorId);
      if(resp && resp.data){
        fetchAllVendors(pages.currentPage);
      }
    } catch(err){}
  }

  const editVendor = (obj) => {
    setVendorUpdateId(obj._id);
    setNewVendor(true);
    const { art_type, city, country, description, email, gender, landmark, mobile_number, state, vendor_name } = obj;
    setForm((prev) => ({...prev, art_type, city, country, description, email, gender, landmark, mobile_number, state, vendor_name }));
    setImageUrls(obj.imageUrls);
  }

  const handleUpdate = async()  => {
    const { vendor_name, art_type, description, email, mobile_number, gender, landmark, state, city, country } = form;
    if(!vendor_name, !art_type, !description, !email, !mobile_number, !gender, !landmark, !state, !city, !country){
      notifyToaster("Please fill all the details!");
      return;
    }

    if(!vendorProfile){
      notifyToaster(`Please select vendor's profile picture!`);
      return;
    }

    const formData = new FormData();
    formData.append("vendor_name", vendor_name);
    formData.append("art_type", art_type);
    formData.append("description", description);
    formData.append("email", email);
    formData.append("mobile_number", mobile_number);
    formData.append("gender", gender);
    formData.append("landmark", landmark);
    formData.append("state", state);
    formData.append("city", city);
    formData.append("country", country);
    formData.append("images", vendorProfile);

    try{
      const res = await updateVendor(vendorUpdateId, formData);
      if(res && res.data && res.data.success){
        // console.log("Success:", res.data);
        notifyToaster("Vendor Updated successfully.");
        fetchAllVendors(1);
        setVendorProfile(null);
        setVendorUpdateId("");
        setNewVendor(false);
        setForm({ vendor_name: "", art_type: "", description: "", email: "", mobile_number: "", gender: "", landmark: "", state: "", city: "", country: "" });
      }
    }
    catch(err){
      if(err?.response?.data?.message){
        notifyToaster(err?.response?.data?.message);
      }
      else{
        notifyToaster("Something went wrong, Please try again later!");
      }
    }
  }

  const addVendor = async()  => {
    const { vendor_name, art_type, description, email, mobile_number, gender, landmark, state, city, country } = form;
    if(!vendor_name, !art_type, !description, !email, !mobile_number, !gender, !landmark, !state, !city, !country){
      notifyToaster("Please fill all the details!");
      return;
    }

    if(!vendorProfile){
      notifyToaster(`Please select vendor's profile picture!`);
      return;
    }

    const formData = new FormData();
    formData.append("vendor_name", vendor_name);
    formData.append("art_type", art_type);
    formData.append("description", description);
    formData.append("email", email);
    formData.append("mobile_number", mobile_number);
    formData.append("gender", gender);
    formData.append("landmark", landmark);
    formData.append("state", state);
    formData.append("city", city);
    formData.append("country", country);
    formData.append("images", vendorProfile);

    try{
      const res = await createVendor(formData);
      if(res && res.data && res.data.success){
        // console.log("Success:", res.data);
        notifyToaster("Vendor added successfully.");
        fetchAllVendors(1);
        setVendorProfile(null);
        setForm({ vendor_name: "", art_type: "", description: "", email: "", mobile_number: "", gender: "", landmark: "", state: "", city: "", country: "" });
      }
    }
    catch(err){
      if(err?.response?.data?.message){
        notifyToaster(err?.response?.data?.message);
      }
      else{
        notifyToaster("Something went wrong, Please try again later!");
      }
    }
  }

  useEffect(() => {
    fetchAllVendors(1);
  }, [])


  return (
    <div className='w-full min-h-full'>
      <div className='flex justify-between items-center'>
        <div style={{fontSize:22}}>Vendors</div>
        <Button variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={() => {
          setNewVendor(prev => !prev);
          if(newVendor){
            setForm({ vendor_name: "", art_type: "", description: "", email: "", mobile_number: "", gender: "", landmark: "", state: "", city: "", country: "" });
          }
          }}>{newVendor ? "Cancel" : "Add New Vendor"}</Button>
      </div>

      {newVendor && (
        <div className="mx-auto mt-8 p-6">
        <h2 className="text-2xl font-semibold mb-6">Add Vendor</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField label="Vendor Name" name="vendor_name" value={form.vendor_name} onChange={handleChange} fullWidth/>
            <TextField label="Art Type" name="art_type" value={form.art_type} onChange={handleChange} fullWidth/>
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField label="Mobile Number" name="mobile_number" value={form.mobile_number} onChange={handleChange} fullWidth />
            <TextField label="Gender" name="gender" value={form.gender} onChange={handleChange} fullWidth />
            <TextField label="Landmark" name="landmark" value={form.landmark} onChange={handleChange} fullWidth />
            <TextField label="State" name="state" value={form.state} onChange={handleChange} fullWidth />
            <TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth />
            <TextField label="Country" name="country" value={form.country} onChange={handleChange} fullWidth />
          </div>

          <TextField label="Description" name="description" multiline rows={3} fullWidth
            value={form.description} onChange={handleChange}
          />

            <div className="mt-4 space-y-3">
              <p className="font-medium text-gray-700">Upload Vendor Profile</p>
              <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVendorProfile(e.target.files[0])}
                    className="mr-8 block text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
          </div>

          <Button variant="contained" color="primary" onClick={() => {
            if(vendorUpdateId){
              handleUpdate();
            }
            else{
              addVendor();
            }
          }}>Submit Vendor</Button>
        </div>
      </div>
      )}


    <div className='my-5 w-full bg-white rounded-lg shadow'>
        <div className='p-4 w-full grid grid-cols-5'>
          <div className='col-span-1 text-lg font-semibold'>No.</div>
          <div className='col-span-3 text-lg font-semibold'>Vendor Name</div>
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>

        {vendorList.map((obj, idx) => (
          <div className='p-4 pb-2 w-full grid grid-cols-5 border-t border-gray-200'>
            <div className='col-span-1'>{idx + 1}</div>
            <div className='col-span-3'>{obj.vendor_name}</div>
            <div className='col-span-1 flex'>
              <IconButton size="small" style={{marginRight:10}} onClick={() => editVendor(obj)}>
                <FaEdit size={23}/>
              </IconButton>
              <IconButton size="small" onClick={() => removeVendor(obj._id)}>
                <MdDelete size={25}/>
              </IconButton>
            </div>
          </div>
        ))}

        <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
          <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
        </div>
      </div>
    </div>
  )
}

export default VendorScreen
