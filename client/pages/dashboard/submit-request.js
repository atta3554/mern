import ProtectedDashboardLayout from "@/components/wrappers/users/ProtectedDashboardLayout.js"
import { Context } from "@/context";
import { useContext, useEffect, useRef, useState } from "react";
import { CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import { handleFetch } from "@/lib/request";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "antd";

const SubmitRequest = () => {

    const {state: {user, authReady}} = useContext(Context);
    const location = user?.requesterProfile?.location || null

    const router = useRouter();

    const inputRef = useRef(null);

    const MAX_FILES = 5;
    const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    const [requestTitle, setRequestTitle] = useState('')
    const [requestDesc, setRequestDesc] = useState('')
    const [requestImages, setRequestImages] = useState([]);
    const [userCategoryCode, setUserCategoryCode] = useState('');
    const [userCategoryName, setUserCategoryName] = useState('');
    const [showCats, setShowCats] = useState(false);
    const [catsSpinner, setCatsSpinner] = useState(false);
    const [existingCats, setExistingCats] = useState([]);
    const [userLocationSource, setUserLocationSource] = useState('default');
    const [userCountry, setUserCountry] = useState(location?.country || '')
    const [existingCountries, setExistingCountries] = useState([]);
    const [existingCountriesSpinner, setExistingCountriesSpinner] = useState(false);
    const [userProvince, setUserProvince] = useState(location?.province || '')
    const [existingProvinces, setExistingProvinces] = useState([]);
    const [existingProvincesSpinner, setExistingProvincesSpinner] = useState(false);
    const [userCity, setUserCity] = useState(location?.city || '')
    const [existingCities, setExistingCities] = useState([]);
    const [existingCitiesSpinner, setExistingCitiesSpinner] = useState(false);
    const [btnSpinner, setBtnSpinner] = useState(false);
    const globalFetchFailureMsg = "something went wrong! check your network connectivity";

    // populate current user location states from context
    useEffect(()=> {
        if(location) {
            setUserCountry(location.country);
            setUserProvince(location.province);
            setUserCity(location.city);
        } else if(user && !location) {
            router.replace('/dashboard/edit-profile?location=false');
        }
    }, [user])

    //fetch and show location fields if user choosed custom location
    useEffect(()=> {
        
        if(userLocationSource === 'default') return;

        if(userLocationSource === 'custom' && (existingCountries.length > 0 && existingProvinces.length > 0 && existingCities.length > 0)) return;

        (async ()=> {
            try {
                setExistingCountriesSpinner(true);
                setExistingProvincesSpinner(true);
                setExistingCitiesSpinner(true);

                if(existingCountries.length === 0) {
                    handleFetch(setExistingCountriesSpinner, '/api/get-countries', {}, globalFetchFailureMsg, setExistingCountries)
                }

                if(existingProvinces.length === 0) {
                    const provinceFetchConfig = {
                        method: "POST",
                        body: JSON.stringify({country: userCountry})
                    }
                    handleFetch(setExistingProvincesSpinner, '/api/get-provinces', provinceFetchConfig, globalFetchFailureMsg, setExistingProvinces)
                }

                const cityFetchConfig = {
                    method: "POST",
                    body: JSON.stringify({province: userProvince})
                }
                handleFetch(setExistingCitiesSpinner, '/api/get-cities', cityFetchConfig, globalFetchFailureMsg, setExistingCities)

            } catch(err) {
                toast.error('something went wrong! please try again later');
            }
        })()

    }, [userLocationSource])

    //update province lists based on country list
    useEffect(()=> {
        
        if(!existingCountries.length) {
            setExistingProvinces([]);
            setExistingCities([]);
            return
        }

        if(userCountry) {
            const fetchConfig = {
                method: "POST",
                body: JSON.stringify({country: userCountry})
            }
            handleFetch(setExistingProvincesSpinner, '/api/get-provinces', fetchConfig, globalFetchFailureMsg, setExistingProvinces)
        }

    }, [existingCountries])

    //update city list based on province list
    useEffect(()=> {
        
        if(!existingProvinces.length) {
            setExistingCities([]);
            return;
        }

        if(userProvince) {
            const cityFetchConfig = {
                method: "POST",
                body: JSON.stringify({province: userProvince})
            }
            handleFetch(setExistingCitiesSpinner, '/api/get-cities', cityFetchConfig, globalFetchFailureMsg, setExistingCities)
        }

    }, [existingProvinces])

    //fetch existing provinces based on user selected country
    useEffect( () => {

        if(!userCountry) {
            setUserProvince('');
            setUserCity('');
            setExistingProvinces([]);
            setExistingCities([]);
            return
        }

        const fetchConfig = {
            method: "POST",
            body: JSON.stringify({country: userCountry})
        }

        handleFetch(setExistingProvincesSpinner, '/api/get-provinces', fetchConfig, globalFetchFailureMsg, setExistingProvinces)

    }, [userCountry]);

    //fetch existing cities based on user selected province
    useEffect(()=> {

        if(!userProvince) {
            setUserCity('');
            setExistingCities([]);
            return;
        }

        const fetchConfig = {
            method: "POST",
            body: JSON.stringify({province: userProvince})
        }

        handleFetch(setExistingCitiesSpinner, '/api/get-cities', fetchConfig, globalFetchFailureMsg, setExistingCities)
        
    }, [userProvince])

    //revoke images urls on unmounting
    useEffect(() => {
        return () => {
            requestImages.forEach(img => URL.revokeObjectURL(img.preview));
        }
    }, [])

    //handle categories
    const handleCatsOpen = async e => {
        setShowCats(true)
        if(existingCats.length === 0) handleFetch(setCatsSpinner, '/api/get-cats', {}, globalFetchFailureMsg, setExistingCats)
    }

    //set product category on selection
    const selectCat = (e, cat) => {
        e.preventDefault();
        setUserCategoryName(`${cat.name} - ${cat.type}`);
        setUserCategoryCode(cat._id);
        setShowCats(false);
        inputRef.current.blur()
    }

    //handle selected images for request
    const handleReuqestImages = e => {

        const selectedFiles = Array.from(e.target.files || []);

        if(!selectedFiles.length) return

        let unAllowed = selectedFiles.findIndex(img=> !ALLOWED_MIMES.includes(img.type))
        if(unAllowed !== -1) {
            toast.error("only jpg, jpeg, png and webp are allowed");
            e.target.value = ""
            return
        }

        setRequestImages(prev => {
            const remainingSlots = MAX_FILES - prev.length

            if(remainingSlots <= 0) {
                toast.error('maximum 5 images are allowed');
                return prev;
            }

            if(selectedFiles.length > remainingSlots) {
                toast.error('maximum 5 images are allowed');
            }

            const allowedFiles = selectedFiles.slice(0, remainingSlots);

            const newItems = allowedFiles.map(file=> ({
                id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
                file,
                alt: file.name,
                preview: URL.createObjectURL(file)
            }))

            return [...prev, ...newItems];
        })

        e.target.value = "";
    }

    //release image preview url and remove image itself
    const removeImage = (e, id) => {
        setRequestImages(prev=> {
            const itemToRemove = prev.find(image=> image.id === id)
            
            if(itemToRemove) {
                URL.revokeObjectURL(itemToRemove.preview)
            }

            return prev.filter(image=> image.id !== id);

        })
    }

    //handle user request
    const handleUserRequest = async e => {
        e.preventDefault();
        setBtnSpinner(true)

        const formData = new FormData();
        
        formData.append('_id', user._id);
        formData.append('requestTitle', requestTitle);
        formData.append('requestDesc', requestDesc);
        formData.append('category', userCategoryCode);
        formData.append('userLocationSource', userLocationSource);
        formData.append('userCountry', userCountry);
        formData.append('userProvince', userProvince);
        formData.append('userCity', userCity);

        requestImages.forEach(img => formData.append('requestImages', img.file));

        const fetchConfig = {
            method : "POST",
            body: formData,
        }

        try {

            const res = await apiFetch("/api/create-request", fetchConfig);
            const {ok, message} = await res.json();

            if(!res.ok || !ok) {
                toast.error(message)
            } else {
                router.replace('/dashboard/my-requests/' + message);
                return <SyncOutlined Spin />
            }

        } catch {
            toast.error("something went wrong! please try again.");
        }

        setBtnSpinner(false);
        setRequestTitle('')
        setUserCategoryName('')
        setUserCategoryCode('')
        setRequestImages([]);
        setRequestDesc('')
        setUserLocationSource('default');
    }

    return (
        <ProtectedDashboardLayout>
            <div style={{border: "1px solid rgba(0, 0, 0, 0.2)", padding: "20px", borderRadius: "8px", width: '90%', margin: "100px auto"}} className="container">
                <h1 className="register text-center pt-4">enter your credentials</h1>
                <form style={{display: "flex", flexDirection: "column", rowGap: "20px"}} onSubmit={handleUserRequest}>

                    <div className="d-flex column-gap-4 mt-2">
                        <div className="w-50">
                            <label className="d-flex flex-column" htmlFor="title">
                                <span className="mb-2" >what do you need?</span>
                                <input value={requestTitle} onChange={e => setRequestTitle(e.target.value)} type="text" name="title" id="title" placeholder="i need a laptop/plumber..." />
                            </label>
                        </div>
                        <div className="w-50 position-relative">
                            <label className="d-flex flex-column" htmlFor="category">
                                <span className="mb-2">which category your request is in?</span>
                                <input value={userCategoryName} ref={inputRef} onBlur={e=> setShowCats(false)} onFocus={handleCatsOpen} name="category" id="category" readOnly />
                                {showCats && (
                                    <>
                                    <div className="position-absolute start-0 top-100 end-0 rounded">
                                        {catsSpinner && <div className="py-2 bg-white px-3"><SyncOutlined spin /></div>}
                                        {!catsSpinner && existingCats.length > 0 && existingCats.map(cat=> <div className="p-2 bg-cat" role="button" onMouseDown={e=> selectCat(e, cat)} key={cat._id}>{cat.name} - ({cat.type})</div>)}
                                    </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="d-flex column-gap-4 mt-2">
                        <div className="w-25">
                            <label className="mb-2" htmlFor="requestImages">select up to 5 images for your request</label>
                            <input className="mw-100" multiple type="file" id="requestImages" onChange={handleReuqestImages} />
                        </div>
                        <div className="d-flex column-gap-2 w-75">
                            {requestImages.map(image=> (
                                <div key={image.id} className="position-relative">
                                    <Button onClick={e=> removeImage(e, image.id)} className="position-absolute end-0 me-2 mt-2" icon={<CloseCircleOutlined />} />
                                    <Image className="rounded-4" alt={image.alt} src={image.preview} width={150} height={150} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex column-gap-4 mt-2">
                        <div className="w-50">
                            <label className="mb-2" htmlFor="location">where do you need this product/service?</label>
                            <select className="p-2 w-100" value={userLocationSource} onChange={e=> setUserLocationSource(e.target.value)} name="location" id="location">
                                <option value="default">my current location</option>
                                <option value="custom">custom location</option>
                            </select>
                        </div>
                        {userLocationSource === 'custom' && (
                            <div className="d-flex w-50 flex-column row-gap-1">
                                <label htmlFor="country">select your Country</label>
                                    {existingCountriesSpinner && !existingCountries.length && <SyncOutlined spin />}
                                    {existingCountries.length > 0 && !existingCountriesSpinner && (
                                        <select className="p-2" value={userCountry} onChange={e=> setUserCountry(e.target.value)} name="country" id="country">
                                            <option value="">select your country</option>
                                            {existingCountries.map(country => <option key={country._id} value={country._id}>{country.name}</option>)}
                                        </select>
                                    )}
                            </div>
                        )}
                    </div>

                    {userLocationSource === 'custom' && (
                        <div className="d-flex column-gap-4 mt-2">
                            <div className="d-flex w-50 flex-column row-gap-1">
                                <label htmlFor="province">select your Province</label>
                                    {existingProvincesSpinner && userCountry && !existingProvinces.length && <SyncOutlined spin />}
                                    {!existingProvincesSpinner && (
                                        <select className="p-2" value={userProvince} onChange={e=> setUserProvince(e.target.value)} name="province" id="province" autoComplete="address-level1">
                                            {!userCountry && <option value="">select your country first</option>}
                                            {userCountry && (
                                                <>
                                                <option value="">select your province</option>
                                                {existingProvinces.length > 0 && (
                                                    <>
                                                    {existingProvinces.map(province => <option key={province._id} value={province._id}>{province.name}</option>)}
                                                    </>
                                                )}
                                                </>
                                            )}
                                        </select>
                                    )}
                            </div>
                            <div className="w-50 d-flex flex-column row-gap-1 mt-2">
                                <label htmlFor="city">select your City</label>
                                    {existingCitiesSpinner && userProvince && !existingCities && <SyncOutlined spin />}
                                    {!existingCitiesSpinner && (
                                        <select className="p-2" value={userCity} onChange={e=> setUserCity(e.target.value)} name="city" id="city" autoComplete="address-level2">
                                            {!userCountry && <option value="">select your country first</option>}
                                            {userCountry && !userProvince && <option value="">select your province first</option>}
                                            {userCountry && userProvince && (
                                                <>
                                                <option value="">select your city</option>
                                                {existingCities && existingCities.map(city => <option key={city._id} value={city._id}>{city.name}</option>)}
                                                </>
                                            )} 
                                        </select>
                                    )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="d-flex flex-column" htmlFor="desc">
                            <span className="mb-2" >describe your request in details</span>
                            <textarea className="p-2 rounded" value={requestDesc} onChange={e => setRequestDesc(e.target.value)} type="text" rows={10} name="desc" id="desc" placeholder="tell more about what you need as you can" ></textarea>
                        </label>
                    </div>

                    <button disabled={btnSpinner || !requestTitle || !requestDesc || (userLocationSource === 'custom' && (!userCountry || !userProvince || !userCity))} type="submit" className="btn btn-block btn-primary p-2">
                        {btnSpinner ? <SyncOutlined spin /> : "submit"}
                    </button>
                </form>
            </div>
        </ProtectedDashboardLayout>
    )
}

export default SubmitRequest;