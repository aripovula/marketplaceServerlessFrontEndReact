const usersCompanyReducer = (state, action) => {
    switch (action.type) {
        case 'GET_COMPANY_ID':
            return action.companyID
        case 'SET_COMPANY_ID':
            return [
                ...state,
                { companyID: action.companyID }
            ]
        default:
            return state
    }
}

export { usersCompanyReducer as default }