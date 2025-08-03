import { useState, useEffect } from 'react';
import { getAllProducts } from '../../api/product';
import { createVarient, getAllVarient, updateVarient, deleteVarient } from '../../api/varients';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';


const Varients = () => {
  const [addVarient, setAddVarient] = useState(false);
  const [color, setColor] = useState("#2682de");
  const [form, setForm] = useState({ varient_name: "", productId: "", isSizeAvailable: false, isColorAvailable: false });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [combinationData, setCombinationData] = useState({});
  const [colorImages, setColorImages] = useState({});
  const [varientsArr, setVarientsArr] = useState([]);

  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });
  const [productPages, setProductPages] = useState({ totalPages: 1, currentPage: 1 });
  const [updateProduct, setUpdateProduct] = useState(false);
  const [updatedProductId, setUpdatedProductId] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ category_id: "", vendor_id: "", product_name: "", description: "", price: "", stock: "", isActive: "true", images: ["", "", "", "", ""]});
    if(updateProduct){
      setUpdateProduct(false);
      setUpdatedProductId(null);
    }
  };

  const fetchproductList = async (pageNum) => {
    const reqBody = {
      page:pageNum,
      limit:20
    }

    try {
      const response = await getAllProducts(reqBody);
      if(response && response.data && response.data.success){
        setProductList(response.data.products);
        setProductPages({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
      }
    } catch (err) {}
  };

  const fetchVarientList = async (pageNum) => {
    const reqBody = {
      page: pageNum,
      limit:15
    }

    try {
      const response = await getAllVarient(reqBody);
      if(response && response.data && response.data.success){
        setVarientsArr(response.data.data);
        setPages({ totalPages: response.data.totalPages, currentPage: response.data.page });
      }
    } catch (err) {}
  };

  const handlePagination = (event, value) => {
    setPages((prev) => ({...prev, currentPage: value}));
    fetchVarientList(value);
  };

  const handleProductPagination = (event, value) => {
    setPages((prev) => ({...prev, currentPage: value}));
    fetchproductList(value);
  };

  useEffect(() => {
    fetchproductList(1);
    fetchVarientList(1);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked.toString() : value,
    }));
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...form.images];
    updatedImages[index] = value;
    setForm((prev) => ({...prev, images: updatedImages}));
  };

  const deleteVarients = async (id) => {
    try {
      const resp = await deleteVarient(id);
      if(resp && resp.data && resp.data.success){
        fetchVarientList(pages.currentPage);
      }
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
      description: data.description || "", // assuming not included in data
      price: data.price?.toString() || "",
      stock: data.stock?.toString() || "",
      isActive: data.isActive?.toString() || "true",
      images: paddedImages,
    });
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

  const copyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(color);
    } catch (err) {}
  };

  const getColorImagesArray = () => {
    return Object.entries(colorImages).map(([color, images]) => ({
      color,
      images: images.filter((url) => url.trim() !== ""), // remove empty strings
    }));
  };


  const generateCombinations = () => {
    const result = [];

    selectedSizes.forEach(size => {
      selectedColors.forEach(color => {
        const key = `${color}-${size}`;
        const data = combinationData[key];
        if (data?.price && data?.stock) {
          result.push({
            Size: size,
            Color: color,
            price: data.price,
            stock: data.stock,
          });
        }
      });
    });

    // console.log(result); // final sorted array
    const colorImagesArr = getColorImagesArray();
    handleVarientCreation(result, colorImagesArr);
  };

  const handleVarientCreation = async(combinationArr, colorImagesArr) => {
    const reqBody = {
      varient_name: form.varient_name,
      productId: form.productId,
      Size: selectedSizes,
      Color: selectedColors,
      combinations: combinationArr,
      color_images: colorImagesArr
    }

    try{
      const response = await createVarient(reqBody);
      if(response && response.data){
        // console.log(response);
      }
    }
    catch(err){}
  }

  const editVarient = (obj) => {
    setForm({ varient_name: obj.varient_name, productId: obj.productId, isSizeAvailable: false, isColorAvailable: false });
    setSelectedSizes(obj.Size);
    setSelectedColors(obj.Color);
    setAddVarient(true)
  }

  const handleVarientUpdate = async(combinationArr, colorImagesArr) => {
    const reqBody = {
      varient_name: form.varient_name,
      productId: form.productId,
      Size: selectedSizes,
      Color: selectedColors,
      combinations: combinationArr,
      color_images: colorImagesArr
    }

    try{
      const response = await updateVarient(reqBody);
      if(response && response.data){
        // console.log(response);
      }
    }
    catch(err){}
  }


  return (
    <div className='w-full min-h-full'>
      <div className='flex justify-between items-center'>
        <div style={{fontSize:22}}>Varients</div>
        <Button variant="contained" size="large" sx={{textTransform:"capitalize"}} onClick={() => setAddVarient(true)}>Add New Varient</Button>
      </div>

        {addVarient && (
            <div className="my-5 space-y-5">

            <div className='w-full flex items-center'>  
              <TextField id="outlined-basic" label="Varient Name" variant="outlined" style={{width:"50%"}}
                value={form.varient_name} onChange={(e) => setForm((prev) => ({...prev, varient_name: e.target.value}))}
              />

              <FormControl style={{marginLeft:10, width:"50%"}}>
                <InputLabel id="product-label">Select Product</InputLabel>
                <Select
                  labelId="product-label"
                  name="productId"
                  value={form.productId}
                  label="Select Product"
                  onChange={handleChange}
                >
                  {productList.map((obj) => (
                    <MenuItem key={obj._id} value={obj._id}>
                      {obj.product_name}
                    </MenuItem>
                  ))}

                  <div className='p-4 pb-2 w-full flex justify-center border-t border-gray-200'>
                    <Pagination count={productPages.totalPages} variant="outlined" shape="rounded" onChange={handleProductPagination} />
                  </div>
                </Select>
              </FormControl>
            </div>

            <div>
              <Autocomplete
                multiple
                id="tags-filled"
                freeSolo
                options={selectedSizes.map((size) => size)}
                value={selectedSizes}
                onChange={(event, newValue) => {
                  setSelectedSizes(newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" label="Sizes" placeholder="Sizes" />
                )}
              />
            </div>

            <div>
              <Autocomplete
                multiple
                id="tags-filled"
                freeSolo
                options={selectedColors.map((size) => size)}
                value={selectedColors}
                onChange={(event, newValue) => {
                  setSelectedColors(newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" label="Colors" placeholder="Colors" />
                )}
              />
            </div>

            <div className='flex'>
                <HexColorPicker color={color} onChange={setColor} />
                <div className='ml-6'>
                    <div className={`mb-4 w-52 h-26 rounded-2xl flex justify-center items-center text-lg border border-[#ff9898]`} style={{backgroundColor: color, color: "white", WebkitTextStroke: "1px #ff9898"}}>{color}</div>
                    <Button variant="contained" fullWidth onClick={copyTextToClipboard}>Copy Color</Button>
                </div>
            </div>


            <div className='flex'>
              <div className='w-[100px]'></div>
              {selectedSizes.map((sizeTitle) => (
                <div className='w-[200px]'>
                  {sizeTitle}
                </div>
              ))}
            </div>

            <div className='flex'>
              <div className='w-[100px]'>
                {selectedColors.map((colorTitle) => (
                  <div className='h-[60px] w-[65px]'>
                    <div className='shadow-2xl' style={{backgroundColor: colorTitle, height:40, borderRadius:7, border:"4px solid #e8f7ff"}}></div>
                  </div>
                ))}
              </div>

              {/* {selectedSizes.map((sizeTitle) => (
                <div className='w-[200px]'>
                  {selectedColors.map((colorTitle) => (
                    <div className='mr-4 flex h-[60px]'>
                      <TextField id="outlined-basic" label="Price" variant="outlined" size="small" type="number" />
                      <TextField id="outlined-basic" label="Stock" variant="outlined" size="small" type="number" />
                    </div>
                  ))}
                </div>
              ))} */}

              {selectedSizes.map((sizeTitle) => (
                <div className='w-[200px]' key={sizeTitle}>
                  {selectedColors.map((colorTitle) => {
                    const key = `${colorTitle}-${sizeTitle}`;
                    return (
                      <div className='mr-4 flex h-[60px]' key={key}>
                        <TextField id="outlined-basic" label="Price" variant="outlined" size="small" type="number" value={combinationData[key]?.price || ""}
                          onChange={(e) =>
                            setCombinationData((prev) => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                price: Number(e.target.value),
                              },
                            }))
                          }
                        />
                        <TextField id="outlined-basic" label="Stock" variant="outlined" size="small" type="number"
                          value={combinationData[key]?.stock || ""}
                          onChange={(e) =>
                            setCombinationData((prev) => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                stock: Number(e.target.value),
                              },
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

              {selectedColors.map((color) => (
                <div key={color} className="mb-4">
                  <div className="font-semibold mb-2">Images for {color}:</div>
                  
                  {/* Show existing image URLs */}
                  {(colorImages[color] || []).map((url, index) => (
                    <div key={index} className="mb-2 flex gap-2 items-center">
                      <TextField
                        label={`Image ${index + 1}`}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={url}
                        onChange={(e) => {
                          const updated = [...(colorImages[color] || [])];
                          updated[index] = e.target.value;
                          setColorImages((prev) => ({ ...prev, [color]: updated }));
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const updated = (colorImages[color] || []).filter((_, i) => i !== index);
                          setColorImages((prev) => ({ ...prev, [color]: updated }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  {/* Add new image input if less than 5 */}
                  {(colorImages[color]?.length || 0) < 5 && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        const updated = [...(colorImages[color] || []), ""];
                        setColorImages((prev) => ({ ...prev, [color]: updated }));
                      }}
                    >
                      Add Image
                    </Button>
                  )}
                </div>
              ))}


            {updateProduct ? (
              <Button variant="contained"fullWidth size="large" sx={{textTransform:"capitalize"}} onClick={updateSelectedProduct}>Update Varient</Button>
            ) : (
              <Button variant="contained"fullWidth size="large" sx={{textTransform:"capitalize"}} onClick={generateCombinations}>Create Varient</Button>
            )}
          </div>
        )}

      <div className='my-5 w-full bg-white rounded-lg shadow'>
        <div className='p-4 w-full grid grid-cols-7'>
          <div className='col-span-1 text-lg font-semibold'>No.</div>
          <div className='col-span-3 text-lg font-semibold'>Varient Name</div>
          {/* <div className='col-span-1 text-lg font-semibold'>Price</div>
          <div className='col-span-1 text-lg font-semibold'>Stock</div> */}
          <div className='col-span-1 text-lg font-semibold'>Action</div>
        </div>

        {varientsArr.map((obj, idx) => (
          <div className='p-4 pb-2 w-full grid grid-cols-7 border-t border-gray-200'>
            <div className='col-span-1'>{idx + 1}</div>
            <div className='col-span-3'>{obj.varient_name}</div>
            {/* <div className='col-span-1'>{obj.price}</div>
            <div className='col-span-1'>{obj.stock}</div> */}
            <div className='col-span-1 flex'>
              <IconButton size="small" style={{marginRight:10}} onClick={() => editVarient(obj)}>
                <FaEdit size={23}/>
              </IconButton>
              <IconButton size="small" onClick={() => deleteVarients(obj._id)}>
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

export default Varients
