function createProductSiigo(code, brand, name, barcode, price, unitLabel, accountGroup, type, model, reference, amount, rowNumber) {
    let siigoId = ''
    try {
        //Get Account Group object from siigo
        ag = getAccountGroup(accountGroup)

        //If account group not exists in siigo throw error.
        if (ag.length === 0) {
            throw new Error('Account Group does not exists yet in Siigo.')
        }

        //Extract account group id to create product.
        accountGroup = ag[0].id

        //Create siigo object body structure.
        let siigoObject = {
            "code": code,
            "name": removeSpecialChars(name),
            "account_group": accountGroup,
            "stock_control": true,
            "active": true,
            "available_quantity": amount,
            "tax_consumption_value": 19,
            "unit_label": unitLabel,
            "reference": removeSpecialChars(reference),
            "additional_fields": {
                "barcode": barcode,
                "brand": brand,
                "model": `${model} | ${type}`
            }
        }

        if (price) {
            siigoObject = {
                ...siigoObject,
                "prices": [
                    {
                        "currency_code": "COP",
                        "price_list": [
                            {
                                "position": 1,
                                "value": price
                            }
                        ]
                    }
                ]
            }
        }

        //Set up siigo request to Create product
        const url = `https://api.siigo.com/v1/products`;
        const options = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Partner-Id': 'appsheetIntegration',
                'Authorization': `Bearer ${token}`,

            },
            payload: JSON.stringify(siigoObject)
        };

        const response = UrlFetchApp.fetch(url, options)

        //Validate if HTTP code is different of 201 (Created)
        if (response.getResponseCode() !== 201) {
            throw new Error(`An error occurred, HTTP Code ${response.getResponseCode()}`)
        }
        siigoId = JSON.parse(response.getContentText()).id
        console.log(siigoId)
    } catch (err) {
        console.error(err)
    }
    return {
        siigoId: siigoId
    }
}


function checkIfProductExistsInApi(code) {
    let siigoId = ''

    try {
        const url = `https://api.siigo.com/v1/products?code=${code}`;
        const options = {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Partner-Id': 'appsheetIntegration',
                'Authorization': `Bearer ${token}`
            },
        };
        const response = UrlFetchApp.fetch(url, options)
        if (response.getResponseCode() !== 200) {
            throw new Error(`An error occurred, HTTP Code ${response.getResponseCode()}`)
        }
        siigoId = JSON.parse(response.getContentText())?.results[0]?.id
    } catch (err) {
        console.error(err)
    }
    return siigoId
}



function updateSiigoProduct(code, accountGroup, type, model, reference, brand, name, model, barcode, price, unitLabel, id, amount, rowNumber) {
    let siigoId = ''
    try {
        if (!id) {
            siigoId = checkIfProductExistsInApi(code)

            if (!siigoId) {
                siigoId = createProductSiigo(code, brand, name, barcode, price, unitLabel, accountGroup, type, model, reference, amount);
            }

            // If siigoId is still undefined, throw an error
            if (!siigoId) {
                throw new Error('Failed to create product in Siigo');
            }

            return siigoId;
        }

        //Get Account Group object from siigo
        ag = getAccountGroup(accountGroup)

        //If account group not exists in siigo throw error.
        if (ag.length === 0) {
            throw new Error('Account Group does not exists yet in Siigo.')
        }

        //Extract account group id to create product.
        accountGroup = ag[0].id

        //Create siigo object body structure.
        let siigoObject = {
            "code": code,
            "name": removeSpecialChars(name),
            "account_group": accountGroup,
            "stock_control": true,
            "available_quantity": amount,
            "tax_consumption_value": 19,
            "unit_label": unitLabel,
            "reference": removeSpecialChars(reference),
            "additional_fields": {
                "barcode": barcode,
                "brand": brand,
                "model": `${model} | ${type}`
            }
        }

        if (price) {
            siigoObject = {
                ...siigoObject,
                "prices": [
                    {
                        "currency_code": "COP",
                        "price_list": [
                            {
                                "position": 1,
                                "value": price
                            }
                        ]
                    }
                ]
            }
        }

        const url = `https://api.siigo.com/v1/products/${id}`;

        const options = {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Partner-Id': 'appsheetIntegration',
                'Authorization': `Bearer ${token}`,

            },
            payload: JSON.stringify(siigoObject)
        };

        const response = UrlFetchApp.fetch(url, options)

        //Validate if HTTP code is different of 200 (Updated)
        if (response.getResponseCode() !== 200) {
            throw new Error(`An error occurred, HTTP Code ${response.getResponseCode()}`)
        }
        siigoId = JSON.parse(response.getContentText()).id
        console.log(siigoId)
    } catch (err) {
        console.error(err)
    }
    return {
        siigoId: siigoId
    }
}

function getAccountGroup(accountGroup) {
    //Set up request to get account groups
    const url = `https://api.siigo.com/v1/account-groups`;
    const options = {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Partner-Id': 'appsheetIntegration',
            'Authorization': `Bearer ${token}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const ags = JSON.parse(response.getContentText());

        //Filter account group to return only the account group with the desired name.
        //Returns empty if doesn't exist.
        accountGroupFiltered = ags.filter(ag => {
            return ag.name.toLowerCase().includes(accountGroup.split(":").shift() + ':')
        })
        return accountGroupFiltered;
    } catch (error) {
        console.error('Error fetching', error);
        return null;
    }
}