import ProtectedDashboardLayout from "@/components/wrappers/users/ProtectedDashboardLayout";
import { apiFetch } from "@/lib/api";
import { SyncOutlined } from "@ant-design/icons";
import { useState } from "react";

const becomeProvider = () => {

    const [userCategory, setUserCategory] = useState('');
    const [userField, setUserField] = useState('');
    const [existingFields, setExistingFields] = useState('');
    const [fieldsFetchSpinner, setFieldsFetchSpinner] = useState(true)
    const [userprovince, setUserProvince] = useState('');
    const [existingProvinces, setExistingProvinces] = useState('');
    const [usercity, setUserCity] = useState('');
    const [ExistingCities, setExistingCities] = useState('');
    const [userDocs, setUserDocs ] = useState('');
    const [btnSpinner, setBtnSpinner] = useState(false)



    const handleUserCat = async e => {
        setFieldsFetchSpinner(true);
        setUserCategory(e.target.value);

        let fetchConfig = {
            body: JSON.stringify({userCategory})
        }

        const res = await apiFetch('/api/get-cats', fetchConfig);
        const data = await res.json();
        console.log(data);
        
        setExistingFields(data);
        setFieldsFetchSpinner(false);
    }

    const handleUserField = async e => {

    }

    const handleProviderConversion = () => {

    }

    return (
        <ProtectedDashboardLayout>
            <div className="container border rounded p-2 w-50 my-5">
                <h1 className="pt-4">tell us about your field</h1>
                <form className="d-flex flex-column gap-2" onSubmit={handleProviderConversion}>

                    <div className="d-flex row-gap-1 flex-column">
                        <p className="mb-0" >what would you offer to your customers?</p>
                        <label className="" htmlFor="Product">
                            <input className="me-1" value="Product" checked={userCategory === 'Product'} onChange={handleUserCat} type="radio" name="userCategory" id="Product" />
                            Product
                        </label>
                        <label className="" htmlFor="Service">
                            <input className="me-1" value="Service" checked={userCategory === 'Service'} onChange={handleUserCat} type="radio" name="userCategory" id="Service" />
                            Service
                        </label>
                    </div>

                    <div className="d-flex row-gap-1 flex-column mt-2">
                        {userCategory && (
                            <>
                            <p className="mb-0" >select your field</p>
                            {fieldsFetchSpinner ? <SyncOutlined spin /> : existingFields.map(field => <label htmlFor={field.slug} ><input type="radio" checked={userField === field.slug} name="userField" value={field.slug} id={field.slug} onChange={handleUserField} /> {field.name}</label>) }
                            </>
                        )}
                    </div>

                    <div className="d-flex row-gap-1 flex-column mt-2">
                        {userField && (
                            <>
                            <p className="mb-0">select your province</p>
                            {}
                            </>
                        )}
                    </div>

                    <button disabled={!userCategory || !userField} type="submit" className="btn btn-block btn-primary p-2">
                        {btnSpinner ? <SyncOutlined spin /> : "submit"}
                    </button>
                </form>
            </div>
        </ProtectedDashboardLayout>
    )
}

export default becomeProvider;