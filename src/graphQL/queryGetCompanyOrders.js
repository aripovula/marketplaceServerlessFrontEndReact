import gql from "graphql-tag";

export default gql(`
query ($id: ID!) {
  getCompany(id: $id) {
    id
    name
    creditRating
    status
    orders {
      items {
        companyID
        orderID
        productID
        status
        note
        dealPrice
        maxPrice
        quantity
        bestOfferType
        secondBestOfferType
        minProductRating
        isCashPayment
        product {
          id,
          name
          modelNo
          specificationURL
          imageURL
          lastTenRatingAverage
        }
      }
    },
    reOrderRules {
      items {
        companyID
        reorderRuleID
        productID
        maxPrice
        bestOfferType
        secondBestOfferType
        minProductRating
        isRuleEffective
        isCashPayment
        reorderLevel
        reorderQnty
        product {
          id,
          name
          modelNo
          specificationURL
          imageURL
          lastTenRatingAverage
        }
      }
    }

  }
}
`);
