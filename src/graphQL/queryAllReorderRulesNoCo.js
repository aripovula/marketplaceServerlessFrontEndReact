import gql from "graphql-tag";

export default gql(`
query GetRules {
  listReOrderRules {
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