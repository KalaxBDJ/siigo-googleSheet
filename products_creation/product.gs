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
            "name": name,
            "account_group": accountGroup,
            "stock_control": true,
            "active": true,
            "available_quantity": amount,
            "tax_consumption_value": 19,
            "unit_label": unitLabel,
            "reference": reference,
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