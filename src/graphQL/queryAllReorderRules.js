import gql from "graphql-tag";

export default gql(`
query {
  listReOrderRules(limit: 100) {
    items {
      companyID
      reorderRuleID
      productID
      product
      maxPrice
      bestOfferType
      secondBestOfferType
      minProductRating
      isRuleEffective
      isCashPayment
      reorderLevel
      reorderQnty
    }
  }
}
`);