import gql from "graphql-tag";

export default gql(`
query ($limit: Int, $nextToken: String, $companyID: ID) {
  listReOrderRules(limit: $limit,
    nextToken: $nextToken, 
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