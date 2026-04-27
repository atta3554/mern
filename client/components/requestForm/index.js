export default function requestForm() {
    

    return (
        <DashboardRoutes>
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
        </DashboardRoutes>
    )
}