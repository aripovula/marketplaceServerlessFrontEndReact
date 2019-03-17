import gql from "graphql-tag";

export default gql(`
query ($companyID: companyID) {
  listReOrderRules(
    filter: {
      companyID: {
        eq: $companyID
      }
    }
    ) {
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
    nextToken
  }
}
`);