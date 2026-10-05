import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import { addImage, deleteImage, getAllImages, updateImage } from '../../api/images';
import { MdDeleteOutline } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import PageHeading from '../../components/PageHeading';
import { notifyToaster } from '../../components/notifyToaster';


const ImageScreen = () => {
    const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });
    const [title, setTitle] = useState("image");
    const [image, setImage] = useState(null);
    const [imgArr, setImgArr] = useState([]);
    const [imageId, setImageId] = useState("");
    const [uploading, setUploading] = useState(false);

    const showError = (error) => {
        const data = error.response?.data;
        const message = typeof data?.message === 'string' && !/^\d+$/.test(data.message)
            ? data.message
            : data?.errorType || error.message || 'Unable to upload image. Please try again.';
        notifyToaster(message);
    };


    const fetchAllImages = async(pageNum) => {
        const reqBody = { page: pageNum, limit:30 }
        try{
            const resp = await getAllImages(reqBody);
            if(resp && resp.data && resp.data.success){
                setImgArr(resp.data.data);
                setPages({ currentPage: resp.data.currentPage, totalPages: resp.data.totalPages })
            }
        }
        catch(err){}
    }

    const handlePagination = (event, value) => {
        setPages((prev) => ({...prev, currentPage: value}));
        fetchAllImages(value);
    };

    useEffect(() => {
        fetchAllImages(1);
    }, [])

    const removeImage = async(imgId) => {
        try{
            const resp = await deleteImage(imgId);
            if(resp && resp.data){
                fetchAllImages(1);
            }
        }
        catch(err){}
    }

    const editImage = async(imgId, imgTitle) => {
        setImageId(imgId);
        setTitle(imgTitle);
    }

    const handleUpdateImage = async () => {
        const formData = new FormData();
        formData.append("title", title);
        if (image) formData.append("image", image);

        try {
            const response = await updateImage(imageId, formData);
            if(response && response.data && response.data.success){
                setTitle("");
                setImageId("");
                setImage(null);
                fetchAllImages(1);
            }
        } catch (error) { showError(error); }
    }

    const handleSubmit = async () => {
        if (uploading) return;
        if (!title.trim()) {
            notifyToaster('Enter an image name.');
            return;
        }
        if (!imageId && !image) {
            notifyToaster('Choose an image to upload.');
            return;
        }

        setUploading(true);
        if(imageId){
            try { await handleUpdateImage(); }
            finally { setUploading(false); }
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append("title", title);
        formData.append("image", image); // image is a File object

        try {
            const response = await addImage(formData);
            if(response && response.data && response.data.success){
                setTitle("");
                setImage(null);
                fetchAllImages(1);
            }
        } catch (error) { showError(error); }
        finally { setUploading(false); }
    };

    const copyUrlToClipboard = async (imageUrl) => {
        try {
        await navigator.clipboard.writeText(imageUrl);
        } catch (err) {}
    };

    return (
        <div className='w-full min-h-full'>
            <PageHeading title="Image library" description="A home for your visuals. Select an image to copy its URL." />

            <div className='form-card upload-panel'>
                <TextField id="outlined-basic" label="Image Name" size='small' variant="outlined" style={{width:250, marginRight:20}} value={title} onChange={(e) => setTitle(e.target.value)} />

                <input
                    aria-label="Choose an image to upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="mr-8 block text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />

                <Button loading={uploading} variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={handleSubmit}>{imageId ? "Update Image" : "Upload Image"}</Button>
            </div>

            <div className='image-grid'>
                {imgArr.map((obj) => (
                    <div className='image-card' key={obj._id}>
                        <button type="button" aria-label={`Copy URL for ${obj.title}`} onClick={() => copyUrlToClipboard(obj.imageUrls)}><img src={obj.imageUrls} alt={obj.title} /></button>
                        <div className='flex justify-between items-center'>
                            <div className='text-center text-sm'>{obj.title}</div>
                            <div>
                                <IconButton aria-label={`Delete ${obj.title}`} onClick={() => removeImage(obj._id)}><MdDeleteOutline /></IconButton>
                                <IconButton aria-label={`Edit ${obj.title}`} onClick={() =>  editImage(obj._id, obj.title)}><FaEdit size={20} /></IconButton>
                            </div>
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

export default ImageScreen
